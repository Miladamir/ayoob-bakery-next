import BannerForm from "@/components/admin/BannerForm";

export default function NewBannerPage() {
    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-800 mb-6">New Banner</h1>
            <BannerForm />
        </div>
    );
}