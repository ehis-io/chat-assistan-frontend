"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardSidebar from "../component/DashboardSidebar";
import ChatWindow from "../component/ChatWindow";
import ChatAnalysis from "../component/ChatAnalysis";
import { loadMetaSdk, launchEmbeddedSignup, linkWhatsAppBusinessInBackend } from "@/lib/utils/metaSdk";

// Mock data
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

function DashboardContent() {
    const searchParams = useSearchParams();
    const [activeChat, setActiveChat] = useState<string | null>("1");
    const [chats] = useState(mockChats);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [metaConnected, setMetaConnected] = useState(false);
    const [business, setBusiness] = useState<any>(null);

    useEffect(() => {
        const { getUserInfo } = require("@/lib/utils/auth");
        const info = getUserInfo();
        if (info && info.business) {
            setBusiness(info.business);
        }
    }, []);

    useEffect(() => {
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


    const handleConnectionStatus = async () => {
        if (!business || !business.id || !business.access_token) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const response = await fetch(`${baseUrl}/api/v1/business/${business.id}/connection-status`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${business.access_token}`
                }
            });
            // Handle response...
        } catch (error) {
            console.error("Failed to fetch connection status:", error);
        }
    }

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId);
        setShowAnalysis(false);
    };

    const handleSendMessage = (message: string) => {
        console.log("Sending message:", message);
        // TODO: Implement actual message sending logic
    };

    const handleMetaLink = async () => {
        try {
            const appId = process.env.NEXT_PUBLIC_META_APP_ID || "";
            if (!appId) {
                alert("Meta configuration is missing (App ID).");
                return;
            }

            await loadMetaSdk(appId);
            const response = await launchEmbeddedSignup();
            console.log("Meta Link response:", response);

            if (response.authResponse?.accessToken) {
                await linkWhatsAppBusinessInBackend(response.authResponse.accessToken);
                setMetaConnected(true);
            }
        } catch (err: any) {
            console.error("Meta Link failed:", err);
            setErrorMessage("Failed to link Meta Portfolio: " + err.message);
        }
    };

    const activeChatData = chats.find(chat => chat.id === activeChat);

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
                {/* Sidebar */}
                <div className="w-full md:w-80 flex-shrink-0">
                    <DashboardSidebar
                        chats={chats}
                        activeChat={activeChat}
                        onSelectChat={handleSelectChat}
                        onShowAnalysis={handleShowAnalysis}
                    />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1  justify-center  hidden md:flex">
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