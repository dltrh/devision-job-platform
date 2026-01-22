import { Routes } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import {
    authRoutes,
    mainRoutes,
    jobRoutes,
    applicantRoutes,
    applicationRoutes,
    subscriptionRoutes,
} from "@/routes";
import { ToastProvider, useToastContext } from "@/components/headless/Toast";
import { ToastContainer } from "@/components/ui/Toast";

// Toast container that uses the context
const AppToastContainer = () => {
    const toast = useToastContext();
    return <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />;
};

function App() {
    return (
        <ToastProvider>
            <AppLayout>
                <Routes>
                    {mainRoutes}
                    {authRoutes}
                    {jobRoutes}
                    {applicantRoutes}
                    {applicationRoutes}
                    {subscriptionRoutes}
                </Routes>
            </AppLayout>
            <AppToastContainer />
        </ToastProvider>
    );
}

export default App;
