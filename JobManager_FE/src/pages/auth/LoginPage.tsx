import { CompanyLogin } from "@/components/feature/Authentication/CompanyLogin";
import AuthLayout from "@/layout/AuthLayout";

export default function LoginPage() {
    return (
        <AuthLayout>
            <CompanyLogin />
        </AuthLayout>
    );
}
