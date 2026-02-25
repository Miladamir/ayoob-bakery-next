import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import CategoryForm from "@/components/admin/CategoryForm";
import { notFound } from "next/navigation";

interface Props { params: { id: string } }

export default async function EditCategoryPage({ params }: Props) {
    await dbConnect();
    const category = await Category.findById(params.id).lean();
    if (!category) notFound();

    const categories = await Category.find({ _id: { $ne: params.id } }).lean(); // Exclude self

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">Edit Category</h1>
            <CategoryForm initialData={JSON.parse(JSON.stringify(category))} categories={JSON.parse(JSON.stringify(categories))} isEdit />
        </div>
    );
}