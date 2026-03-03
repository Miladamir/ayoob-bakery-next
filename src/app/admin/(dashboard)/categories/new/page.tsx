import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function NewCategoryPage() {
    await dbConnect();
    const categories = await Category.find().lean();
    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-800 mb-6">New Category</h1>
            <CategoryForm categories={JSON.parse(JSON.stringify(categories))} />
        </div>
    );
}