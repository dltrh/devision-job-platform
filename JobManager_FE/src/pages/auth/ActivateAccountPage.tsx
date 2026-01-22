import { AccountActivation } from "@/components/feature/Authentication/AccountActivation";
import AuthLayout from "@/layout/AuthLayout";

export default function ActivateAccountPage() {
    return (
        <AuthLayout>
            <AccountActivation />
        </AuthLayout>
    );
}
