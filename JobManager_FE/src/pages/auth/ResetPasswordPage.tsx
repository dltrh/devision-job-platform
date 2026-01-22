import { CompanyResetPassword } from "@/components/feature/Authentication/CompanyLogin";
import AuthLayout from "@/layout/AuthLayout";

export default function ResetPasswordPage() {
    return (
        <AuthLayout>
            <CompanyResetPassword />
        </AuthLayout>
    );
}
