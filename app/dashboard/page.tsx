"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardSidebar from "../component/DashboardSidebar";
import ChatWindow from "../component/ChatWindow";
import ChatAnalysis from "../component/ChatAnalysis";

// Mock data: Simulates a real-time chat database for demonstration purposes
const mockChats = [
    {
        id: "1",
        name: "John Doe",
        lastMessage: "Hey! How are you doing?",
        timestamp: "2m ago",
        unread: 2,
        avatar: "JD"
    },
    {
        id: "2",
        name: "Sarah Smith",
        lastMessage: "Thanks for your help!",
        timestamp: "1h ago",
        unread: 0,
        avatar: "SS"
    },
    {
        id: "3",
        name: "Mike Johnson",
        lastMessage: "See you tomorrow",
        timestamp: "3h ago",
        unread: 1,
        avatar: "MJ"
    },
    {
        id: "4",
        name: "Emily Brown",
        lastMessage: "That sounds great!",
        timestamp: "Yesterday",
        unread: 0,
        avatar: "EB"
    }
];

const mockMessages = {
    "1": [
        { id: "1", text: "Hey! How are you doing?", sender: "contact" as const, timestamp: "10:30 AM" },
        { id: "2", text: "I'm doing great, thanks! How about you?", sender: "user" as const, timestamp: "10:32 AM" },
        { id: "3", text: "Pretty good! Just working on some projects", sender: "contact" as const, timestamp: "10:33 AM" },
        { id: "4", text: "That's awesome! What are you working on?", sender: "user" as const, timestamp: "10:35 AM" }
    ],
    "2": [
        { id: "1", text: "Thanks for your help!", sender: "contact" as const, timestamp: "9:15 AM" },
        { id: "2", text: "You're welcome! Happy to help anytime", sender: "user" as const, timestamp: "9:20 AM" }
    ],
    "3": [
        { id: "1", text: "See you tomorrow", sender: "contact" as const, timestamp: "8:00 AM" },
        { id: "2", text: "Sounds good! See you then", sender: "user" as const, timestamp: "8:05 AM" }
    ],
    "4": [
        { id: "1", text: "That sounds great!", sender: "contact" as const, timestamp: "Yesterday" }
    ]
};

/**
 * DashboardContent: The core engine of the dashboard.
 * Manages the transition between the AI Chat Analysis view and individual conversation windows.
 */
function DashboardContent() {
    const searchParams = useSearchParams();
    const [activeChat, setActiveChat] = useState<string | null>("1");
    const [chats] = useState(mockChats);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [business, setBusiness] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Retrieve stored user info
        const fetchBusinessStatus = async () => {
            try {
                const { getUserInfo } = await import("@/lib/utils/auth");
                const userInfo = getUserInfo();
                // Business status is retrieved from the stored user info (login data: user.business)
                setBusiness(userInfo?.business || null);
            } catch (err) {
                console.error("Failed to fetch business status", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBusinessStatus();
        const error = searchParams.get('error');
        if (error === 'access_denied') {
            setErrorMessage('Access Denied: You do not have admin privileges to access that page.');
            // Clear error message after 5 seconds
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const handleShowAnalysis = () => {
        setShowAnalysis(true);
        setActiveChat(null);
    };

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId);
        setShowAnalysis(false);
    };

    const handleSendMessage = (message: string) => {
        console.log("Sending message:", message);
        // TODO: Implement actual message sending logic
    };

    const activeChatData = chats.find(chat => chat.id === activeChat);

    // Guard: If business is not connected, show the notice and hide the dashboard
    if (!isLoading && (!business || (business.whatsapp_status === 'NOT_CONNECTED' && !business.whatsapp_connected_at))) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100 animate-fadeIn">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[var(--primary-color)] mx-auto mb-6 relative">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">WhatsApp Not Connected</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your WhatsApp Business connection is currently inactive. This usually means your setup is pending admin approval or the connection was interrupted.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[var(--primary-color)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20"
                        >
                            Refresh Status
                        </button>
                        <button
                            onClick={() => window.location.href = '/onboarding'}
                            className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                        >
                            Back to Onboarding
                        </button>
                    </div>
                    <p className="mt-6 text-[10px] text-gray-400">
                        Estimated setup time: 2-24 hours. You will receive an email once your account is active.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Loading workspace...</div>;
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
            {/* Error Notification */}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-700 font-medium">{errorMessage}</p>
                        <button
                            onClick={() => setErrorMessage(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Section: Sidebar with Chat List and Actions */}
                <div className="w-full md:w-80 flex-shrink-0">
                    <DashboardSidebar
                        chats={chats}
                        activeChat={activeChat}
                        onSelectChat={handleSelectChat}
                        onShowAnalysis={handleShowAnalysis}
                    />
                </div>

                {/* Right Section: Main Content Area (Conditional View) */}
                <div className="flex-1  justify-center  hidden md:flex">
                    {/* View 1: Chat Analysis (Overview of all conversations) */}
                    {showAnalysis ? (
                        <ChatAnalysis
                            chats={chats}
                            allMessages={mockMessages}
                        />
                    ) : activeChat && activeChatData ? (
                        <ChatWindow
                            chatName={activeChatData.name}
                            messages={mockMessages[activeChat as keyof typeof mockMessages] || []}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                                <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { Suspense } from "react";

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}