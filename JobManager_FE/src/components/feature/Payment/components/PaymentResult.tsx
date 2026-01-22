import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import {
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowRight,
    RefreshCw,
    HeadphonesIcon,
    Crown,
    Sparkles,
    Clock,
} from "lucide-react";
import type { PaymentResultData } from "../types";

interface PaymentResultProps {
    result: PaymentResultData;
    onGoToDashboard: () => void;
    onTryAgain: () => void;
    onContactSupport: () => void;
}

export const PaymentResult: React.FC<PaymentResultProps> = ({
    result,
    onGoToDashboard,
    onTryAgain,
    onContactSupport,
}) => {
    const isSuccess = result.status === "success";

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="max-w-lg mx-auto">
            {isSuccess ? (
                /* Success State */
                <div className="text-center space-y-6">
                    {/* Success Animation */}
                    <div className="relative">
                        <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                            <CheckCircle2 className="w-14 h-14 text-green-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-32 h-32 mx-auto">
                            <Sparkles className="w-8 h-8 text-amber-400 absolute top-0 right-4 animate-bounce" />
                            <Sparkles className="w-6 h-6 text-purple-400 absolute bottom-4 right-0 animate-bounce delay-100" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600">
                            Your Premium subscription is now active. Welcome to the premium
                            experience!
                        </p>
                    </div>

                    {/* Premium Badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-6 py-3 rounded-full">
                        <Crown className="w-6 h-6 text-amber-600" />
                        <span className="font-semibold text-amber-800">Premium Member</span>
                    </div>

                    {/* Subscription Details Card */}
                    <Card
                        padding="lg"
                        className="text-left bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                    >
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-600" />
                            Subscription Details
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-green-200">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-semibold text-gray-900">
                                    Premium Company Subscription
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-green-200">
                                <span className="text-gray-600">Status</span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Active
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-green-200">
                                <span className="text-gray-600">Start Date</span>
                                <span className="font-medium text-gray-900">
                                    {formatShortDate(result.subscriptionStartDate)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Next Billing Date</span>
                                <span className="font-medium text-gray-900">
                                    {formatShortDate(result.nextBillingDate)}
                                </span>
                            </div>
                        </div>

                        {result.transactionId && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                                <p className="text-xs text-gray-500">
                                    Transaction ID: {result.transactionId}
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* What's Next */}
                    <Card padding="md" className="text-left">
                        <h4 className="font-medium text-gray-900 mb-3">What's unlocked for you:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Real-time applicant notifications
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Search and discover applicant profiles
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Kafka-powered instant candidate matching
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Unlimited job posts
                            </li>
                        </ul>
                    </Card>

                    {/* CTA */}
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={onGoToDashboard}
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                        Go to Dashboard
                    </Button>

                    {/* Email Confirmation Note */}
                    <p className="text-sm text-gray-500">
                        A confirmation email has been sent to your registered email address.
                    </p>
                </div>
            ) : (
                /* Failure State */
                <div className="text-center space-y-6">
                    {/* Error Icon */}
                    <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-14 h-14 text-red-500" />
                    </div>

                    {/* Error Message */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                        <p className="text-gray-600">
                            We couldn't process your payment. Don't worry, no charges were made to
                            your account.
                        </p>
                    </div>

                    {/* Error Details Card */}
                    <Card padding="lg" className="text-left bg-red-50 border-red-200">
                        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            What happened?
                        </h3>

                        <p className="text-red-800 text-sm mb-4">
                            {result.errorMessage ||
                                "Your payment could not be processed. This could be due to insufficient funds, an expired card, or a temporary issue with the payment provider."}
                        </p>

                        {result.errorCode && (
                            <p className="text-xs text-red-600">Error Code: {result.errorCode}</p>
                        )}
                    </Card>

                    {/* Suggestions Card */}
                    <Card padding="md" className="text-left">
                        <h4 className="font-medium text-gray-900 mb-3">Things to try:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                Check that your card hasn't expired
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                Ensure you have sufficient funds available
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                Try a different payment method
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                Contact your bank if the issue persists
                            </li>
                        </ul>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onTryAgain}
                            leftIcon={<RefreshCw className="w-5 h-5" />}
                            className="flex-1"
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onContactSupport}
                            leftIcon={<HeadphonesIcon className="w-5 h-5" />}
                            className="flex-1"
                        >
                            Contact Support
                        </Button>
                    </div>

                    {/* Return to Dashboard */}
                    <Button variant="ghost" onClick={onGoToDashboard} className="text-gray-500">
                        Return to Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
};
