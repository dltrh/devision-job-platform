import React from "react";
import { Link } from "react-router-dom";
import { Input, Button, Alert } from "@/components/ui";

interface ForgotPasswordPayload {
    email: string;
}

interface CompanyForgotPasswordFormProps {
    values: ForgotPasswordPayload;
    errors: Partial<Record<keyof ForgotPasswordPayload, string>>;
    touched: Partial<Record<keyof ForgotPasswordPayload, boolean>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (field: keyof ForgotPasswordPayload) => void;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    onDismissError?: () => void;
    onDismissSuccess?: () => void;
}

export const CompanyForgotPasswordForm: React.FC<CompanyForgotPasswordFormProps> = ({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isLoading,
    error,
    success,
    onDismissError,
    onDismissSuccess,
}) => {
    return (
        <div className="w-full">
            <div className="text-center">
                <h2 className="text-2xl tracking-tight text-gray-600">Forgot your password?</h2>
                <p className="mt-2 text-3xl text-heading font-bold">RESET PASSWORD</p>
                <p className="mt-4 text-sm text-gray-600">
                    Enter your company email address and we'll send you a link to reset your password.
                </p>
            </div>

            {error && (
                <Alert type="error" className="mt-6" onClose={onDismissError} title="Reset failed">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert type="success" className="mt-6" onClose={onDismissSuccess} title="Reset email sent">
                    {success}
                </Alert>
            )}

            <div className="mt-6 space-y-5">
                <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@company.com"
                    value={values.email}
                    onChange={(value, event) => handleChange(event)}
                    onBlur={() => handleBlur("email")}
                    error={touched.email ? errors.email : undefined}
                    helperText={!touched.email ? "Use your company email address." : undefined}
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                    disabled={!values.email}
                >
                    Send reset link
                </Button>

                <p className="pt-1 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
