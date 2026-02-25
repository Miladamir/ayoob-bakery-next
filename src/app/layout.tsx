import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { getNestedCategories } from "@/lib/data";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Ayoob Bakery Australia",
  description: "Premium Artisan Breads & Pastries",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories on the server
  const nestedCategories = await getNestedCategories();

  return (
    <html lang="en">
      <head>
        {/* Font Awesome CDN */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        {/* 
           FIX: All components using Context (Cart, Wishlist, Session) 
           must be children of <Providers>. 
           We wrap the entire body structure here.
        */}
        <Providers>
          <Sidebar />
          <Header nestedCategories={JSON.parse(JSON.stringify(nestedCategories))} />

          <main>{children}</main>

          <Footer nestedCategories={JSON.parse(JSON.stringify(nestedCategories))} />
        </Providers>
      </body>
    </html>
  );
}