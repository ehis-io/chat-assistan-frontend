import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div  className="min-h-screen bg-gradient-to-br from-[var(--primary-color)] via-[var(--accent-color)] to-[var(--background-color)]">
      <main className="container mx-auto px-4 flex flex-col justify-center items-center min-h-screen">

        {/* HERO TITLE */}
        <h1 className="text-4xl font-bold text-center mb-10 mt-16 text-[var(--text-color)]
          opacity-0 animate-fadeInSlow">
          Customer support that never sleeps.
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-10 
          opacity-0 animate-slideUpSlow">

          {/* LEFT SECTION */}
          <div className="md:w-1/2 w-full flex flex-col items-center">

            <div className="bg-[var(--background-color)] p-6 rounded-xl flex items-center gap-x-4 shadow-md w-full max-w-md
              transition duration-500 hover:scale-[1.03] hover:shadow-xl">
              
              <Image
                src="/logo.png"
                alt="Chat Assist Logo"
                width={70}
                height={70}
                className="rounded-lg animate-floatSlow"
              />
              
              <h2 className="text-xl font-semibold text-[var(--primary-color)]">
                Get started with your AI-assisted customer service agent
              </h2>
            </div>

            <p className="mt-5 text-center text-[var(--text-color)] leading-relaxed max-w-lg
              opacity-0 animate-fadeInDelay">
              Smart support. Faster responses. Happier customers.  
              Let AI automate your customer conversations with precision and personality.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-5">
                 <Link href="/register">

              <button className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-full font-medium 
                hover:scale-105 transition transform duration-300 hover:shadow-lg">
                Get Started
              </button>


                 </Link>

   <Link href="/login">
              <button   className="bg-[var(--background-color)] text-[var(--primary-color)] px-7 py-3 rounded-full font-medium 
                hover:bg-[var(--primary-color)] hover:text-white hover:scale-105 transition transform duration-300 hover:shadow-lg">
                Login
              </button>

              </Link>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="md:w-1/2 w-full p-4 transition duration-500 hover:scale-[1.02]">
            <p className="text-[var(--text-color)] leading-relaxed">
              Provide seamless automated customer support for your business, 
              available 24/7. Our AI assistant handles inquiries, answers questions, 
              gathers information, and escalates only when necessary — giving your 
              customers the fast, friendly, and reliable support they deserve.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
