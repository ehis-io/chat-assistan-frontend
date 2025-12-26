import { useEffect, useState, useCallback } from "react";
import { loadMetaSdk, launchEmbeddedSignup, loginWithPermissions, fetchWabAs, fetchPhoneNumbers } from "@/lib/utils/metaSdk";

interface MetaEmbeddedSignupProps {
    onSuccess: (data: { code: string; waba_id: string; phone_number_id: string }) => void;
    onError: (error: string) => void;
}

export default function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
    const [selectedWaba, setSelectedWaba] = useState<string>("");
    const [accessToken, setAccessToken] = useState<string>("");
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || "1234567890"; // Fallback for dev

    useEffect(() => {
        // Listen for the message from the Meta popup
        const handleMessage = (event: MessageEvent) => {
            // Check origin for security
            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
                return;
            }

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                if (data.type === 'WA_EMBEDDED_SIGNUP_SUCCESS') {
                    console.log("Meta Signup Success Data:", data);
                    // Standard Meta structure: data.data contains { code, waba_id, phone_number_id }
                    if (data.data) {
                        onSuccess({
                            code: data.data.code,
                            waba_id: data.data.waba_id,
                            phone_number_id: data.data.phone_number_id
                        });
                    }
                } else if (data.type === 'WA_EMBEDDED_SIGNUP_ERROR') {
                    onError(data.error_message || "Meta Signup failed.");
                }
            } catch (err) {
                // Not a JSON message or unrelated
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onSuccess, onError]);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            await loadMetaSdk(appId);
            await launchEmbeddedSignup();
        } catch (err: any) {
            onError(err.message || "Failed to launch Meta Signup.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualLogin = async () => {
        setIsLoading(true);
        try {
            await loadMetaSdk(appId);
            const auth: any = await loginWithPermissions(['whatsapp_business_management', 'whatsapp_business_messaging']);
            setAccessToken(auth.accessToken);
            const wabaData: any = await fetchWabAs(auth.accessToken);
            setAccounts(wabaData);
            setIsManual(true);
        } catch (err: any) {
            onError(err.message || "Manual login failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWabaSelect = async (wabaId: string) => {
        setSelectedWaba(wabaId);
        setIsLoading(true);
        try {
            const numbers: any = await fetchPhoneNumbers(wabaId, accessToken);
            setPhoneNumbers(numbers);
        } catch (err: any) {
            onError(err.message || "Failed to fetch phone numbers.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNumberSelect = (phoneNumberId: string) => {
        onSuccess({
            code: "MANUAL_LOGIN_" + Date.now(),
            waba_id: selectedWaba,
            phone_number_id: phoneNumberId
        });
    };

    if (isManual) {
        return (
            <div className="space-y-6 animate-fadeIn">
                {!selectedWaba ? (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Select WABA</label>
                        <div className="grid gap-3">
                            {accounts.length > 0 ? accounts.map((acc) => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleWabaSelect(acc.id)}
                                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all group"
                                >
                                    <p className="font-bold text-gray-900 group-hover:text-[var(--primary-color)]">{acc.name}</p>
                                    <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">ID: {acc.id}</p>
                                </button>
                            )) : (
                                <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-2xl border border-gray-100">No WhatsApp Business Accounts found.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-slideInRight">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Phone Number</label>
                            <button onClick={() => setSelectedWaba("")} className="text-[10px] font-bold text-[var(--primary-color)] hover:underline uppercase">Back to accounts</button>
                        </div>
                        <div className="grid gap-3">
                            {phoneNumbers.length > 0 ? phoneNumbers.map((num) => (
                                <button
                                    key={num.id}
                                    onClick={() => handleNumberSelect(num.id)}
                                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all group"
                                >
                                    <p className="font-extrabold text-gray-900 group-hover:text-[var(--primary-color)]">{num.display_phone_number}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${num.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {num.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-gray-400 uppercase">ID: {num.id}</span>
                                    </div>
                                </button>
                            )) : (
                                <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-2xl border border-gray-100">No phone numbers found for this account.</p>
                            )}
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsManual(false)}
                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest pt-4"
                >
                    Cancel Manual Selection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full bg-[#1877F2] text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 disabled:opacity-70"
            >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {isLoading ? "Loading Meta..." : "Connect WhatsApp Account"}
            </button>
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-gray-100"></div>
            </div>
            <button
                type="button"
                onClick={handleManualLogin}
                disabled={isLoading}
                className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold border-2 border-gray-100 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
                {isLoading ? "Fetching Accounts..." : "Select Existing Assets (Manual)"}
            </button>
            <p className="text-[10px] text-gray-400 text-center leading-relaxed px-4">
                Recommended for businesses with pre-configured WhatsApp Business Accounts.
            </p>
        </div>
    );
}
