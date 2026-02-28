"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BannerFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function BannerForm({ initialData, isEdit = false }: BannerFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        image: "",
        link: "",
        isActive: true,
        expiryDate: "" // Added
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                subtitle: initialData.subtitle || "",
                image: initialData.image || "",
                link: initialData.link || "",
                isActive: initialData.isActive ?? true,
                // Format date for datetime-local input
                expiryDate: initialData.expiryDate
                    ? new Date(initialData.expiryDate).toISOString().slice(0, 16)
                    : ""
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/api/admin/banners/${initialData._id}` : '/api/admin/banners';

        // Prepare payload, converting empty date string to null
        const payload = {
            ...formData,
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/admin/banners');
                router.refresh();
            } else {
                alert('Failed to save banner');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border max-w-2xl">
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Subtitle</label>
                <input name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Image URL</label>
                <input name="image" value={formData.image} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Link (URL)</label>
                <input name="link" value={formData.link} onChange={handleChange} placeholder="/products" className="w-full border p-2 rounded-lg" />
            </div>

            {/* ADDED: Expiry Date for Countdown Timer */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Offer End Date (Optional)</label>
                <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">Set this to enable a countdown timer on the homepage banner.</p>
            </div>

            <div className="flex items-center gap-3">
                <label htmlFor="isActive" className="font-semibold text-gray-600">Active (Visible on site)</label>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" className="w-5 h-5 accent-brand-600" />
            </div>

            <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                {isEdit ? "Update Banner" : "Create Banner"}
            </button>
        </form>
    );
}