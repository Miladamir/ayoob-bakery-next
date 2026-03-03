"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OptionValue { value: string; price: number; }
interface OptionGroup { name: string; values: OptionValue[]; }

interface ProductFormProps {
    initialData?: any; // For edit mode
    categories: any[];
    isEdit?: boolean;
}

export default function ProductForm({ initialData, categories, isEdit = false }: ProductFormProps) {
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        name: "", price: "", description: "", shortDescription: "", images: "",
        category: "", badge: "", discount: "0", unit: "quantity",
        ingredients: "", nutrition: "", features: "" // Added ingredients & nutrition
    });

    // Dynamic Options State
    const [options, setOptions] = useState<OptionGroup[]>([]);

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                price: initialData.price?.toString() || "",
                description: initialData.description || "",
                shortDescription: initialData.shortDescription || "",
                images: initialData.images?.join(", ") || "",
                category: initialData.category?._id || "",
                badge: initialData.badge || "",
                discount: initialData.discount?.toString() || "0",
                unit: initialData.unit || "quantity",
                ingredients: initialData.ingredients || "",
                nutrition: initialData.nutrition || "",
                features: initialData.features?.join(", ") || ""
            });
            setOptions(initialData.options || []);
        }
    }, [initialData]);

    // Handle standard input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Options Logic ---
    const addOptionGroup = () => setOptions([...options, { name: "", values: [] }]);

    const removeOptionGroup = (index: number) => setOptions(options.filter((_, i) => i !== index));

    const handleOptionNameChange = (index: number, name: string) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };

    const addOptionValue = (groupIndex: number) => {
        const newOptions = [...options];
        newOptions[groupIndex].values.push({ value: "", price: 0 });
        setOptions(newOptions);
    };

    const updateOptionValue = (groupIndex: number, valueIndex: number, field: 'value' | 'price', val: string) => {
        const newOptions = [...options];
        if (field === 'price') {
            newOptions[groupIndex].values[valueIndex][field] = parseFloat(val) || 0;
        } else {
            newOptions[groupIndex].values[valueIndex][field] = val;
        }
        setOptions(newOptions);
    };

    const removeOptionValue = (groupIndex: number, valueIndex: number) => {
        const newOptions = [...options];
        newOptions[groupIndex].values = newOptions[groupIndex].values.filter((_, i) => i !== valueIndex);
        setOptions(newOptions);
    };

    // --- Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            discount: parseFloat(formData.discount),
            images: formData.images.split(",").map(s => s.trim()),
            features: formData.features.split(",").map(s => s.trim()),
            options: options.filter(opt => opt.name && opt.values.length > 0) // Clean empty groups
        };

        const url = isEdit ? `/api/admin/products/${initialData._id}` : '/api/admin/products';

        try {
            const res = await fetch(url, {
                method: 'POST', // Using POST for both create and update for simplicity with form data
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                alert('Failed to save product');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Product Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className="w-full border p-2 rounded-lg">
                        <option value="">Select...</option>
                        {categories.map((cat: any) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Price ($)</label>
                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Discount (%)</label>
                    <input name="discount" type="number" value={formData.discount} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Badge</label>
                    <select name="badge" value={formData.badge} onChange={handleChange} className="w-full border p-2 rounded-lg">
                        <option value="">None</option>
                        <option value="Bestseller">Bestseller</option>
                        <option value="New">New</option>
                        <option value="Popular">Popular</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Images (Comma separated URLs)</label>
                <input name="images" value={formData.images} onChange={handleChange} className="w-full border p-2 rounded-lg" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Short Description</label>
                <input
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                    placeholder="Brief summary shown on product cards"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border p-2 rounded-lg"></textarea>
            </div>

            {/* NEW: Ingredients Field */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Ingredients</label>
                <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border p-2 rounded-lg"
                    placeholder="e.g. Flour, Water, Salt, Yeast..."
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">List the key ingredients used.</p>
            </div>

            {/* NEW: Nutrition Field */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nutrition Facts</label>
                <textarea
                    name="nutrition"
                    value={formData.nutrition}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border p-2 rounded-lg"
                    placeholder="e.g. Calories: 250kcal, Protein: 8g, Carbs: 40g..."
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">You can format this with line breaks.</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Features (Comma separated)</label>
                <input
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                    placeholder="Freshly Baked, Organic, Vegan"
                />
            </div>

            {/* Dynamic Options Builder */}
            <div className="border p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700">Variants / Options</h3>
                    <button type="button" onClick={addOptionGroup} className="text-sm bg-brand-100 text-brand-700 px-3 py-1 rounded font-semibold hover:bg-brand-200">+ Add Group</button>
                </div>

                {options.map((group, gIndex) => (
                    <div key={gIndex} className="border bg-white p-3 rounded mb-3 shadow-sm">
                        <div className="flex gap-3 mb-2">
                            <input
                                placeholder="Group Name (e.g. Size)"
                                value={group.name}
                                onChange={(e) => handleOptionNameChange(gIndex, e.target.value)}
                                className="flex-grow border p-2 rounded"
                            />
                            <button type="button" onClick={() => removeOptionGroup(gIndex)} className="text-red-500 text-sm hover:underline">Remove</button>
                        </div>

                        <div className="space-y-2 pl-4">
                            {group.values.map((val, vIndex) => (
                                <div key={vIndex} className="flex gap-2 items-center">
                                    <input placeholder="Value" value={val.value} onChange={(e) => updateOptionValue(gIndex, vIndex, 'value', e.target.value)} className="w-1/2 border p-2 rounded text-sm" />
                                    <input placeholder="Price" type="number" value={val.price} onChange={(e) => updateOptionValue(gIndex, vIndex, 'price', e.target.value)} className="w-1/3 border p-2 rounded text-sm" />
                                    <button type="button" onClick={() => removeOptionValue(gIndex, vIndex)} className="text-gray-400 hover:text-red-500"><i className="fa-solid fa-times"></i></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addOptionValue(gIndex)} className="text-xs text-brand-600 mt-1 hover:underline">+ Add Value</button>
                        </div>
                    </div>
                ))}
            </div>

            <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                {isEdit ? "Update Product" : "Create Product"}
            </button>
        </form>
    );
}