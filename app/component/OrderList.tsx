"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/utils/auth";

interface Order {
    id: string;
    customer_id: string;
    conversation: {
        customer_name: string | null;
        customer_id: string;
    };
    items: any;
    total_amount: number;
    status: string;
    created_at: string;
}

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

            const response = await fetch(`${baseUrl}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELIVERED': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h2>
                        <p className="text-sm text-gray-500">Track and manage purchases made through Soro.</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-sm flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">When customers place orders via WhatsApp, they will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">#{order.id.split('-')[0]}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {order.conversation.customer_name || 'Customer'} • {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 md:px-6">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Items</div>
                                    <div className="flex flex-wrap gap-2">
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-gray-700">{item.name}</span>
                                                <span className="text-[10px] text-indigo-600 font-black">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</div>
                                    <div className="text-xl font-black text-indigo-600">
                                        ₦{order.total_amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
