import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[var(--primary-color)]/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--accent-color)]/5 rounded-full blur-3xl -z-10"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Content */}
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-sm font-semibold mb-6 animate-fadeInSlow">
                            <span className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></span>
                            AI-Powered Support
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--text-color)] mb-6 leading-[1.1] animate-fadeInSlow">
                            Customer support that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)]">never sleeps.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fadeInDelay">
                            Automate conversations, solve problems instantly, and delight your customers with an intelligent AI assistant that works 24/7.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slideUpSlow">
                            <Link href="/register">
                                <button className="min-w-[160px] bg-[var(--primary-color)] text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-1 transition-all duration-300">
                                    Start Free Trial
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="min-w-[160px] bg-white text-[var(--text-color)] border border-gray-200 px-8 py-4 rounded-full font-semibold hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:-translate-y-1 transition-all duration-300">
                                    Live Demo
                                </button>
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-[var(--text-muted)] opacity-80">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                14-day free trial
                            </div>
                        </div>
                    </div>

                    {/* Visual/Image */}
                    <div className="lg:w-1/2 relative animate-floatSlow">
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                            {/* Mockup UI */}
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 aspect-[4/3] flex items-center justify-center relative">
                                {/* Abstract Representation of Chat Interface */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white/50"></div>
                                <div className="w-full max-w-sm space-y-4 p-6 relative z-10">
                                    {/* Message 1 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                            <div className="h-2 w-24 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-2 w-48 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>
                                    {/* Message 2 (Right) */}
                                    <div className="flex items-start gap-3 justify-end">
                                        <div className="bg-[var(--primary-color)] p-3 rounded-2xl rounded-tr-none shadow-md shadow-[var(--primary-color)]/20">
                                            <div className="h-2 w-32 bg-white/40 rounded mb-2"></div>
                                            <div className="h-2 w-40 bg-white/20 rounded"></div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex-shrink-0"></div>
                                    </div>
                                    {/* Message 3 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                            <div className="h-2 w-36 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-2 w-20 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative blurry elements behind image */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] opacity-20 blur-2xl -z-10 rounded-3xl"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}
