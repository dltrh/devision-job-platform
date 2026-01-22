import { CompanySignup } from "@/components/feature/Authentication/CompanySignup";
import AuthLayout from "@/layout/AuthLayout";

export default function RegistrationPage() {
    return (
        <AuthLayout>
            <CompanySignup />
        </AuthLayout>
    );
}
