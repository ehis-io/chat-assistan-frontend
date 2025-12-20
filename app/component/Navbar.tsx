"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { isAuthenticated, logout } from "@/lib/utils/auth";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled
            ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 py-3 shadow-sm"
            : "bg-transparent py-6"
            }`}>
            <div className="container mx-auto px-6 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 relative bg-gradient-to-tr from-[var(--primary-color)] to-[var(--accent-color)] rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-[var(--primary-color)]/40 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <span className="text-lg">CA</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors">
                        Chat<span className="text-[var(--primary-color)]">Assist</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-10">
                    <Link href="#features" onClick={scrollToFeatures} className="text-sm font-bold text-gray-500 hover:text-[var(--primary-color)] transition-all duration-300 relative group/link">
                        Features
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover/link:w-full"></span>
                    </Link>
                    <Link href="/pricing" className="text-sm font-bold text-gray-500 hover:text-[var(--primary-color)] transition-all duration-300 relative group/link">
                        Pricing
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover/link:w-full"></span>
                    </Link>
                    <Link href="#" className="text-sm font-bold text-gray-500 hover:text-[var(--primary-color)] transition-all duration-300 relative group/link">
                        About
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover/link:w-full"></span>
                    </Link>
                </div>

                {/* Auth & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn ? (
                            <button
                                onClick={() => logout()}
                                className="px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-105"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-[var(--primary-color)] transition-all duration-300 hover:translate-x-1">
                                    Login
                                </Link>
                                <Link href="/register">
                                    <button className="bg-[var(--primary-color)] text-white px-7 py-3 rounded-full text-sm font-bold shadow-lg shadow-[var(--primary-color)]/25 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-1 hover:scale-105 transition-all duration-500">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-2xl transition-all duration-500 origin-top overflow-hidden ${mobileMenuOpen ? "max-h-[400px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
                }`}>
                <div className="container mx-auto px-6 space-y-5">
                    <Link href="#features" onClick={scrollToFeatures} className="block text-lg font-bold text-gray-600 hover:text-[var(--primary-color)] transform transition-all duration-300 hover:translate-x-2">Features</Link>
                    <Link href="/pricing" className="block text-lg font-bold text-gray-600 hover:text-[var(--primary-color)] transform transition-all duration-300 hover:translate-x-2">Pricing</Link>
                    <Link href="#" className="block text-lg font-bold text-gray-600 hover:text-[var(--primary-color)] transform transition-all duration-300 hover:translate-x-2">About</Link>
                    <hr className="border-gray-100" />
                    {isLoggedIn ? (
                        <button
                            onClick={() => logout()}
                            className="w-full py-4 text-lg font-bold text-red-500 bg-red-50/50 hover:bg-red-50 rounded-2xl transition-all duration-300"
                        >
                            Logout
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Link href="/login" className="flex items-center justify-center py-4 text-lg font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-300">Login</Link>
                            <Link href="/register" className="flex items-center justify-center py-4 text-lg font-bold text-white bg-[var(--primary-color)] hover:bg-[var(--accent-color)] rounded-2xl shadow-lg shadow-[var(--primary-color)]/20 transition-all duration-300">Join</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
