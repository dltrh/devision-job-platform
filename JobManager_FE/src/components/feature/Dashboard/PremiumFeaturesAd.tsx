import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Zap, Target, Bot, Rocket, Bell, ArrowRight, Check } from "lucide-react";
import { ROUTES } from "@/utils/constants";

interface PremiumFeaturesAdProps {
    className?: string;
}

export const PremiumFeaturesAd: React.FC<PremiumFeaturesAdProps> = ({ className = "" }) => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Zap className="w-4 h-4" />,
            title: "Real-time candidate alerts",
        },
        {
            icon: <Target className="w-4 h-4" />,
            title: "Smart hiring criteria",
        },
        {
            icon: <Bot className="w-4 h-4" />,
            title: "Automated talent matching",
        },
        {
            icon: <Rocket className="w-4 h-4" />,
            title: "Priority candidate access",
        },
        {
            icon: <Bell className="w-4 h-4" />,
            title: "Subscription management",
        },
    ];

    const handleUpgrade = () => {
        navigate(`${ROUTES.SUBSCRIPTION}/upgrade`);
    };

    return (
        <Card
            padding="none"
            className={`overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg ${className}`}
        >
            {/* Compact Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Premium Features</h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        $30/mo
                    </span>
                </div>
            </div>

            {/* Features List */}
            <div className="p-4 space-y-2">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-slate-700">{feature.title}</span>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="px-4 pb-4">
                <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    onClick={handleUpgrade}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-medium transition-all"
                >
                    View Plans
                </Button>
                <p className="text-xs text-center text-slate-400 mt-2">
                    Cancel anytime • No hidden fees
                </p>
            </div>
        </Card>
    );
};

export default PremiumFeaturesAd;
