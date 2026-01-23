"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from 'next/navigation';
import DashboardSidebar from "../component/DashboardSidebar";
import ChatWindow from "../component/ChatWindow";
import ChatAnalysis, { Message as AnalysisMessage } from "../component/ChatAnalysis";
import { loadMetaSdk, launchEmbeddedSignup, linkWhatsAppBusinessInBackend } from "@/lib/utils/metaSdk";

// Mock data removed

interface Message {
    id: string;
    text: string;
    sender: "user" | "contact";
    timestamp: string;
    status?: "sent" | "delivered" | "read";
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Added router for redirects if needed
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [metaConnected, setMetaConnected] = useState(false);
    const [business, setBusiness] = useState<any>(null);
    const [loadingChats, setLoadingChats] = useState(false);

    useEffect(() => {
        const { getUserInfo } = require("@/lib/utils/auth");
        const info = getUserInfo();
        if (info && info.business) {
            setBusiness(info.business);
        }
        fetchChats();
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat);
        }
    }, [activeChat]);

    const fetchChats = async () => {
        try {
            setLoadingChats(true);
            const { getToken } = require("@/lib/utils/auth");
            const token = getToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/chat/conversations?take=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Map backend data to frontend format
                const mappedChats = data.map((c: any) => {
                    const lastMsg = c.messages?.[0];
                    return {
                        id: c.id,
                        name: c.customer_name || c.customer_id,
                        phoneNumber: c.customer_id, // Map customer_id (phone) so we can send messages
                        lastMessage: lastMsg?.content || "No messages",
                        timestamp: lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                        unread: 0, // TODO: Implement unread count
                        avatar: c.customer_name ? c.customer_name.substring(0, 2).toUpperCase() : "U"
                    };
                });
                setChats(mappedChats);

                // If no active chat and we have chats, select first
                if (!activeChat && mappedChats.length > 0 && !showAnalysis) {
                    setActiveChat(mappedChats[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoadingChats(false);
        }
    };

    const fetchMessages = async (chatId: string) => {
        try {
            const { getToken } = require("@/lib/utils/auth");
            const token = getToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/chat/messages/${chatId}?take=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Map backend messages to frontend format
                const mappedMessages = data.map((m: any) => ({
                    id: m.id,
                    text: m.content,
                    sender: m.is_from_business ? "user" : "contact",
                    timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "sent" // Default status
                }));
                // Backend returns desc (newest first) usually, but we want chronological (asc)
                // ChatService fetchMessages sorts asc, so we should be good.
                setMessages(mappedMessages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'access_denied') {
            setErrorMessage('Access Denied: You do not have admin privileges to access that page.');
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
        // ... existing logic ...
    }

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId);
        setShowAnalysis(false);
    };

    const handleSendMessage = async (message: string) => {
        if (!activeChat) return;

        // Optimistic update
        const newItem: Message = {
            id: Date.now().toString(),
            text: message,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent"
        };
        setMessages(prev => [...prev, newItem]);

        try {
            const { getToken } = require("@/lib/utils/auth");
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

            // Find customer phone number from chat
            const currentChat = chats.find(c => c.id === activeChat);

            if (!currentChat?.phoneNumber) {
                console.error("No phone number found for chat", currentChat);
                setErrorMessage("Cannot send message: Missing customer phone number");
                return;
            }

            await fetch(`${baseUrl}/chat/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phoneNumber: currentChat.phoneNumber,
                    id: currentChat.id, // Conversation ID
                    message: message
                })
            });

            // Refresh messages
            fetchMessages(activeChat);

        } catch (error) {
            console.error("Failed to send message:", error);
            setErrorMessage("Failed to send message");
        }
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
                            allMessages={{} as any} // Disable analysis feed for now as data structure mismatches
                        />
                    ) : activeChat && activeChatData ? (
                        <ChatWindow
                            chatName={activeChatData.name}
                            messages={messages}
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