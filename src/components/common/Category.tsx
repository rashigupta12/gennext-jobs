import React from "react";
import { useRouter } from "next/navigation";

interface CategoryProps {
  A: string;
  slug?: string; // We'll need a slug or ID to navigate
}

const Category: React.FC<CategoryProps> = ({ A, slug }) => {
  const router = useRouter();

  const handleCategoryClick = () => {
    // Navigate to the subcategory page using the slug or a formatted version of the name
    const categorySlug = slug || A.toLowerCase().replace(/\s+/g, "-");
    router.push(`/categories/${categorySlug}`);
  };

  return (
    <div 
      className="job-category-box rounded-lg bg-white p-5 shadow-md transition duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:text-white hover:shadow-lg max-xl:w-110 max-xl:h-110 cursor-pointer"
      onClick={handleCategoryClick}
    >
      <h3 className="text-xl font-semibold">
        <a>{A}</a>
      </h3>
    </div>
  );
};

export default Category;