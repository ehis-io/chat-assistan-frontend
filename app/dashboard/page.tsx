"use client";

import Navbar from "../component/Navbar";

export default function Dashboard() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--background-color)] pt-24 px-6">
                <main className="container mx-auto">
                    <h1 className="text-3xl font-bold text-[var(--text-color)]">Dashboard</h1>
                    <p className="mt-4 text-[var(--text-muted)]">Welcome to your ChatAssist Dashboard. Your business is set up.</p>
                </main>
            </div>
        </>
    );
}