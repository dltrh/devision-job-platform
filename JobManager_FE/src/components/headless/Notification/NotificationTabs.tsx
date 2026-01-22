import { useCallback } from "react";
import {
    HeadlessNotificationTabsProps,
    NotificationTabsRenderProps,
} from "./types";

export const HeadlessNotificationTabs: React.FC<
    HeadlessNotificationTabsProps
> = ({ tabs, activeTab, onTabChange, children }) => {
    const setActiveTab = useCallback(
        (tabId: string) => {
            onTabChange(tabId);
        },
        [onTabChange]
    );

    const isActive = useCallback(
        (tabId: string) => {
            return activeTab === tabId;
        },
        [activeTab]
    );

    const getTabCount = useCallback(
        (tabId: string) => {
            const tab = tabs.find((t) => t.id === tabId);
            return tab?.count ?? 0;
        },
        [tabs]
    );

    const renderProps: NotificationTabsRenderProps = {
        tabs,
        activeTab,
        setActiveTab,
        isActive,
        getTabCount,
    };

    return <>{children(renderProps)}</>;
};
