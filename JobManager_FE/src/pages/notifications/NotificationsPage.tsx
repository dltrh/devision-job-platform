import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/types/notification";
import { NotificationCenter } from "@/components/feature/Notification";
import { useNotifications } from "@/components/feature/Notification/hooks/useNotifications";

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        notifications,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
    } = useNotifications({
        autoRefresh: true,
        refreshInterval: 30000,
        pageSize: 50,
    });

    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            markAsRead(notification.id);

            // Navigate based on notification type
            if (notification.actionUrl) {
                navigate(notification.actionUrl);
            } else {
                switch (notification.type) {
                    case "MATCH_ALERT":
                        if (notification.metadata.applicantId) {
                            navigate(`/applicant-search?id=${notification.metadata.applicantId}`);
                        }
                        break;
                    case "APPLICATION_RECEIVED":
                        if (notification.metadata.jobPostId) {
                            navigate(`/job-posts/${notification.metadata.jobPostId}/applications`);
                        }
                        break;
                    case "SUBSCRIPTION_WARNING":
                    case "SUBSCRIPTION_EXPIRED":
                        navigate("/subscription/plans");
                        break;
                    default:
                        break;
                }
            }
        },
        [navigate, markAsRead]
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <NotificationCenter
                notifications={notifications}
                loading={loading}
                error={error}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onNotificationClick={handleNotificationClick}
                onRefresh={refresh}
            />
        </div>
    );
};

export default NotificationsPage;
