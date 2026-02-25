import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    await dbConnect();
    // Fetch only leaf categories or all, depending on your logic preference
    const categories = await Category.find().lean();

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">Add New Product</h1>
            <ProductForm categories={JSON.parse(JSON.stringify(categories))} />
        </div>
    );
}