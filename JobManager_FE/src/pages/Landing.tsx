import { Link } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import LandingLayout from "@/layout/LandingLayout";

export default function Landing() {
    return (
        <LandingLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden px-6 pt-16 pb-20">
                {/* Animated Background Elements */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 left-[-8rem] h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-indigo-500/5 blur-2xl" />
                </div>

                <div className="relative mx-auto max-w-6xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm text-blue-700 backdrop-blur shadow-sm">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                                <span className="font-medium">Built for company hiring teams</span>
                            </div>
                            {/* Headline */}
                            <div>
                                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                                    Post jobs.
                                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Manage applicants.
                                    </span>
                                    <span className="block text-gray-900">Hire with clarity.</span>
                                </h1>
                                <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                                    DEVision gives companies a fast, organized way to publish roles and move candidates through a simple
                                    pipeline—without losing track of decisions.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Link to="/register" className="inline-flex">
                                    <Button size="lg" className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Create company account
                                            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </Button>
                                </Link>
                                <Link to="/login" className="inline-flex">
                                    <Button variant="secondary" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                                        Log in
                                    </Button>
                                </Link>
                            </div>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-3 text-sm">
                                {['Post jobs', 'Screen applicants', 'Hire with clarity'].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
                                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center gap-6 pt-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="font-medium">Centralized workspace</span>
                                </div>
                                <div className="hidden h-6 w-px bg-gray-300 sm:block" />
                                <div className="hidden items-center gap-2 text-gray-600 sm:flex">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                    </span>
                                    <span className="font-medium">Professional teams</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="lg:justify-self-end">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Live Preview</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-6">
                                Your hiring workspace
                            </div>
                            <Card className="p-8 shadow-2xl border-2 border-gray-100 hover:shadow-3xl transition-shadow duration-300">
                                {/* Dashboard Header */}
                                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                                        <span className="text-xl font-bold">D</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your hiring workspace</div>
                                        <div className="text-lg font-bold text-gray-900">Applicant Pipeline</div>
                                    </div>
                                </div>

                                {/* Pipeline Stats */}
                                <div className="mt-6 space-y-3">
                                    {[
                                        { label: "New Applications", value: "24", color: "blue", icon: "📩", percent: "+12%" },
                                        { label: "In Screening", value: "9", color: "yellow", icon: "🔍", percent: "+3%" },
                                        { label: "Interviewing", value: "4", color: "purple", icon: "💼", percent: "+1%" },
                                        { label: "Offers Made", value: "1", color: "green", icon: "✨", percent: "New!" },
                                    ].map((item, idx) => (
                                        <div
                                            key={item.label}
                                            className="group flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.icon}</span>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                                                    <div className="text-xs text-gray-500">{item.percent}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                                                <svg className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Next Action */}
                                <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-5 py-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-sm font-bold text-gray-900">Next Action</div>
                                    </div>
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                        Review top applicants for <span className="font-semibold text-blue-700">"Frontend Intern"</span> and schedule interviews.
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-20 bg-white">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything you need to hire smarter
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Streamline your recruitment process with powerful tools designed for modern hiring teams.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: (
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">                                    </svg>
                                ),
                                title: "Post jobs quickly",
                                description: "Publish roles with clear descriptions and requirements—then start receiving applicants instantly.",
                                color: "blue"
                            },
                            {
                                icon: (
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">                                    </svg>
                                ),
                                title: "Manage applicants",
                                description: "Keep candidates organized across stages so nothing slips through the cracks.",
                                color: "purple"
                            },
                            {
                                icon: (
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    </svg>
                                ),
                                title: "Make decisions together",
                                description: "Share updates with your team and move faster from screening to offer.",
                                color: "green"
                            }
                        ].map((feature, idx) => (
                            <Card
                                key={idx}
                                className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer"
                            >
                                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-6 py-16 bg-gradient-to-r from-blue-200 to-purple-200">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-8 md:grid-cols-4 text-center text-heading">
                        {[
                            { value: "10K+", label: "Jobs Posted" },
                            { value: "50K+", label: "Applicants Managed" },
                            { value: "500+", label: "Companies" },
                            { value: "98%", label: "Satisfaction Rate" }
                        ].map((stat, idx) => (
                            <div key={idx} className="group cursor-pointer">
                                <div className="text-5xl font-extrabold mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {stat.value}
                                </div>
                                <div className="text-blue-700 text-lg font-medium group-hover:scale-110 transition-transform duration-300">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
                <div className="mx-auto max-w-6xl">
                    <Card className="relative overflow-hidden border-2 border-blue-200 bg-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                        <div className="relative p-10 sm:p-12">
                            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                        Ready to hire with DEVision?
                                    </h2>
                                    <p className="text-lg text-gray-600">
                                        Create an account and post your first job today. Join hundreds of companies already hiring smarter.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4 sm:flex-row shrink-0">
                                    <Link to="/register" className="inline-flex">
                                        <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                                            Create account
                                        </Button>
                                    </Link>
                                    <Link to="/login" className="inline-flex">
                                        <Button variant="ghost" size="lg" className="border-2 border-gray-300 hover:border-gray-400">
                                            Log in
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </LandingLayout>
    );
}
