import React from "react";
import { HeadlessFormProps } from "../types";

export const HeadlessForm = <T extends Record<string, any>>({
    initialValues = {} as T,
    onSubmit,
    validate,
    children,
    className,
}: HeadlessFormProps<T>) => {
    const [values, setValues] = React.useState<T>(initialValues);
    const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof T]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof T];
                return newErrors;
            });
        }
    };

    const handleBlur = (field: keyof T) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Validate on blur if validator is provided
        if (validate) {
            const validationErrors = validate(values);
            if (validationErrors[field]) {
                setErrors((prev) => ({
                    ...prev,
                    [field]: validationErrors[field],
                }));
            }
        }
    };

    const setFieldValue = (field: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
            (acc, key) => {
                acc[key as keyof T] = true;
                return acc;
            },
            {} as Partial<Record<keyof T, boolean>>
        );
        setTouched(allTouched);

        // Validate all fields
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);

            // Don't submit if there are errors
            if (Object.keys(validationErrors).length > 0) {
                return;
            }
        }

        onSubmit(values);
    };

    const isValid = Object.keys(errors).length === 0;

    return (
        <form onSubmit={handleSubmit} className={className} noValidate>
            {children({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                isValid,
            })}
        </form>
    );
};
