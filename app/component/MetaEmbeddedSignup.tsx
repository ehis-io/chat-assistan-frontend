'use client';

import { useEffect, useState } from "react";
import {
    loadMetaSdk,
    launchEmbeddedSignup,
    loginWithPermissions,
    fetchBusinesses,
    fetchWabasForBusiness,
    fetchPhoneNumbers
} from "@/lib/utils/metaSdk";

interface MetaEmbeddedSignupProps {
    onSuccess: (data: { code: string; waba_id: string; phone_number_id: string }) => void;
    onError: (error: string) => void;
}

export default function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isManual, setIsManual] = useState(false);

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [wabas, setWabas] = useState<any[]>([]);
    const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);

    const [selectedBusiness, setSelectedBusiness] = useState<string>("");
    const [selectedWaba, setSelectedWaba] = useState<string>("");
    const [accessToken, setAccessToken] = useState<string>("");

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;

    useEffect(() => {
        if (!appId) {
            console.error("Meta App ID is missing in environment variables!");
            onError("Meta configuration error: Missing App ID.");
        }
    }, [appId, onError]);

    /* ================= EMBEDDED SIGNUP LISTENER ================= */

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const allowedOrigins = [
                "https://www.facebook.com",
                "https://web.facebook.com",
                "https://business.facebook.com",
                "https://meta.facebook.com"
            ];

            if (!allowedOrigins.includes(event.origin)) return;

            try {
                let payload: any;

                if (typeof event.data === "string") {
                    // Try JSON first
                    try {
                        payload = JSON.parse(event.data);
                    } catch (e) {
                        // Fallback: Try parsing as Query Params (URLSearchParams)
                        // Meta SDK internal messages (cb=...) use this format
                        if (event.data.includes("=") && (event.data.includes("code") || event.data.includes("access_token"))) {
                            const params = new URLSearchParams(event.data);
                            payload = Object.fromEntries(params.entries());
                            console.log("Captured QueryParam-style message:", payload);
                        } else {
                            // Quietly ignore non-target strings to avoid console noise
                            return;
                        }
                    }
                } else {
                    payload = event.data;
                }

                if (!payload) return;

                // 1. Check for standard Embedded Signup Event (JSON format)
                if (payload.type === "WA_EMBEDDED_SIGNUP_SUCCESS" && payload.data) {
                    console.log("MATCH! WA_EMBEDDED_SIGNUP_SUCCESS JSON event.");
                    alert("Capture Success! WhatsApp account linked.");
                    onSuccess({
                        code: payload.data.code,
                        waba_id: payload.data.waba_id,
                        phone_number_id: payload.data.phone_number_id
                    });
                }
                // 2. Check for alternative/SDK internal format (like what was seen in logs)
                else if (payload.code && payload.waba_id && payload.phone_number_id) {
                    console.log("MATCH! Extracted IDs from alternate format message.");
                    onSuccess({
                        code: payload.code,
                        waba_id: payload.waba_id,
                        phone_number_id: payload.phone_number_id
                    });
                }
                // 3. Check if we just got a token but No IDs (the current blocker)
                else if (payload.access_token || payload.code) {
                    const token = payload.access_token;
                    const code = payload.code || `MANUAL_${Date.now()}`;
                    if (token && !isManual && !isLoading) {
                        console.log("Meta: Token received via postMessage but no IDs. triggering auto-fetch.");
                        fetchAndAutoSelectAssets(token, code);
                    }
                }
                else if (payload.type === "WA_EMBEDDED_SIGNUP_ERROR") {
                    console.error("CAPTURE ERROR!", payload.error_message);
                    alert("Setup Error: " + (payload.error_message || "Meta flow failed."));
                    onError(payload.error_message || "Meta signup failed");
                }
            } catch (err) {
                // Ignore parse errors for unrelated messages
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onSuccess, onError]);

    /* ================= EMBEDDED SIGNUP ================= */

    const fetchAndAutoSelectAssets = async (token: string, code: string) => {
        console.log("Meta: Starting auto-fetch for assets with token...");
        setIsLoading(true);
        setAccessToken(token);
        try {
            const biz = await fetchBusinesses(token);
            setBusinesses(biz);

            if (biz.length === 0) {
                console.log("Meta: No business accounts found.");
                setIsManual(true);
                return;
            }

            // Only auto-select if there is exactly ONE business
            if (biz.length === 1) {
                const businessId = biz[0].id;
                console.log("Meta: Auto-selecting business:", businessId);
                setSelectedBusiness(businessId);
                const fetchedWabas = await fetchWabasForBusiness(businessId, token);
                setWabas(fetchedWabas);

                // Only auto-select if there is exactly ONE WABA
                if (fetchedWabas.length === 1) {
                    const wabaId = fetchedWabas[0].id;
                    console.log("Meta: Auto-selecting WABA:", wabaId);
                    setSelectedWaba(wabaId);
                    const fetchedNumbers = await fetchPhoneNumbers(wabaId, token);
                    setPhoneNumbers(fetchedNumbers);

                    // Only auto-select if there is exactly ONE phone number
                    if (fetchedNumbers.length === 1) {
                        const phoneNumberId = fetchedNumbers[0].id;
                        console.log("Meta: Auto-captured single asset path. Success!");
                        onSuccess({
                            code,
                            waba_id: wabaId,
                            phone_number_id: phoneNumberId
                        });
                        return;
                    }
                }
            }

            // If we reach here, it means we have multiple options or zero found
            console.log("Meta: Multiple assets found or auto-selection impossible. Showing manual picker.");
            setIsManual(true);
        } catch (err: any) {
            console.error("Meta: Auto-fetch error caught:", err);
            setIsManual(true); // Fallback to manual selection screen
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!appId) {
            onError("Meta App ID is missing. Please check your environment variables.");
            return;
        }
        setIsLoading(true);
        try {
            await loadMetaSdk(appId);
            const response = await launchEmbeddedSignup();

            console.log("Meta: launchEmbeddedSignup complete response:", response);

            if (response.status === 'connected' && response.authResponse) {
                const { waba_id, phone_number_id, accessToken: token } = response.authResponse;
                const activeCode = response.authResponse.code || `MANUAL_${Date.now()}`;

                if (activeCode && waba_id && phone_number_id) {
                    console.log("Meta: Captured IDs directly from login callback.");
                    onSuccess({ code: activeCode as string, waba_id: waba_id as string, phone_number_id: phone_number_id as string });
                } else if (token) {
                    console.log("Meta: IDs missing from callback. Attempting auto-fetch with token.");
                    fetchAndAutoSelectAssets(token, activeCode as string);
                }
            }
        } catch (err: any) {
            onError(err.message || "Failed to launch Meta embedded signup");
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= MANUAL FLOW ================= */

    // const handleManualLogin = async () => {
    //     setIsLoading(true);
    //     try {
    //         await loadMetaSdk(appId);

    //         const auth: any = await loginWithPermissions([
    //             "whatsapp_business_management",
    //             "whatsapp_business_messaging",
    //             "business_management"
    //         ]);

    //         setAccessToken(auth.accessToken);

    //         const biz = await fetchBusinesses(auth.accessToken);
    //         setBusinesses(biz);
    //         setIsManual(true);
    //     } catch (err: any) {
    //         onError(err.message || "Manual login failed");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleBusinessSelect = async (businessId: string) => {
        setSelectedBusiness(businessId);
        setIsLoading(true);
        try {
            const wabas = await fetchWabasForBusiness(businessId, accessToken);
            setWabas(wabas);
        } catch (err: any) {
            onError(err.message || "Failed to fetch WABAs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWabaSelect = async (wabaId: string) => {
        setSelectedWaba(wabaId);
        setIsLoading(true);
        try {
            const numbers = await fetchPhoneNumbers(wabaId, accessToken);
            setPhoneNumbers(numbers);
        } catch (err: any) {
            onError(err.message || "Failed to fetch phone numbers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNumberSelect = (phoneNumberId: string) => {
        onSuccess({
            code: `MANUAL_${Date.now()}`,
            waba_id: selectedWaba,
            phone_number_id: phoneNumberId
        });
    };

    /* ================= UI COMPONENTS ================= */

    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const MetaIcon = () => (
        <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.5 15.17c.52.01 1.04-.1 1.54-.33.51-.23.97-.56 1.34-.98 1.48-1.55 3.52-2.51 5.76-2.51 3.5 0 6.36 2.86 6.36 6.36S23.64 24 20.14 24c-2.24 0-4.28-.96-5.76-2.51-.37-.42-.83-.75-1.34-.98-.5-.23-1.02-.34-1.54-.33-.52-.01-1.04.1-1.54.33-.51.23-.97.56-1.34.98-1.48 1.55-3.52 2.51-5.76 2.51C2.86 24 0 21.14 0 17.64s2.86-6.36 6.36-6.36c2.24 0 4.28.96 5.76 2.51.37.42.83.75 1.34.98.5.23 1.02.34 1.54.33zM6.36 12.82c1.88 0 3.51.84 4.58 2.15.22.28.53.51.88.67.35.16.73.23 1.12.21.39.02.77-.05 1.12-.21.35-.16.66-.39.88-.67 1.07-1.31 2.7-2.15 4.58-2.15 2.87 0 5.21 2.34 5.21 5.21s-2.34 5.21-5.21 5.21c-1.88 0-3.51-.84-4.58-2.15-.22-.28-.53-.51-.88-.67-.35-.16-.73-.23-1.12-.21-.39-.02-.77.05-1.12.21-.35.16-.66.39-.88.67-1.07 1.31-2.7 2.15-4.58 2.15-2.87 0-5.21-2.34-5.21-5.21s2.34-5.21 5.21-5.21z" />
        </svg>
    );

    const BusinessIcon = () => (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );

    const WabaIcon = () => (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586l-4-4a2 2 0 010-2.828l4-4A1.994 1.994 0 019 4h6a2 2 0 012 2v2z" />
        </svg>
    );

    const PhoneIcon = () => (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );

    if (isManual) {
        return (
            <div className="space-y-4 animate-fadeIn">
                <div className="mb-4">
                    <p className="text-sm font-bold text-gray-700 mb-4">
                        {!selectedBusiness ? "Select your Meta Business Account" :
                            !selectedWaba ? "Select your WhatsApp Business Account (WABA)" :
                                "Select your Phone Number"}
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        {!selectedBusiness && businesses.map(b => (
                            <button
                                key={b.id}
                                onClick={() => handleBusinessSelect(b.id)}
                                className="flex items-center gap-4 p-4 text-left border border-gray-100 bg-white rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <BusinessIcon />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{b.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID: {b.id}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}

                        {selectedBusiness && !selectedWaba && wabas.map(w => (
                            <button
                                key={w.id}
                                onClick={() => handleWabaSelect(w.id)}
                                className="flex items-center gap-4 p-4 text-left border border-gray-100 bg-white rounded-2xl hover:border-green-400 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                    <WabaIcon />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{w.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID: {w.id}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}

                        {selectedWaba && phoneNumbers.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleNumberSelect(p.id)}
                                className="flex items-center gap-4 p-4 text-left border border-gray-100 bg-white rounded-2xl hover:border-purple-400 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                    <PhoneIcon />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{p.display_phone_number}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID: {p.id}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setIsManual(false);
                            setSelectedBusiness("");
                            setSelectedWaba("");
                        }}
                        className="mt-6 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 mx-auto"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to options
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-[#0064E0] to-[#008FEF] text-white py-4 px-6 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {isLoading ? <LoadingSpinner /> : <MetaIcon />}
                <span>{isLoading ? "Launching Meta flow..." : "Connect WhatsApp Account"}</span>
            </button>

            {/* <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">or</span>
                <div className="flex-grow border-t border-gray-100"></div>
            </div> */}

            {/* <button
                onClick={handleManualLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-100 py-4 px-6 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
                <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Existing Assets (Manual)
            </button> */}
        </div>
    );
}