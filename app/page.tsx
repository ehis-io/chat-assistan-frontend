"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./component/Navbar";
import Hero from "./component/Hero";
import Features from "./component/Features";
import Footer from "./component/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has business setup
    import("@/lib/utils/auth").then(({ isAuthenticated, hasBusinessSetup }) => {
      if (isAuthenticated() && hasBusinessSetup()) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background-color)] flex flex-col font-sans text-[var(--text-color)]">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
