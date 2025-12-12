import Navbar from "./component/Navbar";
import Hero from "./component/Hero";
import Features from "./component/Features";
import Footer from "./component/Footer";

export default function Home() {
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
