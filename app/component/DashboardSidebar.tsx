"use client";
import { logout } from "@/lib/utils/auth";
import { useState } from "react";

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    avatar: string;
}

interface DashboardSidebarProps {
    chats: Chat[];
    activeChat: string | null;
    onSelectChat: (chatId: string) => void;
    onShowAnalysis: () => void;
    onUploadClick?: () => void;
    onShowSettings: () => void;
    onShowOrders?: () => void;
    hasNewOrders?: boolean;
}

export default function DashboardSidebar({
    chats,
    activeChat,
    onSelectChat,
    onShowAnalysis,
    onUploadClick,
    onShowSettings,
    onShowOrders,
    hasNewOrders
}: DashboardSidebarProps) {
    const [activeTab, setActiveTab] = useState<'chats' | 'analysis' | 'orders' | 'settings'>('chats');

    const handleTabChange = (tab: 'chats' | 'analysis' | 'orders' | 'settings', callback?: () => void) => {
        setActiveTab(tab);
        if (callback) callback();
    };

    return (
        <div className="h-full flex bg-white border-r border-gray-200">
            {/* Navigation Rail (Left) */}
            <div className="w-16 flex-shrink-0 bg-[#f8fafc] border-r border-gray-200 flex flex-col items-center py-6 gap-6">
                <div className="flex flex-col items-center gap-6 flex-1">
                    {/* Home/Chats Icon */}
                    <button
                        onClick={() => handleTabChange('chats')}
                        className={`p-3 rounded-xl transition-all group relative ${activeTab === 'chats' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-white hover:text-blue-600 shadow-sm border border-transparent hover:border-gray-100'}`}
                        title="Messages"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>

                    {/* Analysis Icon */}
                    <button
                        onClick={() => handleTabChange('analysis', onShowAnalysis)}
                        className={`p-3 rounded-xl transition-all group relative ${activeTab === 'analysis' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-white hover:text-blue-600 shadow-sm border border-transparent hover:border-gray-100'}`}
                        title="Analysis"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </button>

                    {/* Orders Icon */}
                    <button
                        onClick={() => handleTabChange('orders', onShowOrders)}
                        className={`p-3 rounded-xl transition-all group relative ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-white hover:text-blue-600 shadow-sm border border-transparent hover:border-gray-100'}`}
                        title="Orders"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {hasNewOrders && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                            </span>
                        )}
                    </button>

                    {/* Templates Icon */}
                    <a
                        href="/dashboard/templates"
                        className="p-3 rounded-xl text-gray-500 hover:bg-white hover:text-green-600 transition-all shadow-sm border border-transparent hover:border-gray-100 group"
                        title="Templates"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </a>
                </div>

                <div className="flex flex-col items-center gap-6 mt-auto">
                    {/* Settings Icon */}
                    <button
                        onClick={() => handleTabChange('settings', onShowSettings)}
                        className={`p-3 rounded-xl transition-all group relative ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-white hover:text-indigo-600 shadow-sm border border-transparent hover:border-gray-100'}`}
                        title="Settings"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Logout Icon */}
                    <button
                        onClick={() => logout()}
                        className="p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all group"
                        title="Logout"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content Panel (Right) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Section */}
                <div className="p-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {activeTab === 'chats' ? 'Messages' :
                                    activeTab === 'analysis' ? 'Analytics' :
                                        activeTab === 'orders' ? 'Orders' : 'Settings'}
                            </h2>
                            <span className="bg-blue-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm shadow-blue-100">Pro</span>
                        </div>
                    </div>

                    {/* Chat-specific actions */}
                    {activeTab === 'chats' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    onShowAnalysis();
                                    if (onUploadClick) onUploadClick();
                                }}
                                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all active:scale-[0.98] group"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="font-semibold text-sm">Upload Knowledge</span>
                            </button>

                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2 pointer-events-none group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'chats' ? (
                        <div className="flex flex-col">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => onSelectChat(chat.id)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-gray-50/50 hover:bg-blue-50/30 relative group ${activeChat === chat.id ? 'bg-blue-50/50' : ''}`}
                                >
                                    {activeChat === chat.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                                    )}

                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                                        {chat.avatar}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className={`text-[15px] font-bold truncate ${activeChat === chat.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {chat.name}
                                            </h3>
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{chat.timestamp}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                                {chat.lastMessage}
                                            </p>
                                            {chat.unread > 0 && (
                                                <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold px-1 rounded-full flex items-center justify-center shadow-sm">
                                                    {chat.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Select an item from the sidebar to view details.
                        </div>
                    )}
                </div>

                {/* Pricing Shortcut */}
                <div className="p-4 border-t border-gray-100 bg-[#fafafa]">
                    <a
                        href="/dashboard/billing"
                        className="flex items-center gap-3 px-4 py-2.5 text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 group shadow-sm"
                    >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        MANAGE SUBSCRIPTION
                    </a>
                </div>
            </div>
        </div>
    );
}
