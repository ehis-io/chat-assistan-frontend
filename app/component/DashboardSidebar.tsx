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
    onUploadClick?: () => void; // Added callback
}

export default function DashboardSidebar({ chats, activeChat, onSelectChat, onShowAnalysis, onUploadClick }: DashboardSidebarProps) {
    return (
        <div className="h-full bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[var(--text-color)]">Messages</h1>
                        <span className="bg-blue-600 text-[10px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onShowAnalysis}
                            className="p-2 hover:bg-blue-50 rounded-full transition-colors group"
                            title="Analyze All Chats"
                        >
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </button>
                        <a
                            href="/dashboard/templates"
                            className="p-2 hover:bg-green-50 rounded-full transition-colors group"
                            title="Message Templates"
                        >
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </a>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Prominent PDF Upload Button */}
                <button
                    onClick={() => {
                        onShowAnalysis(); // Navigate to analysis view first
                        // Small delay to allow render, or let parent handle the logic
                        if (onUploadClick) onUploadClick();
                    }}
                    className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-md transition-all group active:scale-95"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-semibold text-sm">Upload Knowledge</span>
                </button>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${activeChat === chat.id ? 'bg-blue-50 border-l-4 border-l-[var(--primary-color)]' : ''
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {chat.avatar}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-[var(--text-color)] truncate">{chat.name}</h3>
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.timestamp}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <span className="ml-2 bg-[var(--primary-color)] text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Logout Section */}
                <div className="p-4 border-t border-gray-200">
                    <a
                        href="/pricing"
                        className="w-full flex items-center gap-3 px-4 py-3 mb-2 text-[#1877F2] font-medium hover:bg-blue-50 rounded-xl transition-all group border border-[#1877F2]/10"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        View Pricing & Payment
                    </a>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
