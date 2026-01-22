import React from "react";
import type { ProfileSection } from "./types";
import {
    CompanyInfoForm,
    CompanyMediaGallery,
    AccountSecurityPanel,
    NotificationsPlaceholder,
    SubscriptionSection,
} from "./sections";

interface CompanyProfileContentProps {
    activeSection: ProfileSection;
}

export const CompanyProfileContent: React.FC<CompanyProfileContentProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case "company-info":
                return <CompanyInfoForm />;
            case "media-showcase":
                return <CompanyMediaGallery />;
            case "account-security":
                return <AccountSecurityPanel />;
            case "notifications":
                return <NotificationsPlaceholder />;
            case "payment-subscription":
                return <SubscriptionSection />;
            default:
                return <CompanyInfoForm />;
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                {renderSection()}
            </div>
        </div>
    );
};

export default CompanyProfileContent;
