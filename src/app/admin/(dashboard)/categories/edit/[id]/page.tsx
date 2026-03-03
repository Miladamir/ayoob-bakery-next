import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import CategoryForm from "@/components/admin/CategoryForm";
import { notFound } from "next/navigation";

// FIX: Update Props interface
interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
    const { id } = await params;
    await dbConnect();
    const category = await Category.findById(id).lean();
    if (!category) notFound();
    const categories = await Category.find({ _id: { $ne: id } }).lean();

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-800 mb-6">Edit Category</h1>
            <CategoryForm initialData={JSON.parse(JSON.stringify(category))} categories={JSON.parse(JSON.stringify(categories))} isEdit />
        </div>
    );
}