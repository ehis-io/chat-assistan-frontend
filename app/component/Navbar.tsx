"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed w-full z-50 bg-[var(--background-color)]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    {/* Placeholder for Logo, since we saw logo.png usage earlier but simplistic */}
                    <div className="w-10 h-10 relative bg-gradient-to-tr from-[var(--primary-color)] to-[var(--accent-color)] rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-[var(--primary-color)]/20 transition-all duration-300">
                        CA
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors">
                        ChatAssist
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" onClick={scrollToFeatures} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">
                        Features
                    </Link>
                    <a href="#" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">
                        Pricing
                    </a>
                    <a href="#" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">
                        About
                    </a>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden md:block text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">
                        Login
                    </Link>
                    <Link href="/register">
                        <button className="bg-[var(--primary-color)] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-[var(--primary-color)]/20 hover:shadow-xl hover:shadow-[var(--primary-color)]/30 hover:-translate-y-0.5 transition-all duration-300">
                            Get Started
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
