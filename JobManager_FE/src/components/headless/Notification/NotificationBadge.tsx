import { useMemo } from "react";
import {
    HeadlessNotificationBadgeProps,
    NotificationBadgeRenderProps,
} from "./types";

export const HeadlessNotificationBadge: React.FC<
    HeadlessNotificationBadgeProps
> = ({ count, maxCount = 99, showZero = false, children }) => {
    const hasNotifications = count > 0;
    const isOverMax = count > maxCount;

    const displayCount = useMemo(() => {
        if (count <= 0 && !showZero) {
            return "";
        }
        if (isOverMax) {
            return `${maxCount}+`;
        }
        return count.toString();
    }, [count, maxCount, showZero, isOverMax]);

    const renderProps: NotificationBadgeRenderProps = {
        count,
        displayCount,
        hasNotifications,
        isOverMax,
    };

    return <>{children(renderProps)}</>;
};
