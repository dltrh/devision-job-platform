import React, { ReactNode } from "react";
import { useTabs, TabItem } from "./useTabs";

export interface HeadlessTabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
    renderTabList?: (
        tabs: TabItem[],
        activeTab: string,
        setActiveTab: (tabId: string) => void
    ) => ReactNode;
    renderTabPanels?: (activeTab: string) => ReactNode;
    children?: (
        activeTab: string,
        setActiveTab: (tabId: string) => void,
        tabs: TabItem[]
    ) => ReactNode;
}

/**
 * Headless Tabs Component
 * Provides flexible tab functionality without enforcing a specific UI
 */
export const HeadlessTabs: React.FC<HeadlessTabsProps> = ({
    tabs,
    defaultTab,
    onChange,
    renderTabList,
    renderTabPanels,
    children,
}) => {
    const {
        activeTab,
        setActiveTab,
        tabs: tabItems,
    } = useTabs({
        tabs,
        defaultTab,
        onChange,
    });

    if (children) {
        return <>{children(activeTab, setActiveTab, tabItems)}</>;
    }

    return (
        <div className="headless-tabs">
            {renderTabList && renderTabList(tabItems, activeTab, setActiveTab)}
            {renderTabPanels && renderTabPanels(activeTab)}
        </div>
    );
};
