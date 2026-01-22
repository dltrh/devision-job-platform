import React, { useState } from "react";
import { CompanyProfileSidebar } from "./CompanyProfileSidebar";
import { CompanyProfileContent } from "./CompanyProfileContent";
import type { ProfileSection } from "./types";

export const CompanyProfilePage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<ProfileSection>("company-info");

    return (
        <div className="flex min-h-[calc(100vh-5rem)] bg-gray-50">
            {/* Sidebar - hidden on mobile, shown on larger screens */}
            <div className="hidden md:block">
                <CompanyProfileSidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                />
            </div>

            {/* Mobile section selector */}
            <div className="md:hidden w-full">
                <div className="bg-white border-b border-gray-200 p-4">
                    <select
                        value={activeSection}
                        onChange={(e) => setActiveSection(e.target.value as ProfileSection)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="company-info">Company Information</option>
                        <option value="media-showcase">Media & Showcase</option>
                        <option value="account-security">Account & Security</option>
                        <option value="notifications" disabled>Notifications (Coming Soon)</option>
                        <option value="payment-subscription" disabled>Payment & Subscription (Coming Soon)</option>
                    </select>
                </div>
                <CompanyProfileContent activeSection={activeSection} />
            </div>

            {/* Desktop content area */}
            <div className="hidden md:flex flex-1">
                <CompanyProfileContent activeSection={activeSection} />
            </div>
        </div>
    );
};

export default CompanyProfilePage;
