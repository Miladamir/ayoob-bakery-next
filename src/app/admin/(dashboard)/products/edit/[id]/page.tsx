import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

interface Props { params: { id: string } }

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: Props) {
    await dbConnect();

    const product = await Product.findById(params.id).lean();
    if (!product) notFound();

    const categories = await Category.find().lean();

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">Edit: {product.name}</h1>
            <ProductForm
                initialData={JSON.parse(JSON.stringify(product))}
                categories={JSON.parse(JSON.stringify(categories))}
                isEdit={true}
            />
        </div>
    );
}