import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import BannerForm from "@/components/admin/BannerForm";
import { notFound } from "next/navigation";

// FIX: Update Props interface for Next.js 15
interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: Props) {
    const { id } = await params;
    await dbConnect();
    const banner = await Banner.findById(id).lean();
    if (!banner) notFound();

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-800 mb-6">Edit Banner</h1>
            <BannerForm initialData={JSON.parse(JSON.stringify(banner))} isEdit />
        </div>
    );
}