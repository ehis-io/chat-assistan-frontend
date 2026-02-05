"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "../../component/DashboardSidebar";
import CardForm from "../../component/CardForm";
import { getUserInfo, checkPaymentStatus, getToken, setUserInfo } from "@/lib/utils/auth";

export default function BillingPage() {
    const router = useRouter();
    const [business, setBusiness] = useState<any>(null);
    const [hasPaid, setHasPaid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCardForm, setShowCardForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [fetchingTransactions, setFetchingTransactions] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchTransactions = async () => {
        setFetchingTransactions(true);
        try {
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/payment/transactions`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.status === 200 || result.data) {
                setTransactions(result.data);
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
        } finally {
            setFetchingTransactions(false);
        }
    };

    useEffect(() => {
        const info = getUserInfo();
        if (info && info.business) {
            setBusiness(info.business);
        } else {
            router.push("/dashboard");
            return;
        }


        const verifyPayment = async () => {
            const status = await checkPaymentStatus();
            setHasPaid(status.hasValidPayment);
            setLoading(false);
        };

        verifyPayment();
        fetchTransactions();
    }, []);

    const handleCardSuccess = async (response: any) => {
        console.log("Card setup successful", response);
        setSuccessMessage("Payment processing... Verifying transaction...");
        setShowCardForm(false);

        try {
            const reference = response.reference;
            if (reference) {
                const token = getToken();
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

                // Manually verify to trigger backend processing (and save auth code)
                // This is critical for localhost where webhooks might not reach
                await fetch(`${baseUrl}/payment/verify/${reference}`, {
                    method: 'GET',
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error("Verification trigger failed", err);
        }

        setSuccessMessage("Payment successful! Updating your subscription...");
        setHasPaid(true);

        // Refresh business info from backend
        const status = await checkPaymentStatus();
        setHasPaid(status.hasValidPayment);
        fetchTransactions(); // Refresh the list

        if (status.hasValidPayment) {
            const info = getUserInfo();
            if (info && info.business) {
                const updatedBusiness = { ...info.business, payment_type: 'PREMIUM' };
                // We might want to reload the user info fully to get the sensitive auth_code flag if needed
                // but strictly speaking we just need to know they are premium
                setBusiness(updatedBusiness);
                setUserInfo({ ...info, business: updatedBusiness });
            }
        }

        setTimeout(() => setSuccessMessage(""), 5000);
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to stop your subscription? Your card will be removed and you won't be charged again.")) return;

        setCancelling(true);
        try {
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/payment/cancel-subscription`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setSuccessMessage("Subscription cancelled. Your card has been removed.");
                // Update local state to reflect removal
                setBusiness((prev: any) => ({ ...prev, paystack_auth_code: null }));
                // We don't change hasPaid immediately to false because they might still have time
            } else {
                alert("Failed to cancel subscription. Please try again.");
            }
        } catch (err) {
            console.error("Error cancelling subscription:", err);
            alert("An error occurred.");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading Billing...</div>;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            {/* We reuse the sidebar but since this is a separate page path, 
                management might be slightly different if sidebar expects SPA transitions.
                However, links like /dashboard/templates already existed as <a> tags.
            */}
            <div className="w-96 flex-shrink-0">
                <DashboardSidebar
                    chats={[]} // Or fetch chats if needed
                    activeChat={null}
                    onSelectChat={() => router.push("/dashboard")}
                    onShowAnalysis={() => router.push("/dashboard")}
                    onShowSettings={() => router.push("/dashboard")}
                />
            </div>

            <main className="flex-1 overflow-y-auto p-12">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Billing & <span className="text-blue-600">Subscription</span></h1>
                        <p className="text-gray-500 text-lg">Manage your payment methods and subscription plan.</p>
                    </header>

                    {successMessage && (
                        <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-[2rem] text-green-800 font-bold animate-bounce shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasPaid ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {hasPaid ? 'Active' : 'Free Tier'}
                                </span>
                            </div>
                            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Current Plan</h3>
                            <h2 className="text-3xl font-black text-gray-900 mb-6">{hasPaid ? 'Pro Plan' : 'Free Tier'}</h2>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {hasPaid ? 'Unlimited Messages' : '50 Messages / month'}
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    AI-powered automation
                                </li>
                                {hasPaid && (
                                    <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        PDF Knowledge Base
                                    </li>
                                )}
                            </ul>

                            <p className="text-2xl font-black text-gray-900 mb-2">
                                {hasPaid ? '₦10,000' : '₦0'}
                                <span className="text-gray-400 text-sm font-bold tracking-tight">/ month</span>
                            </p>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:shadow-2xl transition-all duration-500 flex flex-col">
                            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Payment Method</h3>

                            {hasPaid && business?.paystack_auth_code ? (
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Card ending in ****</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Saved & Active</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCardForm(true)}
                                        className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors"
                                    >
                                        Update Payment Method →
                                    </button>

                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={cancelling}
                                        className="block mt-4 text-red-500 text-xs font-bold hover:text-red-700 transition-colors"
                                    >
                                        {cancelling ? "Removing..." : "Stop Subscription & Remove Card"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-center text-center">
                                    <p className="text-gray-400 text-sm mb-6">No payment method saved.</p>
                                    <button
                                        onClick={() => setShowCardForm(true)}
                                        disabled={hasPaid}
                                        className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${hasPaid ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black'}`}
                                    >
                                        {hasPaid ? 'Subscription Active' : 'Add Payment Card'}
                                    </button>
                                </div>
                            )}

                            {business?.next_billing_date && (
                                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Bill Date</span>
                                    <span className="text-xs font-bold text-gray-800">
                                        {new Date(business.next_billing_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="mt-12 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Billing history</h3>
                                <h2 className="text-xl font-bold text-gray-900">Past Payments</h2>
                            </div>
                            {fetchingTransactions && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            {transactions.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6 text-sm font-bold text-gray-700">
                                                    {new Date(tx.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-gray-800">{tx.description || 'Subscription Payment'}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{tx.reference}</p>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-black text-gray-900 text-right">
                                                    {(tx.amount / 1000).toLocaleString(undefined, {
                                                        style: 'currency',
                                                        currency: tx.currency || 'NGN'
                                                    })}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'SUCCESSFUL' ? 'bg-green-50 text-green-600' :
                                                        tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-red-50 text-red-600'
                                                        }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 font-bold">No transactions found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {showCardForm && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                            <CardForm
                                email={getUserInfo()?.email || ""}
                                onSuccess={handleCardSuccess}
                                onCancel={() => setShowCardForm(false)}
                            />
                        </div>
                    )}

                    <footer className="mt-20 flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        <span>Secure Payments via Paystack</span>
                        <div className="flex gap-4">
                            <a href="/privacy-policy" className="hover:text-gray-500">Privacy</a>
                            <a href="/terms" className="hover:text-gray-500">Terms</a>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
