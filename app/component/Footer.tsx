export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 relative bg-gradient-to-tr from-[var(--primary-color)] to-[var(--accent-color)] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                CA
                            </div>
                            <span className="text-lg font-bold text-[var(--text-color)]">ChatAssist</span>
                        </div>
                        <p className="text-[var(--text-muted)] max-w-sm leading-relaxed text-sm">
                            Empowering businesses with intelligent, automated customer support.
                            Always on, always helpful.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="font-bold text-[var(--text-color)] mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">Features</a></li>
                            <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">API</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="font-bold text-[var(--text-color)] mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">About Us</a></li>
                            <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">Careers</a></li>
                            <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} ChatAssist Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-gray-400 hover:text-[var(--primary-color)]">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-400 hover:text-[var(--primary-color)]">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
