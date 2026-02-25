"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BlogFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        image: "",
        author: "Admin",
        tags: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
                image: initialData.image || "",
                author: initialData.author || "Admin",
                tags: initialData.tags?.join(", ") || ""
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Process tags into array
        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        const url = isEdit ? `/api/admin/blogs/${initialData._id}` : '/api/admin/blogs';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/admin/blogs');
                router.refresh();
            } else {
                alert('Failed to save blog post');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border max-w-3xl">
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Content</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={8} required className="w-full border p-2 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Image URL</label>
                    <input name="image" value={formData.image} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Author</label>
                    <input name="author" value={formData.author} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Tags (Comma separated)</label>
                <input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. Bread, Tips, Recipes" className="w-full border p-2 rounded-lg" />
            </div>

            <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                {isEdit ? "Update Post" : "Publish Post"}
            </button>
        </form>
    );
}