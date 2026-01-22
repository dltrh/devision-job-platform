import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { CreditCard, DollarSign } from "lucide-react";
import clsx from "clsx";
import type { PaymentMethodType } from "../types";

export interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethodType | null;
    onSelectMethod: (method: PaymentMethodType) => void;
    disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedMethod,
    onSelectMethod,
    disabled = false,
}) => {
    const paymentMethods: { type: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
        {
            type: "STRIPE",
            label: "Credit Card (Stripe)",
            icon: <CreditCard className="w-6 h-6" />,
        },
        {
            type: "PAYPAL",
            label: "PayPal",
            icon: <DollarSign className="w-6 h-6" />,
        },
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Payment Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                    <button
                        key={method.type}
                        type="button"
                        onClick={() => !disabled && onSelectMethod(method.type)}
                        disabled={disabled}
                        className={clsx(
                            "relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                            "hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            selectedMethod === method.type
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div
                            className={clsx(
                                "flex items-center justify-center",
                                selectedMethod === method.type ? "text-blue-600" : "text-gray-600"
                            )}
                        >
                            {method.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <p
                                className={clsx(
                                    "font-medium",
                                    selectedMethod === method.type ? "text-blue-900" : "text-gray-900"
                                )}
                            >
                                {method.label}
                            </p>
                        </div>
                        {selectedMethod === method.type && (
                            <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
