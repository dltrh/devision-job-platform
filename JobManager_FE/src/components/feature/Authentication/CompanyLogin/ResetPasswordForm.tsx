import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Alert } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordFormProps {
    values: ResetPasswordFormData;
    errors: Partial<Record<keyof ResetPasswordFormData, string>>;
    touched: Partial<Record<keyof ResetPasswordFormData, boolean>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (field: keyof ResetPasswordFormData) => void;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    onDismissError?: () => void;
    onDismissSuccess?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
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
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="w-full">
            <div className="text-center">
                <h2 className="text-2xl tracking-tight text-gray-600">
                    Reset Password
                </h2>
                <p className="mt-2 text-3xl text-heading font-bold">
                    SET NEW PASSWORD
                </p>
                <p className="mt-4 text-sm text-gray-600">
                    Enter your new password below.
                </p>
            </div>

            {error && (
                <Alert
                    type="error"
                    className="mt-6"
                    onClose={onDismissError}
                    title="Reset failed"
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    type="success"
                    className="mt-6"
                    onClose={onDismissSuccess}
                    title="Success"
                >
                    {success}
                </Alert>
            )}

            <div className="mt-6 space-y-5">
                <div className="relative">
                    <Input
                        label="New Password"
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Enter new password"
                        value={values.newPassword}
                        onChange={(value, event) => handleChange(event)}
                        onBlur={() => handleBlur("newPassword")}
                        error={
                            touched.newPassword ? errors.newPassword : undefined
                        }
                        helperText={
                            !touched.newPassword
                                ? "Must be at least 8 characters with uppercase, lowercase, number, and special character."
                                : undefined
                        }
                        fullWidth
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <div className="relative">
                    <Input
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Confirm new password"
                        value={values.confirmPassword}
                        onChange={(value, event) => handleChange(event)}
                        onBlur={() => handleBlur("confirmPassword")}
                        error={
                            touched.confirmPassword
                                ? errors.confirmPassword
                                : undefined
                        }
                        fullWidth
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                    disabled={!values.newPassword || !values.confirmPassword}
                >
                    Reset Password
                </Button>

                <p className="pt-1 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
