/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Modal from "react-modal";

// Initialize Modal for accessibility
// Modal.setAppElement(null); // Replace with your root element ID or set to null if running in a test environment

interface Category {
  id: string;
  name: string;
}

interface JobListingModalsProps {
  showCategoryModal: boolean;
  showSubcategoryModal: boolean;
  showCompanyModal: boolean;
  setShowCategoryModal: (show: boolean) => void;
  setShowSubcategoryModal: (show: boolean) => void;
  setShowCompanyModal: (show: boolean) => void;
  newCategory: string;
  newSubcategory: string;
  newCompany: string;
  setNewCategory: (value: string) => void;
  setNewSubcategory: (value: string) => void;
  setNewCompany: (value: string) => void;
  handleAddCategory: (name: string) => void;
  handleAddSubcategory: (name: string, categoryId: string) => void;
  handleAddCompany: (name: string) => void;
  formData: any;
  categories: Category[];
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Added missing prop
}

export const JobListingModals: React.FC<JobListingModalsProps> = ({
  showCategoryModal,
  showSubcategoryModal,
  showCompanyModal,
  setShowCategoryModal,
  setShowSubcategoryModal,
  setShowCompanyModal,
  newCategory,
  newSubcategory,
  newCompany,
  setNewCategory,
  setNewSubcategory,
  setNewCompany,
  handleAddCategory,
  handleAddSubcategory,
  handleAddCompany,
  formData,
  categories,
  handleChange, // Added missing prop
}) => {
  const [industry, setIndustry] = React.useState("");
  const [rating, setRating] = React.useState("");
  const [logo, setLogo] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [about, setAbout] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [isVerified, setIsVerified] = React.useState(true);

  const customModalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "8px",
      padding: "24px",
      maxWidth: "450px",
      width: "90%",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      border: "none",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
    },
  };

  return (
    <>
      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
        style={customModalStyles}
        contentLabel="Add New Category"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Add New Category</h2>
          <button
            onClick={() => setShowCategoryModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowCategoryModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddCategory(newCategory)}
            className={`px-4 py-2 rounded-lg transition-all ${
              newCategory.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!newCategory.trim()}
          >
            Add Category
          </button>
        </div>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={showSubcategoryModal}
        onRequestClose={() => setShowSubcategoryModal(false)}
        style={customModalStyles}
        contentLabel="Add New Subcategory"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Add New Subcategory
          </h2>
          <button
            onClick={() => setShowSubcategoryModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory Name
          </label>
          <input
            placeholder="Enter subcategory name"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>
          <select
            value={formData.categoryId}
            onChange={handleChange}
            name="categoryId"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          >
            <option value="">Select Parent Category</option>
            {categories &&
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowSubcategoryModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleAddSubcategory(newSubcategory, formData.categoryId)
            }
            className={`px-4 py-2 rounded-lg transition-all ${
              newSubcategory.trim() && formData.categoryId
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!newSubcategory.trim() || !formData.categoryId}
          >
            Add Subcategory
          </button>
        </div>
      </Modal>

      {/* Company Modal */}
      <Modal
        isOpen={showCompanyModal}
        onRequestClose={() => setShowCompanyModal(false)}
        style={customModalStyles}
        contentLabel="Add New Company"
      >
        <div className=" mt-12 flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">Add New Company</h2>
          <button
            onClick={() => setShowCompanyModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCompany(newCompany);
          }}
          className="space-y-4"
        >
          {[
            {
              label: "Company Name",
              value: newCompany,
              setValue: setNewCompany,
              placeholder: "Enter company name",
            },
            {
              label: "Logo URL",
              value: logo,
              setValue: setLogo,
              placeholder: "Enter logo URL",
            },
            {
              label: "Website",
              value: website,
              setValue: setWebsite,
              placeholder: "Enter website URL",
            },
            {
              label: "About",
              value: about,
              setValue: setAbout,
              placeholder: "Enter company description",
            },
            {
              label: "Address",
              value: address,
              setValue: setAddress,
              placeholder: "Enter company address",
            },
            {
              label: "Industry",
              value: industry,
              setValue: setIndustry,
              placeholder: "Enter industry",
            },
            {
              label: "Rating",
              value: rating,
              setValue: setRating,
              placeholder: "Enter rating (1-10)",
            },
          ].map(({ label, value, setValue, placeholder }) => (
            <div className="flex flex-col" key={label}>
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          ))}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Verified
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="isVerified"
                  checked={isVerified === true}
                  onChange={() => setIsVerified(true)}
                  className="h-5 w-5 text-blue-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="isVerified"
                  checked={isVerified === false}
                  onChange={() => setIsVerified(false)}
                  className="h-5 w-5 text-blue-600"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCompanyModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg transition-all ${
                newCompany.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!newCompany.trim()}
            >
              Add Company
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
