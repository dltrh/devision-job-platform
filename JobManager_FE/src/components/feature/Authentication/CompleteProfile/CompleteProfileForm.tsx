import React from "react";
import { Input, Button, Alert, PhoneInput } from "@/components/ui";
import { CompleteProfilePayload } from "./types";

interface CompleteProfileFormProps {
    values: CompleteProfilePayload;
    errors: Partial<Record<keyof CompleteProfilePayload, string>>;
    touched: Partial<Record<keyof CompleteProfilePayload, boolean>>;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    handleBlur: (field: keyof CompleteProfilePayload) => void;
    setFieldValue: (field: keyof CompleteProfilePayload, value: any) => void;
    isLoading: boolean;
    isValid: boolean;
    error: string | null;
    success: string | null;
    onDismissError?: () => void;
    onDismissSuccess?: () => void;
}

export const CompleteProfileForm: React.FC<CompleteProfileFormProps> = (
    props
) => {
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        isLoading,
        error,
        success,
        onDismissError,
        onDismissSuccess,
    } = props;

    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!values.companyLogo) {
            setLogoPreview(null);
            return;
        }

        const nextPreview = URL.createObjectURL(values.companyLogo);
        setLogoPreview(nextPreview);

        return () => {
            URL.revokeObjectURL(nextPreview);
        };
    }, [values.companyLogo]);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setFieldValue("companyLogo", file);
    };

    const handleRemoveLogo = () => {
        setFieldValue("companyLogo", null);
    };

    return (
        <div className="w-full">
            <div className="text-center">
                <h2 className="text-2xl tracking-tight text-gray-600">
                    Almost there!
                </h2>
                <p className="mt-2 text-3xl font-bold text-heading">
                    COMPLETE YOUR PROFILE
                </p>
                <p className="mt-2 text-sm text-gray-600">
                    Let applicants learn more about your company.
                </p>
            </div>

            {error && (
                <Alert
                    type="error"
                    className="mt-6"
                    title="Update failed"
                    onClose={onDismissError}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    type="success"
                    className="mt-6"
                    title="Update successful"
                    onClose={onDismissSuccess}
                >
                    {success}
                </Alert>
            )}

            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Company logo preview"
                                className="h-16 w-16 rounded-full object-cover shadow"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-300 text-xs text-gray-500">
                                Logo
                            </div>
                        )}

                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="flex-1 text-sm font-medium text-gray-700">
                                Company logo *
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-2 w-full cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={handleLogoChange}
                                />
                            </label>

                            {values.companyLogo && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleRemoveLogo}
                                    className="self-end text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>

                        {touched.companyLogo && errors.companyLogo && (
                            <span className="text-sm text-red-600">
                                {errors.companyLogo}
                            </span>
                        )}

                        <p className="text-center text-xs text-gray-500">
                            Upload a square logo (PNG or JPG, up to 2MB
                            recommended).
                        </p>
                    </div>

                    <Input
                        label="Company name *"
                        id="companyName"
                        name="companyName"
                        type="text"
                        autoComplete="organization"
                        required
                        placeholder="What should applicants see?"
                        value={values.companyName}
                        onChange={(value, event) => handleChange(event)}
                        onBlur={() => handleBlur("companyName")}
                        error={
                            touched.companyName ? errors.companyName : undefined
                        }
                        fullWidth
                    />

                    <PhoneInput
                        label="Phone number *"
                        value={values.phoneNumber}
                        onChange={(value) =>
                            setFieldValue("phoneNumber", value)
                        }
                        error={
                            touched.phoneNumber ? errors.phoneNumber : undefined
                        }
                        helperText="Enter your company phone number with country code"
                        fullWidth
                    />

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="address"
                            className="text-sm font-medium text-gray-700"
                        >
                            Detailed address *
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            placeholder="Street, city, and postal code"
                            className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                touched.address && errors.address
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300"
                            }`}
                            value={values.address}
                            onChange={handleChange}
                            onBlur={() => handleBlur("address")}
                        />
                        {touched.address && errors.address && (
                            <span className="text-sm text-red-600">
                                {errors.address}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isLoading}
                        disabled={isLoading}
                        fullWidth
                    >
                        Complete Profile
                    </Button>
                </div>
            </div>
        </div>
    );
};
