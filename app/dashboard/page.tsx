"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from 'next/navigation';
import DashboardSidebar from "../component/DashboardSidebar";
import ChatWindow from "../component/ChatWindow";
import ChatAnalysis, { Message as AnalysisMessage } from "../component/ChatAnalysis";
import { loadMetaSdk, launchEmbeddedSignup, linkWhatsAppBusinessInBackend } from "@/lib/utils/metaSdk";
import PdfKnowledgeUpload from "../component/PdfKnowledgeUpload";
import BusinessSettings from "../component/BusinessSettings";
import OrderList from "../component/OrderList";
import { setUserInfo, getUserInfo, checkPaymentStatus, getToken } from "@/lib/utils/auth";

// Mock data removed

interface Message {
    id: string;
    text: string;
    sender: "user" | "contact" | "assistant";
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
    const [hasPaid, setHasPaid] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(true);
    const [triggerUpload, setTriggerUpload] = useState(false);
    const [allMessages, setAllMessages] = useState<Record<string, any[]>>({});
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [hasNewOrders, setHasNewOrders] = useState(false);
    const [prevPendingCount, setPrevPendingCount] = useState(0);

    useEffect(() => {
        const info = getUserInfo();
        if (info && info.business) {
            setBusiness(info.business);
        }
        fetchChats();

        // Check payment status
        const verifyPayment = async () => {
            const status = await checkPaymentStatus();
            setHasPaid(status.hasValidPayment);
            setCheckingPayment(false);
        };
        verifyPayment();
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat);
        }
    }, [activeChat]);

    useEffect(() => {
        if (showAnalysis) {
            fetchAllMessages();
        }
    }, [showAnalysis]);

    const fetchChats = async () => {
        try {
            setLoadingChats(true);
            const token = getToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/chat/conversations?take=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Backend already returns the correctly mapped DTOs
                setChats(data);

                // If no active chat and we have chats, select first
                if (!activeChat && data.length > 0 && !showAnalysis) {
                    setActiveChat(data[0].id);
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
                // Backend already returns the correctly mapped message DTOs
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const fetchAllMessages = async () => {
        try {
            setLoadingAnalytics(true);
            const { getToken } = require("@/lib/utils/auth");
            const token = getToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/chat/all-messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAllMessages(data);
            }
        } catch (error) {
            console.error("Error fetching all messages:", error);
        } finally {
            setLoadingAnalytics(false);
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
        setShowSettings(false);
        setShowOrders(false);
    };

    const handleShowSettings = () => {
        setShowSettings(true);
        setShowAnalysis(false);
        setActiveChat(null);
        setShowOrders(false);
    };

    const handleShowOrders = () => {
        setShowOrders(true);
        setHasNewOrders(false);
        setShowAnalysis(false);
        setShowSettings(false);
        setActiveChat(null);
    };

    const checkForNewOrders = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const response = await fetch(`${baseUrl}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const pendingOrders = data.filter((o: any) => o.status === 'PENDING');
                const currentPendingCount = pendingOrders.length;

                if (currentPendingCount > prevPendingCount) {
                    setHasNewOrders(true);
                }
                setPrevPendingCount(currentPendingCount);
            }
        } catch (err) {
            console.error("New order check failed:", err);
        }
    };

    useEffect(() => {
        // Initial check
        checkForNewOrders();

        // Poll every 30 seconds
        const interval = setInterval(checkForNewOrders, 30000);
        return () => clearInterval(interval);
    }, [prevPendingCount]);

    const handleConnectionStatus = async () => {
        if (!business || !business.id || !business.access_token) return;
        // ... existing logic ...
    }

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId);
        setShowAnalysis(false);
        setShowSettings(false);
        setShowOrders(false);
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

            if (!token) {
                console.error("No authentication token found");
                setErrorMessage("Authentication error: Please log in again");
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

            // Find customer phone number from chat
            const currentChat = chats.find(c => c.id === activeChat);

            if (!currentChat?.phoneNumber) {
                console.error("No phone number found for chat", currentChat);
                setErrorMessage("Cannot send message: Missing customer phone number");
                return;
            }

            console.log(`Sending message to ${currentChat.phoneNumber} (Chat ID: ${currentChat.id})`);

            const response = await fetch(`${baseUrl}/chat/send-message`, {
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to send message:", response.status, errorData);
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            console.log("Message sent successfully");

            // Refresh messages
            fetchMessages(activeChat);

        } catch (error: any) {
            console.error("Failed to send message:", error);
            setErrorMessage(`Failed to send message: ${error.message}`);
            // Remove optimistic update if failed? Maybe later.
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
                        onUploadClick={() => setTriggerUpload(prev => !prev)}
                        onShowSettings={handleShowSettings}
                        onShowOrders={handleShowOrders}
                        hasNewOrders={hasNewOrders}
                    />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 justify-center hidden md:flex overflow-hidden">
                    {showAnalysis ? (
                        <div className="flex flex-col w-full overflow-y-auto">
                            {/* PDF Upload Section - Only if paid */}
                            {hasPaid && (
                                <div className="p-6 pb-0">
                                    <PdfKnowledgeUpload
                                        triggerUpload={triggerUpload}
                                        onUploadTriggered={() => setTriggerUpload(false)} // Reset trigger immediately
                                    />
                                </div>
                            )}
                            {!hasPaid && !checkingPayment && (
                                <div className="p-6 pb-0">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
                                        <div className="flex items-center mb-4 md:mb-0">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-indigo-900 font-semibold">Pro Feature: PDF Knowledge Base</h4>
                                                <p className="text-indigo-700 text-sm">Upload custom PDFs to train your AI on your specific business knowledge.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push('/pricing')}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                        >
                                            Upgrade Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            <ChatAnalysis
                                chats={chats}
                                allMessages={allMessages}
                            />
                        </div>
                    ) : showSettings ? (
                        <div className="flex flex-col w-full h-full p-6 overflow-hidden">
                            <BusinessSettings
                                business={business}
                                onClose={() => setShowSettings(false)}
                                onUpdate={(updatedBusiness) => {
                                    setBusiness(updatedBusiness);
                                    // Update local info too if needed
                                    const info = getUserInfo() || {};
                                    setUserInfo({ ...info, business: updatedBusiness });
                                }}
                            />
                        </div>
                    ) : showOrders ? (
                        <OrderList />
                    ) : activeChat && activeChatData ? (
                        <ChatWindow
                            chatName={activeChatData.name || "Unknown"}
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