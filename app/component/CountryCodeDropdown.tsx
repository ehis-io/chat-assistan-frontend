"use client";

import { useState, useRef, useEffect } from "react";

export interface Country {
    name: string;
    code: string;
    iso: string;
    flag: string;
}

export const countries: Country[] = [
    { name: "United States", code: "+1", iso: "US", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧" },
    { name: "Nigeria", code: "+234", iso: "NG", flag: "🇳🇬" },
    { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦" },
    { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺" },
    { name: "India", code: "+91", iso: "IN", flag: "🇮🇳" },
    { name: "Germany", code: "+49", iso: "DE", flag: "🇩🇪" },
    { name: "France", code: "+33", iso: "FR", flag: "🇫🇷" },
    { name: "South Africa", code: "+27", iso: "ZA", flag: "🇿🇦" },
    { name: "Ghana", code: "+233", iso: "GH", flag: "🇬🇭" },
    { name: "Kenya", code: "+254", iso: "KE", flag: "🇰🇪" },
    { name: "United Arab Emirates", code: "+971", iso: "AE", flag: "🇦🇪" },
    { name: "Brazil", code: "+55", iso: "BR", flag: "🇧🇷" },
    { name: "China", code: "+86", iso: "CN", flag: "🇨🇳" },
    { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵" },
];

interface Props {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
}

export default function CountryCodeDropdown({ selectedCountry, onSelect }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 h-full px-3 py-3 rounded-l-xl border-y border-l border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
            >
                <span className="text-xl">{selectedCountry.flag}</span>
                <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeInUp">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            placeholder="Search country or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredCountries.map((country) => (
                            <button
                                key={`${country.iso}-${country.code}`}
                                type="button"
                                onClick={() => {
                                    onSelect(country);
                                    setIsOpen(false);
                                    setSearch("");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="text-xl">{country.flag}</span>
                                <span className="flex-1 text-sm font-medium text-gray-700">{country.name}</span>
                                <span className="text-sm text-gray-400 font-mono">{country.code}</span>
                            </button>
                        ))}
                        {filteredCountries.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
