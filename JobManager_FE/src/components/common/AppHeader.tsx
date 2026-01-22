import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui";
import { getStoredUser, clearAuthSession } from "../../services/authStorage";
import { useState, useEffect } from "react";
import { getCompanyProfile, getCompany } from "@/components/feature/CompanyProfile/api";
import { checkIsPremium } from "@/components/feature/Subscription/api/SubscriptionService";
import { NotificationDropdown } from "@/components/feature/Notification";

type AppHeaderProps = {
    className?: string;
};

export default function AppHeader({ className }: AppHeaderProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(getStoredUser());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);

    const pathname = location.pathname;
    const onLogin = pathname === "/login";
    const onRegister = pathname === "/register";

    // Listen for auth changes
    useEffect(() => {
        const handleAuthChange = () => {
            setUser(getStoredUser());
            setIsDropdownOpen(false); // Close dropdown when auth state changes
        };

        window.addEventListener("auth-change", handleAuthChange);
        return () => {
            window.removeEventListener("auth-change", handleAuthChange);
        };
    }, []);

    // Listen for subscription status changes
    useEffect(() => {
        const handleSubscriptionChange = async () => {
            if (user?.companyId) {
                try {
                    const premiumStatus = await checkIsPremium();
                    setIsPremium(premiumStatus.data ?? false);
                } catch (error) {
                    console.error("Failed to refresh premium status:", error);
                }
            }
        };

        window.addEventListener("subscription-change", handleSubscriptionChange);
        return () => {
            window.removeEventListener("subscription-change", handleSubscriptionChange);
        };
    }, [user]);

    // Reset dropdown state when user changes
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [user]);

    // Fetch company logo, name, and premium status when user is available
    useEffect(() => {
        const fetchCompanyData = async () => {
            if (user?.companyId) {
                try {
                    const [profile, company, premiumStatus] = await Promise.all([
                        getCompanyProfile().catch(() => null),
                        getCompany().catch(() => null),
                        checkIsPremium().catch(() => ({ data: false })),
                    ]);
                    setCompanyLogoUrl(profile?.logoUrl || null);
                    setCompanyName(company?.name || null);
                    setIsPremium(premiumStatus.data ?? false);
                } catch (error) {
                    console.error("Failed to fetch company data:", error);
                    setCompanyLogoUrl(null);
                    setCompanyName(null);
                    setIsPremium(false);
                }
            } else {
                setCompanyLogoUrl(null);
                setCompanyName(null);
                setIsPremium(false);
            }
        };

        fetchCompanyData();
    }, [user]);

    const handleLogout = () => {
        clearAuthSession();
        setUser(null);
        navigate("/login");
    };

    return (
        <header className={className ?? ""}>
            <div className="h-20 border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
                            <img src="/logo/logo.png" alt="DEVision" className="h-12 w-auto" />
                            <div className="leading-tight">
                                <div className="text-sm font-semibold text-gray-900">DEVision</div>
                                <div className="text-xs text-gray-500">Company hiring portal</div>
                            </div>
                        </Link>

                        {user && (
                            <nav className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/dashboard"
                                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                                        pathname === "/dashboard"
                                            ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-105"
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/job-posts"
                                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                                        pathname.startsWith("/job-posts")
                                            ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-105"
                                    }`}
                                >
                                    Job Posts
                                </Link>
                                <Link
                                    to="/applicant-search"
                                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                                        pathname === "/applicant-search"
                                            ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-105"
                                    }`}
                                >
                                    Applicant Search
                                </Link>
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <NotificationDropdown isPremium={isPremium} />

                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsDropdownOpen(true)}
                                    onMouseLeave={() => setIsDropdownOpen(false)}
                                >
                                    <div className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover: transition-all duration-200 hover:scale-105">
                                        <div
                                            className={
                                                isPremium
                                                    ? "p-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                                                    : ""
                                            }
                                        >
                                            {companyLogoUrl ? (
                                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                                                    <img
                                                        src={companyLogoUrl}
                                                        alt="Company logo"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-0 pt-2 w-64 z-50">
                                            <div className="bg-white rounded-md shadow-lg py-1 border border-gray-100">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {companyName || user.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                                        <span
                                                            className={`inline-block w-2 h-2 rounded-full ${isPremium ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gray-400"}`}
                                                        ></span>
                                                        {isPremium ? (
                                                            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                                Premium
                                                            </span>
                                                        ) : (
                                                            <span className="font-medium text-gray-600">
                                                                Free Plan
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Profile Settings
                                                </Link>
                                                {isPremium ? (
                                                    <Link
                                                        to="/notifications"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Notifications
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to="/subscription"
                                                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:bg-amber-50 group"
                                                    >
                                                        <span>Notifications</span>
                                                        <span className="flex items-center gap-1 text-xs text-amber-500">
                                                            <svg
                                                                className="w-3 h-3"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
                                                            </svg>
                                                            Premium
                                                        </span>
                                                    </Link>
                                                )}
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                                >
                                                    Log out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* <Button variant="primary">POST</Button> */}
                            </>
                        ) : (
                            <nav className="flex items-center gap-3">
                                {!onLogin && (
                                    <Link to="/login" className="inline-flex">
                                        <Button variant="ghost">Log in</Button>
                                    </Link>
                                )}
                                {!onRegister && (
                                    <Link to="/register" className="inline-flex">
                                        <Button>Get started</Button>
                                    </Link>
                                )}
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
