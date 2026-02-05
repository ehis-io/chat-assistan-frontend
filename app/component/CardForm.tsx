"use client";

import { useState } from "react";
import { getToken } from "@/lib/utils/auth";

interface CardFormProps {
    email: string;
    onSuccess: (response: any) => void;
    onCancel: () => void;
}

type Step = "CARD_ENTRY" | "PIN_REQUIRED" | "OTP_REQUIRED" | "PHONE_REQUIRED" | "BIRTHDAY_REQUIRED" | "ADDRESS_REQUIRED" | "3DS_REQUIRED";

export default function CardForm({ email, onSuccess, onCancel }: CardFormProps) {
    const [step, setStep] = useState<Step>("CARD_ENTRY");
    const [cardNumber, setCardNumber] = useState("");
    const [cvv, setCvv] = useState("");
    const [expiry, setExpiry] = useState("");
    const [pin, setPin] = useState("");
    const [otp, setOtp] = useState("");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "" });
    const [reference, setReference] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [authUrl, setAuthUrl] = useState("");

    const validateCard = () => {
        const errors: Record<string, string> = {};
        const cleanCard = cardNumber.replace(/\s/g, "");

        if (!/^\d{16,19}$/.test(cleanCard)) {
            errors.cardNumber = "Invalid card number";
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            errors.cvv = "Invalid CVV";
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            errors.expiry = "Use MM/YY format";
        } else {
            const [m, y] = expiry.split("/").map(Number);
            const now = new Date();
            const expDate = new Date(2000 + y, m - 1);
            if (m < 1 || m > 12 || expDate < now) {
                errors.expiry = "Invalid/Expired date";
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInitialCharge = async () => {
        if (!validateCard()) return;

        setLoading(true);
        setError("");

        const [expMonth, expYear] = expiry.split("/");

        try {
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

            const response = await fetch(`${baseUrl}/payment/charge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    amount: 10000,
                    card: {
                        number: cardNumber.replace(/\s/g, ""),
                        cvv,
                        expiry_month: expMonth,
                        expiry_year: expYear
                    }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "An error occurred during charge initiation.");
                return;
            }

            handleResponse(result.data);
        } catch (err: any) {
            setError(err.message || "An error occurred during charge initiation.");
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = (data: any) => {
        if (!data.status && data.message !== "Charge initiated") {
            setError(data.message || "Transaction failed");
            return;
        }

        setReference(data.data?.reference || data.reference);

        switch (data.data?.status || (data.status === true ? "success" : "")) {
            case "send_pin":
                setStep("PIN_REQUIRED");
                break;
            case "send_otp":
                setStep("OTP_REQUIRED");
                break;
            case "send_phone":
                setStep("PHONE_REQUIRED");
                break;
            case "send_birthday":
                setStep("BIRTHDAY_REQUIRED");
                break;
            case "send_address":
                setStep("ADDRESS_REQUIRED");
                break;
            case "open_url":
                setAuthUrl(data.data.url);
                setStep("3DS_REQUIRED");
                break;
            case "success":
                onSuccess(data.data || data);
                break;
            default:
                if (data.status === true) {
                    onSuccess(data);
                } else {
                    setError("Unexpected response from payment gateway");
                }
        }
    };

    const submitPin = async () => {
        if (!pin || pin.length < 4) {
            setFieldErrors({ pin: "Enter 4-digit PIN" });
            return;
        }
        setLoading(true);
        try {
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/payment/submit-pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ pin, reference })
            });
            const result = await res.json();
            handleResponse(result.data);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const submitOtp = async () => {
        if (!otp) {
            setFieldErrors({ otp: "Enter OTP" });
            return;
        }
        setLoading(true);
        try {
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const res = await fetch(`${baseUrl}/payment/submit-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ otp, reference })
            });
            const result = await res.json();
            handleResponse(result.data);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const renderCardEntry = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Card Number</label>
                <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                        setCardNumber(val);
                        if (fieldErrors.cardNumber) setFieldErrors(prev => { const { cardNumber, ...rest } = prev; return rest; });
                    }}
                    className={`w-full p-4 bg-gray-50 border ${fieldErrors.cardNumber ? 'border-red-500 bg-red-50' : 'border-transparent'} rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-gray-800 font-bold`}
                />
                {fieldErrors.cardNumber && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{fieldErrors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expiry (MM/YY)</label>
                    <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        maxLength={5}
                        onChange={(e) => {
                            let val = e.target.value.replace(/[^\d/]/g, "");
                            if (val.length === 2 && !val.includes("/")) val += "/";
                            setExpiry(val);
                            if (fieldErrors.expiry) setFieldErrors(prev => { const { expiry, ...rest } = prev; return rest; });
                        }}
                        className={`w-full p-4 bg-gray-50 border ${fieldErrors.expiry ? 'border-red-500 bg-red-50' : 'border-transparent'} rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-gray-800 font-bold`}
                    />
                    {fieldErrors.expiry && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{fieldErrors.expiry}</p>}
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">CVV</label>
                    <input
                        type="password"
                        placeholder="000"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => {
                            setCvv(e.target.value.replace(/\D/g, ""));
                            if (fieldErrors.cvv) setFieldErrors(prev => { const { cvv, ...rest } = prev; return rest; });
                        }}
                        className={`w-full p-4 bg-gray-50 border ${fieldErrors.cvv ? 'border-red-500 bg-red-50' : 'border-transparent'} rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-gray-800 font-bold`}
                    />
                    {fieldErrors.cvv && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{fieldErrors.cvv}</p>}
                </div>
            </div>
            <button onClick={handleInitialCharge} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 mt-4">
                {loading ? "Processing..." : "Securely Pay ₦10,000"}
            </button>
        </div>
    );

    const renderPinEntry = () => (
        <div className="space-y-4">
            <h3 className="text-center font-bold text-gray-800">Enter Card PIN</h3>
            <p className="text-xs text-center text-gray-500">Your bank requires your PIN to authorize this transaction.</p>
            <input
                type="password"
                placeholder="****"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className={`w-full p-4 bg-gray-50 border ${fieldErrors.pin ? 'border-red-500' : 'border-transparent'} rounded-2xl text-center text-2xl tracking-[1em] focus:bg-white focus:border-blue-500 outline-none`}
            />
            {fieldErrors.pin && <p className="text-red-500 text-[10px] text-center font-bold">{fieldErrors.pin}</p>}
            <button onClick={submitPin} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">
                {loading ? "Verifying..." : "Authorize with PIN"}
            </button>
        </div>
    );

    const renderOtpEntry = () => (
        <div className="space-y-4">
            <h3 className="text-center font-bold text-gray-800">Enter OTP</h3>
            <p className="text-xs text-center text-gray-500">A code has been sent to your registered phone/email.</p>
            <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`w-full p-4 bg-gray-50 border ${fieldErrors.otp ? 'border-red-500' : 'border-transparent'} rounded-2xl text-center text-2xl tracking-[0.5em] focus:bg-white focus:border-blue-500 outline-none`}
            />
            {fieldErrors.otp && <p className="text-red-500 text-[10px] text-center font-bold">{fieldErrors.otp}</p>}
            <button onClick={submitOtp} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">
                {loading ? "Verifying OTP..." : "Submit OTP"}
            </button>
        </div>
    );

    const render3DS = () => (
        <div className="space-y-4 text-center">
            <h3 className="font-bold text-gray-800">3D Secure Authentication</h3>
            <p className="text-xs text-gray-500">Please complete the authentication in the window that opens.</p>
            <div className="p-4 bg-blue-50 rounded-2xl">
                <a href={authUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">Click here to authenticate</a>
            </div>
            <p className="text-[10px] text-gray-400">Transaction Reference: {reference}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-gray-500 font-medium">Reset Form</button>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md w-full animate-fadeIn">
            <div className="mb-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    {step === "CARD_ENTRY" ? (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    ) : (
                        <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {step === "CARD_ENTRY" ? "Payment Details" : "Security Verification"}
                </h2>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 font-medium text-center">
                    {error}
                </div>
            )}

            {step === "CARD_ENTRY" && renderCardEntry()}
            {step === "PIN_REQUIRED" && renderPinEntry()}
            {step === "OTP_REQUIRED" && renderOtpEntry()}
            {step === "3DS_REQUIRED" && render3DS()}

            <button onClick={onCancel} className="w-full mt-6 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors">Cancel Payment</button>
        </div>
    );
}
