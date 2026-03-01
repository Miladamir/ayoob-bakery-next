import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import BlogForm from "@/components/admin/BlogForm";
import { notFound } from "next/navigation";

// FIX: Update Props interface
interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
    // FIX: Await params
    const { id } = await params;

    await dbConnect();
    const blog = await Blog.findById(id).lean();
    if (!blog) notFound();

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">Edit Blog Post</h1>
            <BlogForm initialData={JSON.parse(JSON.stringify(blog))} isEdit />
        </div>
    );
}