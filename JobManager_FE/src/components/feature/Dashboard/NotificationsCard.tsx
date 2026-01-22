import React from "react";
import { Card, CardHeader } from "../../ui/Card/Card";
import { Skeleton } from "../../ui/Skeleton/Skeleton";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
    isRead: boolean;
    createdAt: string;
    link?: string;
}

interface NotificationsCardProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onViewAll: () => void;
    isLoading?: boolean;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
    notifications,
    onMarkAsRead,
    onViewAll,
    isLoading = false,
}) => {
    return (
        <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Notifications
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    View All
                </button>
            </CardHeader>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton width="80%" height={16} />
                            <Skeleton width="100%" height={12} />
                            <Skeleton width="30%" height={10} />
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No new notifications.
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                        {notifications.map((notif) => (
                            <li
                                key={notif.id}
                                className={`py-4 cursor-pointer hover:bg-gray-50 transition-colors -mx-4 px-4 ${!notif.isRead ? "bg-blue-50/50" : ""}`}
                                onClick={() => onMarkAsRead(notif.id)}
                            >
                                <div className="flex justify-between">
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-medium ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}
                                        >
                                            {notif.title}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(
                                                notif.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="ml-2 flex-shrink-0">
                                            <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};
