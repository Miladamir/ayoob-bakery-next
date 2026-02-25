"use client";

import { useState } from "react";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                alert("Failed to send message. Please try again.");
            }
        } catch (err) {
            alert("Error sending message.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-brand-200 text-lg max-w-xl mx-auto">We'd love to hear from you. Whether you have a question about our bread or want to place a custom order.</p>
                    <div className="mt-6 flex justify-center gap-2 text-sm text-brand-300">
                        <a href="/" className="hover:text-white">Home</a>
                        <span>/</span>
                        <span className="text-white">Contact</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                        {/* Left: Form */}
                        <div className="lg:w-2/3 bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 relative z-10">
                            <h2 className="font-serif text-3xl md:text-4xl text-gray-800 font-bold mb-2">Send a Message</h2>
                            <p className="text-gray-400 mb-8">Fill out the form below and we'll get back to you shortly.</p>

                            {success ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                        <i className="fa-solid fa-check text-3xl"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                                    <p className="text-gray-500">We will get back to you as soon as possible.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">First Name</label>
                                            <input type="text" name="firstName" required className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-5 focus:outline-none focus:border-brand-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Last Name</label>
                                            <input type="text" name="lastName" required className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-5 focus:outline-none focus:border-brand-500 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                                        <input type="email" name="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-5 focus:outline-none focus:border-brand-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Subject</label>
                                        <select name="subject" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-5 focus:outline-none focus:border-brand-500 transition-all text-gray-500">
                                            <option>General Inquiry</option>
                                            <option>Custom Cake Order</option>
                                            <option>Wholesale / Catering</option>
                                            <option>Feedback</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Message</label>
                                        <textarea name="message" rows={5} required className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-5 focus:outline-none focus:border-brand-500 transition-all resize-none"></textarea>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? "Sending..." : (<><span>Send Message</span> <i className="fa-solid fa-paper-plane"></i></>)}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Right: Info */}
                        <div className="lg:w-1/3 space-y-8">
                            {/* Contact Info */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h3 className="font-serif text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                                            <i className="fa-solid fa-location-dot text-lg"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Address</h4>
                                            <p className="text-gray-500 text-sm mt-1">123 Baker Street<br />Culinary District, SYD 2000</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                                            <i className="fa-solid fa-phone text-lg"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Phone</h4>
                                            <p className="text-gray-500 text-sm mt-1">(02) 9876 5432</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                                            <i className="fa-solid fa-envelope text-lg"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Email</h4>
                                            <p className="text-gray-500 text-sm mt-1">hello@ayoobbakery.com.au</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="bg-brand-900 rounded-2xl p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-800 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <h3 className="font-serif text-2xl font-bold mb-4">Opening Hours</h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-brand-200">Monday - Friday</span>
                                            <span className="font-bold">7:00 AM - 7:00 PM</span>
                                        </li>
                                        <li className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-brand-200">Saturday</span>
                                            <span className="font-bold">8:00 AM - 6:00 PM</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-brand-200">Sunday</span>
                                            <span className="font-bold">8:00 AM - 4:00 PM</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="relative h-96 md:h-[500px] w-full bg-gray-200">
                <img src="https://images.unsplash.com/photo-1577563821016-01f11c750b99?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Map Location" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <a href="https://maps.google.com" target="_blank" className="bg-white text-brand-800 px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-brand-100 transition-colors shadow-2xl flex items-center gap-3 group">
                        <i className="fa-solid fa-diamond-turn-right text-xl group-hover:rotate-12 transition-transform"></i> Get Directions
                    </a>
                </div>
            </section>
        </>
    );
}