import { useState, ReactNode } from "react";

export interface TabItem {
    id: string;
    label: string;
    count?: number;
    icon?: ReactNode;
}

export interface UseTabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
}

export interface UseTabsReturn {
    activeTab: string;
    setActiveTab: (tabId: string) => void;
    tabs: TabItem[];
}

/**
 * Headless tabs hook - provides tab state management logic
 */
export const useTabs = ({
    tabs,
    defaultTab,
    onChange,
}: UseTabsProps): UseTabsReturn => {
    const [activeTab, setActiveTabState] = useState<string>(
        defaultTab || tabs[0]?.id || ""
    );

    const setActiveTab = (tabId: string) => {
        setActiveTabState(tabId);
        onChange?.(tabId);
    };

    return {
        activeTab,
        setActiveTab,
        tabs,
    };
};
