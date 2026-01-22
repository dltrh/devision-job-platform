import { ReactNode } from "react";

interface LandingLayoutProps {
    children: ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            {children}
        </div>
    );
};

export default LandingLayout;
