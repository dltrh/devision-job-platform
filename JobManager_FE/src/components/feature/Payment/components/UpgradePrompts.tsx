import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import {
    Crown,
    Lock,
    ArrowRight,
    Bell,
    Search,
    Zap,
    Sparkles,
    X,
    Loader2,
    CheckCircle2,
    Star,
} from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { usePremiumStatus } from "../hooks/usePaymentFlow";

/**
 * Inline Upgrade Prompt - For feature-locked actions
 * Shows a compact prompt when users try to access premium features
 */
interface UpgradePromptInlineProps {
    feature:
        | "applicant-search"
        | "real-time-notifications"
        | "instant-matching"
        | "unlimited-posts";
    onClose?: () => void;
    className?: string;
}

export const UpgradePromptInline: React.FC<UpgradePromptInlineProps> = ({
    feature,
    onClose,
    className = "",
}) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Animate in on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const featureConfig = {
        "applicant-search": {
            icon: <Search className="w-5 h-5" />,
            title: "Unlock Applicant Search",
            description: "Search and discover qualified candidates from our talent pool.",
        },
        "real-time-notifications": {
            icon: <Bell className="w-5 h-5" />,
            title: "Get Real-time Notifications",
            description: "Instant alerts when candidates apply to your job posts.",
        },
        "instant-matching": {
            icon: <Zap className="w-5 h-5" />,
            title: "Enable Instant Matching",
            description: "Kafka-powered real-time candidate-job matching.",
        },
        "unlimited-posts": {
            icon: <Sparkles className="w-5 h-5" />,
            title: "Post Unlimited Jobs",
            description: "Remove job posting limits with Premium.",
        },
    };

    const config = featureConfig[feature];

    const handleUpgrade = () => {
        navigate(`${ROUTES.SUBSCRIPTION}/upgrade`);
    };

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 200);
    }, [onClose]);

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Card
                padding="md"
                className={`bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 
                    transform transition-all duration-300 ease-out
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                    ${isHovered ? "shadow-lg border-slate-300 scale-[1.01]" : "shadow-sm"}
                    ${className}`}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0
                    transition-all duration-300 ${isHovered ? "bg-slate-200 scale-110" : ""}`}
                    >
                        <Lock
                            className={`w-5 h-5 text-slate-600 transition-transform duration-300
                        ${isHovered ? "animate-pulse" : ""}`}
                        />
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className={`text-slate-600 transition-transform duration-300
                            ${isHovered ? "scale-110" : ""}`}
                            >
                                {config.icon}
                            </span>
                            <h4 className="font-semibold text-gray-900">{config.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleUpgrade}
                            rightIcon={
                                <ArrowRight
                                    className={`w-4 h-4 transition-transform duration-200
                            ${isHovered ? "translate-x-1" : ""}`}
                                />
                            }
                            className="bg-slate-800 hover:bg-slate-900 transition-all duration-200 hover:shadow-md"
                        >
                            Upgrade to Premium - $30/mo
                        </Button>
                    </div>
                    {onClose && (
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-1 transition-all duration-200
                            hover:bg-gray-100 rounded-full hover:rotate-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
};

/**
 * Modal Upgrade Prompt - For full-screen blocking
 * Shows when users click on a premium-only feature
 */
interface UpgradePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
    isOpen,
    onClose,
    feature,
}) => {
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            const timer = setTimeout(() => setShowContent(true), 100);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
            setIsAnimating(false);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    const handleUpgrade = () => {
        onClose();
        navigate(`${ROUTES.SUBSCRIPTION}/upgrade`);
    };

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => {
            setIsAnimating(false);
            onClose();
        }, 200);
    };

    const features = [
        { icon: Bell, text: "Real-time applicant notifications", color: "text-blue-500" },
        { icon: Search, text: "Applicant profile search", color: "text-green-500" },
        { icon: Zap, text: "Kafka-powered instant matching", color: "text-amber-500" },
    ];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center
            transition-opacity duration-300 ${showContent ? "opacity-100" : "opacity-0"}`}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
                    ${showContent ? "opacity-100" : "opacity-0"}`}
                onClick={handleClose}
            />

            {/* Modal */}
            <Card
                padding="none"
                className={`relative z-10 max-w-md w-full mx-4 overflow-hidden
                    transform transition-all duration-300 ease-out
                    ${showContent ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white text-center relative overflow-hidden">
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full animate-ping"
                            style={{ animationDelay: "0s" }}
                        />
                        <div
                            className="absolute top-8 right-8 w-1 h-1 bg-white/30 rounded-full animate-ping"
                            style={{ animationDelay: "0.5s" }}
                        />
                        <div
                            className="absolute bottom-6 left-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping"
                            style={{ animationDelay: "1s" }}
                        />
                    </div>

                    <div
                        className={`w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4
                        transition-transform duration-500 ${showContent ? "scale-100 rotate-0" : "scale-0 rotate-180"}`}
                    >
                        <Crown className="w-8 h-8 animate-pulse" />
                    </div>
                    <h2
                        className={`text-2xl font-bold mb-2 transition-all duration-300 delay-100
                        ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    >
                        Premium Feature
                    </h2>
                    <p
                        className={`text-slate-300 transition-all duration-300 delay-150
                        ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    >
                        {feature
                            ? `"${feature}" is available for Premium members`
                            : "This feature is available for Premium members"}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Upgrade to unlock:</h3>
                    <ul className="space-y-3 mb-6">
                        {features.map((item, index) => (
                            <li
                                key={index}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer
                                    transition-all duration-300 ease-out
                                    ${hoveredFeature === index ? "bg-slate-50 scale-[1.02]" : ""}
                                    ${showContent ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                                style={{ transitionDelay: `${200 + index * 100}ms` }}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                <div
                                    className={`w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center
                                    transition-all duration-300 ${hoveredFeature === index ? "scale-110 bg-slate-200" : ""}`}
                                >
                                    <item.icon
                                        className={`w-4 h-4 transition-colors duration-300
                                        ${hoveredFeature === index ? item.color : "text-slate-600"}`}
                                    />
                                </div>
                                <span className="text-gray-700">{item.text}</span>
                                {hoveredFeature === index && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto animate-in fade-in duration-200" />
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Price */}
                    <div
                        className={`text-center mb-6 p-4 bg-gray-50 rounded-lg transition-all duration-300
                        ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                        style={{ transitionDelay: "400ms" }}
                    >
                        <div className="text-3xl font-bold text-gray-900 relative inline-block">
                            <span className="relative">
                                $30<span className="text-lg font-normal text-gray-500">/month</span>
                                {/* Sparkle effect */}
                                <Sparkles className="absolute -top-2 -right-6 w-4 h-4 text-amber-400 animate-pulse" />
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">Cancel anytime</p>
                    </div>

                    {/* Actions */}
                    <div
                        className={`flex flex-col gap-3 transition-all duration-300
                        ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                        style={{ transitionDelay: "500ms" }}
                    >
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleUpgrade}
                            rightIcon={
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            }
                            className="bg-slate-800 hover:bg-slate-900 group transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        >
                            Upgrade to Premium
                        </Button>
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={handleClose}
                            className="hover:bg-gray-100 transition-colors duration-200"
                        >
                            Maybe Later
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

/**
 * Dashboard Upgrade CTA - For dashboard placement
 * Prominent CTA card for the company dashboard with real subscription status
 */
interface DashboardUpgradeCTAProps {
    variant?: "compact" | "full";
    className?: string;
}

export const DashboardUpgradeCTA: React.FC<DashboardUpgradeCTAProps> = ({
    variant = "full",
    className = "",
}) => {
    const navigate = useNavigate();
    const { isPremium, isLoading } = usePremiumStatus();
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Check if user just upgraded (from URL param or session storage)
    useEffect(() => {
        const justUpgraded = sessionStorage.getItem("justUpgraded");
        if (justUpgraded === "true" && isPremium && !isLoading) {
            setShowSuccessMessage(true);
            sessionStorage.removeItem("justUpgraded");

            // Hide success message after 5 seconds
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isPremium, isLoading]);

    const handleUpgrade = () => {
        navigate(`${ROUTES.SUBSCRIPTION}/upgrade`);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    // Don't show if user is premium
    if (isPremium && !showSuccessMessage) {
        return null;
    }

    // Show loading state
    if (isLoading) {
        return (
            <Card padding="md" className={`bg-gray-100 animate-pulse ${className}`}>
                <div className="flex items-center justify-center gap-3 py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="text-gray-500">Loading subscription status...</span>
                </div>
            </Card>
        );
    }

    // Show success message after upgrade
    if (showSuccessMessage) {
        return (
            <Card
                padding="lg"
                className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden relative
                    animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse" />

                {/* Confetti-like particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <Star
                            key={i}
                            className="absolute w-3 h-3 text-yellow-300 animate-ping"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: "2s",
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex items-start gap-4 flex-1">
                            <div
                                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0
                                animate-bounce"
                            >
                                <CheckCircle2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Welcome to Premium!</h3>
                                <p className="text-green-100">
                                    Your premium subscription is now active. Enjoy all premium
                                    features!
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full
                                animate-pulse"
                            >
                                <Crown className="w-5 h-5 text-amber-300" />
                                <span className="text-sm font-medium">Premium</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (variant === "compact") {
        return (
            <div
                onClick={handleUpgrade}
                className="cursor-pointer group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Card
                    padding="md"
                    className={`bg-gradient-to-r from-slate-700 to-slate-800 text-white 
                        transition-all duration-300 ease-out
                        ${isHovered ? "shadow-xl shadow-slate-500/20 scale-[1.02]" : "shadow-lg"}
                        ${className}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Crown
                                className={`w-6 h-6 text-slate-300 transition-all duration-300
                                ${isHovered ? "text-amber-400 rotate-12 scale-110" : ""}`}
                            />
                            <div>
                                <h4 className="font-semibold">Upgrade to Premium</h4>
                                <p className="text-sm text-slate-300">$30/month • Cancel anytime</p>
                            </div>
                        </div>
                        <ArrowRight
                            className={`w-5 h-5 transition-transform duration-300
                            ${isHovered ? "translate-x-1" : ""}`}
                        />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onClick={handleUpgrade}
            className="cursor-pointer"
        >
            <Card
                padding="lg"
                className={`bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white overflow-hidden relative
                    transition-all duration-300
                    ${isHovered ? "shadow-2xl shadow-slate-500/30 scale-[1.01]" : "shadow-lg"}
                    ${className}`}
            >
                {/* Dynamic spotlight effect */}
                <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                        opacity: isHovered ? 0.15 : 0,
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, white 0%, transparent 50%)`,
                    }}
                />

                {/* Background decoration */}
                <div
                    className={`absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2
                transition-transform duration-700 ${isHovered ? "scale-110" : ""}`}
                />
                <div
                    className={`absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2
                transition-transform duration-700 ${isHovered ? "scale-110" : ""}`}
                />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Sparkles
                        className={`absolute top-4 right-20 w-4 h-4 text-slate-400/50 
                    transition-all duration-500 ${isHovered ? "text-amber-400/70 animate-pulse" : ""}`}
                    />
                    <Star
                        className={`absolute bottom-8 right-1/3 w-3 h-3 text-slate-400/30
                    transition-all duration-500 ${isHovered ? "text-amber-400/50 animate-ping" : ""}`}
                    />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div
                                className={`w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0
                            transition-all duration-300 ${isHovered ? "bg-white/20 scale-110 rotate-3" : ""}`}
                            >
                                <Crown
                                    className={`w-7 h-7 transition-all duration-300
                                ${isHovered ? "text-amber-400" : "text-slate-300"}`}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Upgrade Your Hiring</h3>
                                <p className="text-slate-300 max-w-md">
                                    Get real-time notifications, search applicant profiles, and
                                    leverage Kafka-powered instant matching.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-center mb-3">
                                <span
                                    className={`text-3xl font-bold transition-all duration-300
                                ${isHovered ? "text-amber-400" : ""}`}
                                >
                                    $30
                                </span>
                                <span className="text-slate-300">/month</span>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpgrade();
                                }}
                                rightIcon={
                                    <ArrowRight
                                        className={`w-4 h-4 transition-transform duration-200
                                ${isHovered ? "translate-x-1" : ""}`}
                                    />
                                }
                                className="bg-white text-slate-800 hover:bg-slate-100 whitespace-nowrap
                                transition-all duration-200 hover:shadow-lg"
                            >
                                Upgrade to Premium
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

/**
 * Profile Subscription Status Card - For company profile page
 * Shows current subscription status with upgrade/manage options
 */
interface ProfileSubscriptionCardProps {
    isPremium: boolean;
    status?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "INACTIVE";
    daysRemaining?: number | null;
    endDate?: string | null;
    className?: string;
}

export const ProfileSubscriptionCard: React.FC<ProfileSubscriptionCardProps> = ({
    isPremium,
    status = "INACTIVE",
    daysRemaining,
    endDate,
    className = "",
}) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState<string | null>(null);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleManage = () => {
        navigate(ROUTES.SUBSCRIPTION);
    };

    const handleUpgrade = () => {
        navigate(`${ROUTES.SUBSCRIPTION}/upgrade`);
    };

    const isExpiringSoon =
        daysRemaining !== null &&
        daysRemaining !== undefined &&
        daysRemaining <= 7 &&
        daysRemaining > 0;

    // Calculate progress for premium users
    const progressPercentage =
        daysRemaining !== null && daysRemaining !== undefined
            ? Math.min(100, Math.max(0, (daysRemaining / 30) * 100))
            : 100;

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Card
                padding="lg"
                className={`transition-all duration-300 ${isHovered ? "shadow-lg" : "shadow-sm"} ${className}`}
            >
                <div className="flex items-start justify-between mb-4 relative">
                    <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
                    {isPremium && (
                        <div
                            className={`relative flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full
                                transition-all duration-300 cursor-pointer
                                ${isHovered ? "bg-slate-200 scale-105" : ""}`}
                            onMouseEnter={() => setShowTooltip("premium")}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Crown
                                className={`w-4 h-4 transition-all duration-300
                                ${isHovered ? "text-amber-500 animate-pulse" : "text-slate-600"}`}
                            />
                            <span className="text-sm font-medium text-slate-700">Premium</span>

                            {/* Tooltip */}
                            {showTooltip === "premium" && (
                                <div
                                    className="absolute top-full right-0 mt-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg
                                    whitespace-nowrap z-10 shadow-lg"
                                >
                                    You have full access to all features
                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-800 rotate-45" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Warning for expiring soon */}
                {isExpiringSoon && status === "ACTIVE" && (
                    <div
                        className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4
                        animate-pulse"
                    >
                        <div className="flex items-center gap-2 text-amber-800 text-sm">
                            <Lock className="w-4 h-4 animate-bounce" />
                            <span>Expires in {daysRemaining} days - Renew to keep access</span>
                        </div>
                    </div>
                )}

                {/* Progress bar for premium users */}
                {isPremium &&
                    status === "ACTIVE" &&
                    daysRemaining !== null &&
                    daysRemaining !== undefined && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Billing cycle</span>
                                <span>{daysRemaining} days remaining</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out
                                ${
                                    progressPercentage > 30
                                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                        : progressPercentage > 10
                                          ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                          : "bg-gradient-to-r from-red-400 to-rose-500"
                                }`}
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                <div className="space-y-3 mb-4">
                    <div
                        className="flex justify-between text-sm p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50 cursor-default"
                        onMouseEnter={() => setShowTooltip("status")}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <span className="text-gray-500">Status</span>
                        <span
                            className={`font-medium flex items-center gap-1.5 ${
                                status === "ACTIVE"
                                    ? "text-green-600"
                                    : status === "EXPIRED"
                                      ? "text-red-600"
                                      : "text-gray-600"
                            }`}
                        >
                            {status === "ACTIVE" && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            )}
                            {status === "ACTIVE"
                                ? "Active"
                                : status === "EXPIRED"
                                  ? "Expired"
                                  : status === "CANCELLED"
                                    ? "Cancelled"
                                    : "Free Plan"}
                        </span>
                    </div>
                    {isPremium && endDate && (
                        <div className="flex justify-between text-sm p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                            <span className="text-gray-500">
                                {status === "ACTIVE" ? "Renewal Date" : "Expired On"}
                            </span>
                            <span className="font-medium text-gray-900">{formatDate(endDate)}</span>
                        </div>
                    )}
                </div>

                {isPremium ? (
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={handleManage}
                        rightIcon={
                            <ArrowRight
                                className={`w-4 h-4 transition-transform duration-200
                        ${isHovered ? "translate-x-1" : ""}`}
                            />
                        }
                        className="transition-all duration-200 hover:shadow-md hover:border-slate-400"
                    >
                        Manage Subscription
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleUpgrade}
                        leftIcon={
                            <Crown
                                className={`w-4 h-4 transition-transform duration-300
                        ${isHovered ? "rotate-12" : ""}`}
                            />
                        }
                        className="bg-slate-800 hover:bg-slate-900 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                        Upgrade to Premium
                    </Button>
                )}
            </Card>
        </div>
    );
};
