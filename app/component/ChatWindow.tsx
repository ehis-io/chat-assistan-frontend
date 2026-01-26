"use client";

import { useState } from "react";
import Link from "next/link";

interface Message {
    id: string;
    text: string;
    sender: "user" | "contact" | "assistant";
    timestamp: string;
    status?: "sent" | "delivered" | "read";
}

interface ChatWindowProps {
    chatName: string;
    messages: Message[];
    onSendMessage: (message: string) => void;
}

export default function ChatWindow({ chatName, messages, onSendMessage }: ChatWindowProps) {
    const [inputMessage, setInputMessage] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    // Removed localMessages state to rely on props (SSOT)

    const mockTemplates = [
        { id: "1", name: "welcome_message", text: "Hello! Welcome to our service. How can we help you today?", category: "UTILITY" },
        { id: "2", name: "order_confirmation", text: "Your order has been confirmed. It will be delivered by tomorrow.", category: "TRANSACTIONAL" },
        { id: "3", name: "appointment_reminder", text: "Friendly reminder of your appointment scheduled for tomorrow.", category: "UTILITY" }
    ];

    const handleSend = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage("");
        }
    };

    const handleSendTemplate = (template: typeof mockTemplates[0]) => {
        onSendMessage(template.text);
        setShowTemplates(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 relative">
            {/* Template Selection Modal/Popup */}
            {showTemplates && (
                <div className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-10 animate-fadeInUp max-w-md mx-auto ring-1 ring-black/5">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <div>
                            <h3 className="font-bold text-gray-800">Approved Templates</h3>
                            <p className="text-[10px] text-gray-500">Only approved templates can initiate conversations.</p>
                        </div>
                        <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                        {mockTemplates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleSendTemplate(t)}
                                className="w-full text-left p-4 hover:bg-blue-50 rounded-xl transition-all group relative border border-transparent hover:border-blue-100"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-wider">{t.name}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">APPROVED</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2 italic">"{t.text}"</p>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-b-2xl border-t border-gray-100 text-center">
                        <Link href="/dashboard/templates" className="text-xs text-[var(--primary-color)] font-bold hover:underline">
                            Manage Templates →
                        </Link>
                    </div>
                </div>
            )}
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-semibold">
                            {chatName.charAt(0)}
                        </div>
                        <div className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-[var(--text-color)]">{chatName}</h2>
                        <p className="text-[10px] text-green-500 font-medium uppercase tracking-tighter">Verified WhatsApp Business Account</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${message.sender === "user"
                                ? "bg-[var(--primary-color)] text-white rounded-tr-none"
                                : message.sender === "assistant"
                                    ? "bg-blue-50 border border-blue-100 text-[var(--primary-color)] rounded-tl-none"
                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                }`}
                        >
                            {message.sender === "assistant" && (
                                <div className="flex items-center gap-1.5 mb-1">
                                    <svg className="w-3 h-3 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Assistant</span>
                                </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            <div className="flex items-center justify-end gap-1.5 mt-2">
                                <span className={`text-[10px] ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                                    {message.timestamp}
                                </span>
                                {message.sender === "user" && (
                                    <span className="text-blue-100">
                                        {message.status === "sent" ? (
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                                                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7l-.708.708L11 15.793l4.854-4.854a.5.5 0 0 0-.708-.708L11 14.379l-2.854-2.854z" />
                                            </svg>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 pb-8">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex gap-1 mb-1">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className={`p-3 rounded-xl transition-all border ${showTemplates ? 'bg-blue-50 text-[var(--primary-color)] border-blue-200' : 'hover:bg-gray-100 text-gray-500 border-transparent hover:border-gray-200'}`}
                            title="Insert Template"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[var(--primary-color)] focus-within:bg-white transition-all px-4 py-1">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            rows={1}
                            className="w-full py-3 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 text-sm min-h-[44px] max-h-32"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim()}
                        className="mb-1 p-3.5 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--accent-color)] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <svg className="w-5 h-5 rotate-45 -translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
