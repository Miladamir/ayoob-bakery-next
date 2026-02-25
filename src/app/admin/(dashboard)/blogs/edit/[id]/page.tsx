import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import BlogForm from "@/components/admin/BlogForm";
import { notFound } from "next/navigation";

interface Props { params: { id: string } }

export default async function EditBlogPage({ params }: Props) {
    await dbConnect();
    const blog = await Blog.findById(params.id).lean();
    if (!blog) notFound();

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">Edit Blog Post</h1>
            <BlogForm initialData={JSON.parse(JSON.stringify(blog))} isEdit />
        </div>
    );
}