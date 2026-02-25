"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CategoryFormProps {
    initialData?: any;
    categories: any[]; // For parent selection
    isEdit?: boolean;
}

export default function CategoryForm({ initialData, categories, isEdit = false }: CategoryFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        parent: "",
        image: "",
        description: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                parent: initialData.parent?._id || "",
                image: initialData.image || "",
                description: initialData.description || ""
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/api/admin/categories/${initialData._id}` : '/api/admin/categories';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin/categories');
                router.refresh();
            } else {
                alert('Failed to save category');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border max-w-2xl">
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Parent Category</label>
                <select name="parent" value={formData.parent} onChange={handleChange} className="w-full border p-2 rounded-lg">
                    <option value="">None (Top Level)</option>
                    {categories.map((cat: any) => (
                        // Prevent selecting self as parent in edit mode
                        (!isEdit || cat._id !== initialData?._id) && (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        )
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Image URL</label>
                <input name="image" value={formData.image} onChange={handleChange} className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border p-2 rounded-lg"></textarea>
            </div>

            <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                {isEdit ? "Update Category" : "Create Category"}
            </button>
        </form>
    );
}