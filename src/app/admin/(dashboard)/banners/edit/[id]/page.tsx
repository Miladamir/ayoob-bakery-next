import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import BannerForm from "@/components/admin/BannerForm";
import { notFound } from "next/navigation";

interface Props { params: { id: string } }

export default async function EditBannerPage({ params }: Props) {
    await dbConnect();
    const banner = await Banner.findById(params.id).lean();
    if (!banner) notFound();

    return (
        <div>
            <h1 className="text-3xl font-bold font-serif text-gray-800 mb-6">Edit Banner</h1>
            <BannerForm initialData={JSON.parse(JSON.stringify(banner))} isEdit />
        </div>
    );
}