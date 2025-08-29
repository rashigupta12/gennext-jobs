// app/categories/[slug]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryDetails() {
      try {
        const categoryResponse = await fetch(
          `/api/categories?slug=${categorySlug}`
        );
        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch category details");
        }

        const categoryData = await categoryResponse.json();
        const category = categoryData.categories.find(
          (cat: { slug: string }) => cat.slug === categorySlug
        );

        if (!category) {
          throw new Error("Category not found");
        }

        setCategoryName(category.name);

        // Fetch subcategories based on the found category ID
        const subcategoriesResponse = await fetch(
          `/api/subCategories?categoryId=${category.id}`
        );
        if (!subcategoriesResponse.ok) {
          throw new Error("Failed to fetch subcategories");
        }

        const subcategoriesData = await subcategoriesResponse.json();
        setSubcategories(subcategoriesData.subcategories);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryDetails();
  }, [categorySlug]);
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gennext rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen w-full bg-gray-50  overflow-hidden">
        <Navbar />

        <div className="container mx-auto px-6 py-16 mt-12">
          <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">
            {categoryName}
          </h1>
          {subcategories.length === 0 ? (
            <p className="text-lg text-gray-600 text-center">
              No subcategories found for this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center transform hover:scale-105 h-full"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-8 uppercase">
                    {subcategory.name}
                  </h2>
                  <div className="mt-auto">
                    <a
                      href={`/subCategories/${subcategory.slug}`}
                      className="px-6 py-2 bg-gennext text-white font-semibold rounded-lg shadow-md hover:bg-gennext-dark transition duration-200"
                    >
                      View Jobs
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
