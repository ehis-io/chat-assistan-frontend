const features = [
    {
        title: "24/7 Availability",
        description: "Your AI agent never sleeps. Handle inquiries at 3 AM just as effectively as 3 PM.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )
    },
    {
        title: "Smart Escalation",
        description: "Handles routine questions automatically and knows exactly when to alert a human agent.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        )
    },
    {
        title: "Natural Language",
        description: "Uses advanced NLP to understand context, nuance, and intent, not just keywords.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        )
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-white relative">
            <div className="container mx-auto px-6">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">Why choose ChatAssist?</h2>
                    <p className="text-[var(--text-muted)] text-lg">
                        Empower your business with next-generation automated support technologies.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group p-8 rounded-2xl bg-[var(--background-color)] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="w-14 h-14 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-color)] mb-3">{feature.title}</h3>
                            <p className="text-[var(--text-muted)] leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
