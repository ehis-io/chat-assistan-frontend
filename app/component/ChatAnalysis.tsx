"use client";

import { useMemo } from "react";

export interface Message {
    id: string;

    conversation_id: string;
    conversation?: Chat;
    customer_name: string;

    message_id: string;
    content?: string

    // message_type: MessageType;
    timestamp: Date;

    is_from_business: boolean;
    ai_generated: boolean;

    raw_payload?: Record<string, any> | null;

    business_id?: string | null;
    // business?: Business;

    created_at: Date;
    updated_at: Date;
}

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    avatar: string;
}

interface ChatAnalysisProps {
    chats: Chat[];
    allMessages: Record<string, Message[]>;
}

export default function ChatAnalysis({ chats, allMessages }: ChatAnalysisProps) {
    // Calculate analytics
    const analytics = useMemo(() => {
        const totalChats = chats.length;
        let totalMessages = 0;
        let userMessages = 0;
        let contactMessages = 0;
        let totalWords = 0;
        const wordFrequency: Record<string, number> = {};
        const contactMessageCounts: Record<string, number> = {};
        const emojiCount = { user: 0, contact: 0 };

        // Simple sentiment analysis (basic keyword matching)
        const positiveWords = ['good', 'great', 'awesome', 'thanks', 'thank', 'happy', 'love', 'excellent', 'wonderful', 'amazing'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'sad', 'sorry', 'problem', 'issue', 'wrong'];
        let positiveMessages = 0;
        let negativeMessages = 0;
        let neutralMessages = 0;

        // Process all messages
        Object.entries(allMessages).forEach(([chatId, messages]) => {
            const chat = chats.find(c => c.id === chatId);
            if (!chat) return;

            contactMessageCounts[chat.name] = messages.length;

            messages.forEach(msg => {
                totalMessages++;
                const words = msg.content?.toString().toLowerCase().split(/\s+/) || [];
                totalWords += words?.length;

                // Count emojis (simple detection)
                const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
                const emojis = msg.content?.toString().match(emojiRegex);
                if (emojis) {
                    if (msg.customer_name === 'user') emojiCount.user += emojis.length;
                    else emojiCount.contact += emojis.length;
                }

                if (msg.customer_name === 'user') {
                    userMessages++;
                } else {
                    contactMessages++;
                }

                // Word frequency (filter common words)
                const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'];
                words.forEach(word => {
                    const cleanWord = word.replace(/[^\w]/g, '');
                    if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
                        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
                    }
                });

                // Sentiment analysis
                const hasPositive = words.some(w => positiveWords.includes(w));
                const hasNegative = words.some(w => negativeWords.includes(w));

                if (hasPositive && !hasNegative) {
                    positiveMessages++;
                } else if (hasNegative && !hasPositive) {
                    negativeMessages++;
                } else {
                    neutralMessages++;
                }
            });
        });

        // Get top words
        const topWords = Object.entries(wordFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        // Get top contacts
        const topContacts = Object.entries(contactMessageCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const avgMessagesPerChat = totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : "0";
        const avgMessageLength = totalMessages > 0 ? (totalWords / totalMessages).toFixed(1) : "0";

        return {
            totalChats,
            totalMessages,
            userMessages,
            contactMessages,
            avgMessagesPerChat,
            avgMessageLength,
            topWords,
            topContacts,
            sentiment: {
                positive: positiveMessages,
                negative: negativeMessages,
                neutral: neutralMessages,
            },
            emojiCount,
        };
    }, [chats, allMessages]);

    const sentimentPercentages = useMemo(() => {
        const total = analytics.sentiment.positive + analytics.sentiment.negative + analytics.sentiment.neutral;
        if (total === 0) return { positive: "0", negative: "0", neutral: "0" };
        return {
            positive: ((analytics.sentiment.positive / total) * 100).toFixed(1),
            negative: ((analytics.sentiment.negative / total) * 100).toFixed(1),
            neutral: ((analytics.sentiment.neutral / total) * 100).toFixed(1),
        };
    }, [analytics.sentiment]);

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-color)]">Chat Analysis</h1>
                        <p className="text-sm text-gray-500">Comprehensive insights from all your conversations</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Overview Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        }
                        title="Total Messages"
                        value={analytics.totalMessages.toLocaleString()}
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                        title="Total Chats"
                        value={analytics.totalChats.toString()}
                        gradient="from-purple-500 to-pink-500"
                    />
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        }
                        title="Avg Messages/Chat"
                        value={analytics.avgMessagesPerChat.toString()}
                        gradient="from-green-500 to-teal-500"
                    />
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        title="Avg Message Length"
                        value={`${analytics.avgMessageLength} words`}
                        gradient="from-orange-500 to-red-500"
                    />
                </div>

                {/* Sentiment Analysis */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sentiment Analysis
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SentimentBar
                            label="Positive"
                            count={analytics.sentiment.positive}
                            percentage={sentimentPercentages.positive}
                            color="bg-green-500"
                            icon="😊"
                        />
                        <SentimentBar
                            label="Neutral"
                            count={analytics.sentiment.neutral}
                            percentage={sentimentPercentages.neutral}
                            color="bg-gray-400"
                            icon="😐"
                        />
                        <SentimentBar
                            label="Negative"
                            count={analytics.sentiment.negative}
                            percentage={sentimentPercentages.negative}
                            color="bg-red-500"
                            icon="😞"
                        />
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Contacts */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Top Contacts
                        </h2>
                        <div className="space-y-3">
                            {analytics.topContacts.map(([name, count], index) => (
                                <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-[var(--text-color)]">{name}</p>
                                        <p className="text-sm text-gray-500">{count} messages</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Word Frequency */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            Most Used Words
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {analytics.topWords.map(([word, count]) => (
                                <div
                                    key={word}
                                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
                                    style={{ fontSize: `${Math.min(16 + count / 2, 24)}px` }}
                                >
                                    {word} <span className="text-xs opacity-80">({count})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Message Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Message Distribution
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                                <span className="font-semibold text-[var(--text-color)]">Your Messages</span>
                                <span className="text-2xl font-bold text-[var(--primary-color)]">{analytics.userMessages}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                                <span className="font-semibold text-[var(--text-color)]">Contact Messages</span>
                                <span className="text-2xl font-bold text-purple-600">{analytics.contactMessages}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50">
                                <span className="font-semibold text-[var(--text-color)]">Your Emojis</span>
                                <span className="text-2xl font-bold text-green-600">{analytics.emojiCount.user} 😀</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50">
                                <span className="font-semibold text-[var(--text-color)]">Contact Emojis</span>
                                <span className="text-2xl font-bold text-orange-600">{analytics.emojiCount.contact} 😊</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ icon, title, value, gradient }: { icon: React.ReactNode; title: string; value: string; gradient: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-md`}>
                {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-[var(--text-color)]">{value}</p>
        </div>
    );
}

function SentimentBar({ label, count, percentage, color, icon }: { label: string; count: number; percentage: string; color: string; icon: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-color)] flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    {label}
                </span>
                <span className="text-sm text-gray-500">{count} msgs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-sm font-semibold text-gray-600 text-right">{percentage}%</p>
        </div>
    );
}
