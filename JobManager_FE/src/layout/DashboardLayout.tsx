import { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return <div className="mx-auto max-w-7xl space-y-6 p-6">{children}</div>;
};

export default DashboardLayout;
