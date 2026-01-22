import { ReactNode } from "react";
import AppHeader from "@/components/common/AppHeader";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="flex flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default AppLayout;
