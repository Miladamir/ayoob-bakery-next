import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { getNestedCategories } from "@/lib/data";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This call is now cached for 1 hour, preventing DB hits on every page navigation
    const nestedCategories = await getNestedCategories();

    return (
        <>
            <Sidebar />
            <Header nestedCategories={JSON.parse(JSON.stringify(nestedCategories))} />

            <main>{children}</main>

            <Footer nestedCategories={JSON.parse(JSON.stringify(nestedCategories))} />
        </>
    );
}