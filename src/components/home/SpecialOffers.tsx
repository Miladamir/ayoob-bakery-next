"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Offer {
    _id: string;
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    expiryDate?: Date;
    buttonText?: string;
    buttonLink?: string;
}

interface SpecialOffersProps {
    offers: Offer[];
}

export default function SpecialOffers({ offers }: SpecialOffersProps) {
    if (!offers || offers.length === 0) return null;

    return (
        <>
            {offers.map((offer) => (
                <section
                    key={offer._id}
                    className="relative section-padding overflow-hidden"
                >
                    {/* High Performance Background Image */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url('${offer.image}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            // Fixed attachment usually causes lag on mobile, removed.
                            // Background-attachement: fixed is the #1 cause of mobile scroll lag.
                        }}
                    />

                    {/* Gradient Overlay - Sits on top of image */}
                    <div
                        className="absolute inset-0 z-[1]"
                        style={{ background: 'linear-gradient(rgba(195, 117, 96, 0.92), rgba(195, 117, 96, 0.92))' }}
                    />

                    {/* Content */}
                    <div className="container text-center relative z-10">
                        <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '5px 15px', borderRadius: '50px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Limited Time Offer
                        </span>

                        <h2 style={{ color: 'white', fontSize: '3rem', margin: '20px 0' }}>
                            {offer.title}
                            {offer.subtitle && <><br /><span style={{ opacity: 0.8, fontSize: '0.8em' }}>{offer.subtitle}</span></>}
                        </h2>

                        {offer.description && <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px' }}>{offer.description}</p>}

                        {offer.expiryDate && (
                            <CountdownTimer expiryDate={new Date(offer.expiryDate)} id={offer._id} />
                        )}

                        {offer.buttonText && (
                            <Link href={offer.buttonLink || '#'} className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
                                {offer.buttonText}
                            </Link>
                        )}
                    </div>
                </section>
            ))}
        </>
    );
}

function CountdownTimer({ expiryDate, id }: { expiryDate: Date, id: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = expiryDate.getTime() - now.getTime();

            if (diff <= 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate]);

    const TimeBlock = ({ value, label }: { value: number, label: string }) => (
        <div className="text-center">
            {/* REMOVED backdrop-blur-sm for mobile performance */}
            <div
                className="text-2xl md:text-4xl font-bold bg-white/20 p-3 md:p-4 rounded-lg shadow min-w-[70px] md:min-w-[90px]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm uppercase mt-2 tracking-widest opacity-80">{label}</div>
        </div>
    );

    return (
        <div className="flex justify-center gap-4 md:gap-6 mb-8 font-serif text-white">
            <TimeBlock value={timeLeft.days} label="Days" />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <TimeBlock value={timeLeft.mins} label="Mins" />
            <TimeBlock value={timeLeft.secs} label="Secs" />
        </div>
    );
}