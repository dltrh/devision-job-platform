import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/types/notification";
import { NotificationBell } from "@/components/ui/Notification";
import { NotificationPanel } from "./NotificationPanel";
import { useNotifications } from "../hooks/useNotifications";
import { Crown, Bell } from "lucide-react";

interface NotificationDropdownProps {
    isPremium?: boolean;
    className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    isPremium = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUpgradeTooltip, setShowUpgradeTooltip] = useState(false);
    const navigate = useNavigate();

    // Use fast polling for near real-time updates (every 3 seconds) - only for premium users
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications({
        autoRefresh: isPremium, // Only auto-refresh for premium users
        refreshInterval: 3000, // Poll every 3 seconds for near real-time
    });

    const handleToggle = useCallback(() => {
        if (!isPremium) {
            // For non-premium users, navigate to subscription page
            navigate("/subscription");
            return;
        }
        setIsOpen((prev) => !prev);
    }, [isPremium, navigate]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleViewAll = useCallback(() => {
        setIsOpen(false);
        navigate("/notifications");
    }, [navigate]);

    const handleUpgradeClick = useCallback(() => {
        setIsOpen(false);
        navigate("/subscription");
    }, [navigate]);

    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            // Mark as read
            markAsRead(notification.id);
            setIsOpen(false);

            // Navigate based on notification type
            if (notification.actionUrl) {
                navigate(notification.actionUrl);
            } else {
                // Default navigation based on type
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
                        navigate("/subscription");
                        break;
                    default:
                        // Stay on current page
                        break;
                }
            }
        },
        [navigate, markAsRead]
    );

    // Non-premium users see a locked notification bell with upgrade prompt
    if (!isPremium) {
        return (
            <div
                className={`relative ${className || ""}`}
                onMouseEnter={() => setShowUpgradeTooltip(true)}
                onMouseLeave={() => setShowUpgradeTooltip(false)}
            >
                <button
                    type="button"
                    onClick={handleToggle}
                    className="relative p-2 rounded-full text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all duration-200 cursor-pointer"
                    aria-label="Upgrade to access notifications"
                >
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                </button>

                {/* Upgrade tooltip */}
                {showUpgradeTooltip && (
                    <div className="absolute top-full right-0 mt-2 z-50 w-64 p-3 bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Crown className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Premium Feature
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Upgrade to receive real-time notifications when top talent
                                    matches your job posts.
                                </p>
                                <button
                                    onClick={handleToggle}
                                    className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700"
                                >
                                    Upgrade Now →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`relative ${className || ""}`}>
            <NotificationBell count={unreadCount} onClick={handleToggle} />

            <NotificationPanel
                isOpen={isOpen}
                onClose={handleClose}
                notifications={notifications}
                loading={loading}
                unreadCount={unreadCount}
                isPremium={isPremium}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onViewAll={handleViewAll}
                onNotificationClick={handleNotificationClick}
                onUpgradeClick={handleUpgradeClick}
                position="right"
            />
        </div>
    );
};
