import React from "react";
import { Link } from "react-router-dom";
import { Input, Button, Alert, GoogleLogo } from "@/components/ui";
import { LoginPayload } from "../api/AuthService";

interface CompanyLoginFormProps {
    values: LoginPayload;
    errors: Partial<Record<keyof LoginPayload, string>>;
    touched: Partial<Record<keyof LoginPayload, boolean>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (field: keyof LoginPayload) => void;
    isLoading: boolean;
    error: string | null;
    onDismissError?: () => void;
}

export const CompanyLoginForm: React.FC<CompanyLoginFormProps> = ({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isLoading,
    error,
    onDismissError,
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [capsLockOn, setCapsLockOn] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(true);

    const apiBase = `${import.meta.env.VITE_GATEWAY_API_URL || "http://localhost:8080"}/api`;

    return (
        <div className="w-full">
            <div className="text-center">
                <h2 className="text-2xl tracking-tight text-gray-600">
                    Welcome back!
                </h2>
                <p className="mt-2 text-3xl text-heading font-bold">
                    COMPANY SIGN IN
                </p>
            </div>

            {error && (
                <Alert
                    type="error"
                    className="mt-6"
                    onClose={onDismissError}
                    title="Sign-in failed"
                >
                    {error}
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
                    helperText={
                        !touched.email
                            ? "Use your company email address."
                            : undefined
                    }
                    fullWidth
                />

                <Input
                    label="Password"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={(value, event) => handleChange(event)}
                    onBlur={() => handleBlur("password")}
                    onKeyUp={(e) =>
                        setCapsLockOn(
                            (e as any).getModifierState?.("CapsLock") ?? false
                        )
                    }
                    error={touched.password ? errors.password : undefined}
                    helperText={capsLockOn ? "Caps Lock is on." : undefined}
                    endAdornment={
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    }
                    fullWidth
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Remember me
                    </label>

                    <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                    disabled={!values.email || !values.password}
                >
                    Sign in
                </Button>

                <div className="relative py-2">
                    <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                    >
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-xs font-medium text-gray-500">
                            OR
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        sessionStorage.setItem("sso_flow", "login");
                        const target = `${apiBase}/oauth2/authorization/google`;
                        window.location.href = target;
                    }}
                    leftIcon={<GoogleLogo />}
                    fullWidth
                >
                    Continue with Google
                </Button>

                <p className="pt-1 text-center text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Create one
                    </Link>
                </p>

                <p className="text-center text-xs text-gray-500">
                    By continuing you agree to your company’s hiring policies.
                </p>
            </div>
        </div>
    );
};
