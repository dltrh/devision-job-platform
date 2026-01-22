import React from "react";

export const SubscriptionPlaceholder: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Payment & Subscription</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your subscription plan and payment methods.
                </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Payment and subscription management will be available in a future update.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionPlaceholder;
