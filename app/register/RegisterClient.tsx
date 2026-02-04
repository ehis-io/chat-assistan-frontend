"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import Navbar from "../component/Navbar";
import { useRouter, useSearchParams } from "next/navigation";

import { api } from "../../lib/api";
import { useToast } from "../component/ToastProvider";


export default function RegisterClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();


    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        consent: false
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [planDetail, setPlanDetail] = useState<{ name: string; ref?: string } | null>(null);

    useEffect(() => {
        // Check if user is already authenticated
        import("@/lib/utils/auth").then(({ isAuthenticated, isAdmin }) => {
            if (isAuthenticated()) {
                if (isAdmin()) {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
            }
        });

        const plan = searchParams.get("plan");
        const ref = searchParams.get("payment_ref");
        if (plan) {
            setPlanDetail({ name: plan, ref: ref || undefined });
        }
    }, [searchParams, router]);

    function formatDOB(date: Date | null) {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const dob = `${year}-${month}-${day}`;
        return new Date(dob).toISOString();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (!formData.consent) {
            setError("You must agree to the Data Usage Policy to continue.");
            setLoading(false);
            return;
        }

        const payload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            password: formData.password,
            birthday: formatDOB(selectedDate)
        };

        try {
            const response = await api.post('/user/create', payload);

            if (!response.success) {
                // Check if it's a specific duplicate entry error
                if (response.code === 'DUPLICATE_ENTRY') {
                    setError("Email address is already in use.");
                } else {
                    setError(response.error || "Registration failed.");
                }
                showToast(response.error || "Registration failed.", "error");
                setLoading(false);
                return;
            }

            showToast("Account created successfully!", "success");

            // Successful registration, redirect to onboarding if they have a plan
            const redirectUrl = planDetail
                ? `/onboarding?plan=${planDetail.name}&ref=${planDetail.ref || ""}`
                : "/login?registered=true";

            router.push(redirectUrl);

        } catch (err: any) {
            console.error(err);
            const msg = "Something went wrong. Please check your connection.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen items-center justify-center bg-[var(--background-color)] px-4 py-24">
                <main className="w-full max-w-lg bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animate-fadeInSlow">

                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">Create an Account</h2>
                            <p className="text-[var(--text-muted)]">Join thousands of businesses automating their support.</p>

                            {planDetail && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                                    <span className="font-bold uppercase">{planDetail.name} Plan</span> Selected
                                    {planDetail.ref && <span className="block mt-1 opacity-70">Payment Ref: {planDetail.ref}</span>}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                        className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                        className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    required
                                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Date of Birth</label>
                                <div className="w-full">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={date => setSelectedDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select date"
                                        className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                        maxDate={new Date()}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="flex items-start gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="consent"
                                    name="consent"
                                    checked={formData.consent}
                                    onChange={handleChange}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)] cursor-pointer"
                                />
                                <label htmlFor="consent" className="text-sm text-[var(--text-muted)] leading-tight cursor-pointer">
                                    I agree to the <Link href="/privacy-policy" className="text-[var(--primary-color)] hover:underline font-medium">Data Usage Policy</Link>. I understand that my data will be used to provide and improve WhatsApp chat assistance services.
                                </label>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[var(--primary-color)] py-3.5 text-white font-semibold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-[var(--text-muted)]">
                                Already have an account?{" "}
                                <Link href="/login" className="font-semibold text-[var(--primary-color)] hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}

