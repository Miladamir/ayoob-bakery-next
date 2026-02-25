import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">New Blog Post</h1>
            <BlogForm />
        </div>
    );
}