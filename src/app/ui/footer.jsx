import { useState } from "react";

const ContactUs = {
    email: "contact@realestate.com",
    address: "123 Main Street, Anytown, USA",
    street: "Collins Street West, Victoria",
    phone1: "+1 (555) 123-4567",
    phone2: "+1 (555) 987-6543"
}

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const PinterestIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
);

const DribbbleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ArrowUpIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
    </svg>
);

export default function Footer() {
    const [email, setEmail] = useState("");

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const socialLinks = [
        { icon: <FacebookIcon />, href: "#" },
        { icon: <TwitterIcon />, href: "#" },
        { icon: <InstagramIcon />, href: "#" },
        { icon: <PinterestIcon />, href: "#" },
        { icon: <DribbbleIcon />, href: "#" },
    ];

    const quickLinks = [
        "About Us",
        "Terms & Conditions",
        "User's Guide",
        "Support Center",
        "Press Info",
    ];

    const bottomLinks = [
        { name: "Home", href: "/home" },
        { name: "Listing", href: "/home/listing" },
        { name: "Property", href: "/home/property" },
        { name: "About Us", href: "/home/about" },
        { name: "Blog", href: "/home/blog" },
        { name: "Contact", href: "/home/contact" }
    ];

    return (
        <footer className="bg-[#1e2535] text-gray-300 font-sans">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* About Site */}
                    <div className="lg:col-span-1">
                        <h3 className="text-white font-semibold text-lg mb-5">About Site</h3>
                        <p className="text-[#8a95a8] text-sm leading-relaxed">
                            We&apos;re reimagining how you buy, sell and rent. It&apos;s now easier to get into a place you love. So let&apos;s do this, together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-5">Quick Links</h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="text-[#8a95a8] text-sm hover:text-white transition-colors duration-200"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-5">Contact Us</h3>
                        <div className="space-y-3 text-[#8a95a8] text-sm">
                            <p>{ContactUs.email}</p>
                            <p>{ContactUs.address}</p>
                            <p>{ContactUs.street}</p>
                            <p>{ContactUs.phone1}</p>
                            <p>{ContactUs.phone2}</p>
                        </div>
                    </div>

                    {/* Follow Us + Subscribe */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-5">Follow us</h3>
                        <div className="flex items-center gap-4 mb-8">
                            {socialLinks.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="text-[#8a95a8] hover:text-white transition-colors duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        <h3 className="text-white font-semibold text-lg mb-4">Subscribe</h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="flex-1 bg-[#2a3347] text-[#8a95a8] placeholder-[#8a95a8] text-sm rounded-full px-5 py-3 outline-none border border-transparent focus:border-[#3d4f6e] transition-colors duration-200"
                            />
                            <button
                                onClick={() => setEmail("")}
                                className="bg-[#3d4f6e] hover:bg-[#4d6080] text-white rounded-full p-3 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
                            >
                                <ArrowRightIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#181f2e] px-8 py-5">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Bottom Nav Links */}
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {bottomLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                className="text-[#8a95a8] text-sm hover:text-white transition-colors duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Copyright + Scroll to top */}
                    <div className="flex items-center gap-6">
                        <p className="text-[#8a95a8] text-sm">
                            © 2026 RealEstate. All rights reserved.
                        </p>
                        <button
                            onClick={scrollToTop}
                            className="bg-[#2a3347] hover:bg-[#3d4f6e] text-[#8a95a8] hover:text-white rounded-full p-2.5 transition-colors duration-200 flex items-center justify-center"
                        >
                            <ArrowUpIcon />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}