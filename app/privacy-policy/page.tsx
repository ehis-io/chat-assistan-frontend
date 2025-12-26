"use client";

import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white pt-24 pb-16">
                <main className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="bg-white p-8 md:p-12">
                        <h1 className="text-4xl font-extrabold text-black mb-8 border-b pb-4">Privacy Policy</h1>

                        <div className="prose prose-slate max-w-none text-gray-800 space-y-8">
                            <p><strong>Last Updated: December 19, 2024</strong></p>

                            <section>
                                <h2 className="text-2xl font-bold text-black mb-4">1. App Identity</h2>
                                <p><strong>App Name:</strong> WhatsApp Chat Assist</p>
                                <p><strong>Company Name:</strong> WhatsApp Chat Assist Ltd.</p>
                                <p><strong>Contact Email:</strong> support@soro.com</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-black mb-4">2. Data Collected</h2>
                                <p>We collect and process the following data to provide our services:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>WhatsApp Business Account (WABA) ID:</strong> To identify and connect to your business account.</li>
                                    <li><strong>Phone Numbers:</strong> Associated with your WABA to manage messaging.</li>
                                    <li><strong>Message Templates:</strong> To create, manage, and send structured messages.</li>
                                    <li><strong>Message Metadata:</strong> Status of sent/received messages (delivered, read, etc.).</li>
                                    <li><strong>Meta Account Data:</strong> Basic profile information and permissions granted via Meta Login.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-black mb-4">3. How Data is Used</h2>
                                <p>Your data is used strictly for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Sending WhatsApp Messages:</strong> Facilitating communication between your business and customers via the WhatsApp Business API.</li>
                                    <li><strong>Managing Message Templates:</strong> Creating and submitting templates for Meta approval.</li>
                                    <li><strong>Customer Support:</strong> Providing a centralized interface for responding to customer inquiries.</li>
                                    <li><strong>Service Improvement:</strong> Improving the App's functionality and user experience.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-black mb-4">4. Data Sharing</h2>
                                <p>
                                    We value your privacy. Your data is shared <strong>only</strong> with Meta APIs as required to perform the services.
                                    We <strong>do not</strong> sell your data to third parties or use it for advertising purposes.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-black mb-4">5. Data Retention</h2>
                                <p>
                                    We store message data and metadata for as long as your account is active or as needed to provide you with our services.
                                    Users can request data deletion at any time by contacting us at support@soro.com. Upon account termination, data is deleted from our servers within 30 days.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-black mb-4">6. User Rights</h2>
                                <p>
                                    You have the following rights regarding your data:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Access:</strong> You can request a copy of the data we hold about you.</li>
                                    <li><strong>Deletion:</strong> You can request that we delete your personal data.</li>
                                    <li><strong>Revocation:</strong> You can manage and revoke permissions at any time through your Meta Account settings.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t">
                                <p className="text-sm text-gray-500">
                                    By using WhatsApp Chat Assist, you agree to the terms outlined in this Privacy Policy.
                                </p>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
