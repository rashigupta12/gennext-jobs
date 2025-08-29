/* eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Building2,
  Globe,
  Star,
  Building,
  UserPlus,
  Loader2,
} from "lucide-react";
import DeleteConfirmation from "../common/DeleteComfirmation";
import { UploadButton } from "@/utils/uploadthing";
import { useCurrentUser } from "@/hooks/auth";
import Image from "next/image";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  about?: string;
  address?: string;
  industry?: string;
  rating?: string;
  isVerified: boolean;
  recruiter?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  adminId?: string;
  companyAdmin?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  generatePassword: boolean;
}

const CompanyManagement = () => {
  const user = useCurrentUser();
  if (!user) {
    return (
      <div className="text-center text-red-500">
        You must be logged in to manage companies.
      </div>
    );
  }

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Admin form states
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    generatePassword: true,
  });
  const [adminCreationSuccess, setAdminCreationSuccess] = useState("");
  const [adminCreationError, setAdminCreationError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    about: "",
    address: "",
    industry: "",
    rating: "",
    isVerified: false,
    recruiter: [] as string[],
    createdBy: user.id || "",
    adminId: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/companies`);
      if (response.ok) {
        const data = await response.json();
        // Fetch admin details for each company that has an adminId
        const companiesWithAdmins = await Promise.all(
          (data.companies || []).map(async (company: Company) => {
            if (company.adminId) {
              try {
                const adminResponse = await fetch(
                  `/api/users?Id=${company.adminId}`
                );
                console.log("Admin Response:", adminResponse);
                if (adminResponse.ok) {
                  const adminData = await adminResponse.json();
                  return {
                    ...company,
                    companyAdmin: adminData.data || null, // ← Changed from adminData.user to adminData.data
                  };
                }
              } catch (err) {
                console.error("Error fetching admin details:", err);
              }
            }
            return company;
          })
        );
        setCompanies(companiesWithAdmins);
        toast.success("Companies data loaded successfully");
      } else {
        setError("Failed to fetch companies");
        toast.error("Failed to fetch companies");
      }
    } catch (err) {
      const errorMessage =
        "Error fetching companies: " +
        (err instanceof Error ? err.message : "Unknown error");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Companies with Admins:", companies);

  const handleInputChange = (e: {
    target: { name: any; value: any; type?: string; checked?: boolean };
  }) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "website") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: capitalizeFirstLetter(value),
      }));
    }
  };

  const handleAdminInputChange = (e: {
    target: { name: any; value: any; type?: string; checked?: boolean };
  }) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAdminFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "email") {
      setAdminFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setAdminFormData((prev) => ({
        ...prev,
        [name]: capitalizeFirstLetter(value),
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      website: "",
      about: "",
      address: "",
      industry: "",
      rating: "",
      isVerified: false,
      recruiter: [],
      createdBy: user.id || "",
      adminId: "",
    });
    setLogoPreview("");
  };

  const resetAdminForm = () => {
    setAdminFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      generatePassword: true,
    });
    setAdminCreationSuccess("");
    setAdminCreationError("");
  };

  const openSidebar = (company: Company | null = null) => {
    if (company) {
      setCurrentCompany(company);
      setFormData({
        name: company.name,
        logo: company.logo || "",
        website: company.website || "",
        about: company.about || "",
        address: company.address || "",
        industry: company.industry || "",
        rating: company.rating || "",
        isVerified: company.isVerified,
        recruiter: company.recruiter || [],
        createdBy: company.createdBy || user.id || "",
        adminId: company.adminId || "",
      });
      setLogoPreview(company.logo || "");
    } else {
      setCurrentCompany(null);
      resetForm();
    }
    setSidebarOpen(true);
    setShowAdminForm(false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setCurrentCompany(null);
    setShowAdminForm(false);
    resetForm();
    resetAdminForm();
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e?.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Company name is required");
      toast.error("Company name is required");
      return;
    }

    try {
      const isEditing = !!currentCompany;
      let response;

      if (isEditing) {
        response = await fetch(`/api/companies?id=${currentCompany.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchCompanies();
        closeSidebar();
        toast.success(
          `Company ${isEditing ? "updated" : "created"} successfully`
        );
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save company");
        toast.error(errorData.message || "Failed to save company");
      }
    } catch (err) {
      const errorMessage =
        "Error saving company: " +
        (err instanceof Error ? err.message : "Unknown error");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCreationError("");
    setAdminCreationSuccess("");

    if (!adminFormData.name || !adminFormData.email) {
      setAdminCreationError("Name and email are required");
      toast.error("Name and email are required");
      return;
    }

    if (!adminFormData.generatePassword && !adminFormData.password) {
      setAdminCreationError("Password is required when not auto-generating");
      toast.error("Password is required when not auto-generating");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adminFormData,
          companyId: selectedCompany?.id,
        }),
      });

      if (response.ok) {
        setAdminCreationSuccess(
          adminFormData.generatePassword
            ? "Admin created successfully! Login credentials have been sent to their email."
            : "Admin created successfully!"
        );
        toast.success("Admin created successfully");

        await fetchCompanies();

        setTimeout(() => {
          setShowAdminForm(false);
          resetAdminForm();
          closeSidebar();
        }, 2000);
      } else {
        const errorData = await response.json();
        setAdminCreationError(errorData.message || "Failed to create admin");
        toast.error(errorData.message || "Failed to create admin");
      }
    } catch (err) {
      const errorMessage =
        "Error creating admin: " +
        (err instanceof Error ? err.message : "Unknown error");
      setAdminCreationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    setConfirmText(
      `Are you sure you want to delete this company? This action cannot be undone.`
    );

    setOnConfirmCallback(() => async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/companies?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchCompanies();
          if (currentCompany?.id === id) {
            closeSidebar();
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to delete company");
        }
      } catch (err) {
        setError(
          "Error deleting company: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      } finally {
        setIsLoading(false);
        setIsDeleteModalOpen(false);
      }
    });

    setIsDeleteModalOpen(true);
  };

  const handleCreateCompanyAdmin = (company: Company) => {
    setSelectedCompany(company);
    setShowAdminForm(true);
    setSidebarOpen(true);
    resetAdminForm();
  };

  const handleCancelAdminCreation = () => {
    setShowAdminForm(false);
    resetAdminForm();
    if (!currentCompany) {
      closeSidebar();
    }
  };

  const toggleVerification = async (
    companyId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/companies/verify?id=${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });

      if (response.ok) {
        await fetchCompanies();
      } else {
        setError("Failed to update verification status");
      }
    } catch (err) {
      console.error("Error updating verification status:", err);
      setError("Error updating verification status");
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (company.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderAdminForm = () => (
    <form
      onSubmit={handleAdminSubmit}
      className="space-y-4 overflow-y-auto max-h-[80vh] p-4"
    >
      {adminCreationSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {adminCreationSuccess}
          </AlertDescription>
        </Alert>
      )}

      {adminCreationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{adminCreationError}</AlertDescription>
        </Alert>
      )}

      {/* <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            {selectedCompany?.logo ? (
              <Image
                src={selectedCompany.logo}
                alt="Company Logo"
                width={40}
                height={40}
                className="h-8 w-8 object-cover rounded-full"
              />
            ) : (
              <Building className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Company</h3>
            <p className="font-medium capitalize">{selectedCompany?.name}</p>
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="admin-name"
            className="text-sm font-medium text-gray-700"
          >
            Name*
          </label>
          <Input
            id="admin-name"
            name="name"
            value={adminFormData.name}
            onChange={handleAdminInputChange}
            placeholder="Enter admin name"
            required
          />
        </div>

        <div className="space-y-2">
  <label
    htmlFor="admin-email"
    className="text-sm font-medium text-gray-700"
  >
    Email*
  </label>
  <Input
    id="admin-email"
    name="email"
    type="email"
    value={adminFormData.email}
    onChange={handleAdminInputChange}
    placeholder="admin@example.com"
    required
    pattern="^(?!.*\.\.)(?!.*\.$)(?!^\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    onInvalid={(e) =>
      (e.target as HTMLInputElement).setCustomValidity(
        "Please enter a valid email address"
      )
    }
    onInput={(e) =>
      (e.target as HTMLInputElement).setCustomValidity("")
    }
  />
</div>

<div className="space-y-2">
  <label
    htmlFor="admin-phone"
    className="text-sm font-medium text-gray-700"
  >
    Number
  </label>
  <Input
  id="admin-phone"
  name="phone"
  value={adminFormData.phone}
  onChange={(e) => {
    // Allow only digits
    const value = e.target.value.replace(/\D/g, "");
    // Restrict max 10 digits
    if (value.length <= 10) {
      handleAdminInputChange(e);
    }
  }}
  placeholder="Enter  phone number"
  required
  maxLength={10}
  inputMode="numeric"
  pattern="^[0-9]{10}$"
  onInvalid={(e) =>
    (e.target as HTMLInputElement).setCustomValidity(
      "Phone number must be exactly 10 digits"
    )
  }
  onInput={(e) =>
    (e.target as HTMLInputElement).setCustomValidity("")
  }
/>

</div>

      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="generate-password"
            name="generatePassword"
            checked={adminFormData.generatePassword}
            onChange={handleAdminInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="generate-password"
            className="text-sm font-medium text-gray-700"
          >
            Auto-generate secure password
          </label>
        </div>

        {!adminFormData.generatePassword && (
          <div className="mt-2">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-gray-700"
            >
              Password*
            </label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              value={adminFormData.password}
              onChange={handleAdminInputChange}
              placeholder="Enter password"
              required={!adminFormData.generatePassword}
            />
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelAdminCreation}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-24">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : adminFormData.generatePassword ? (
            "Create & Send Credentials"
          ) : (
            "Create Admin"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="relative space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Company Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => openSidebar()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  S.No.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Company
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Industry
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Admin
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Rating
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-500">Loading companies...</p>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No companies match your search"
                        : "No companies found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company, index) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {company.logo ? (
                          <Image
                            className="h-8 w-8 rounded-full mr-3 object-cover"
                            src={company.logo}
                            alt={company.name}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {capitalizeFirstLetter(company.name)}
                          </div>
                          {company.website && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {company.website.replace(/^https?:\/\//, "")}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-gray-900">
                        {company.industry || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 hidden lg:table-cell">
                      {company.adminId ? (
                        <div>
                          {company.companyAdmin ? (
                            <>
                              <div className="font-semibold">
                                {company.companyAdmin.name}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {company.companyAdmin.email}
                              </div>
                              {company.companyAdmin.phone && (
                                <div className="text-gray-500 text-xs">
                                  {company.companyAdmin.phone}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-500">
                              Loading admin...
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateCompanyAdmin(company);
                          }}
                          className="flex items-center text-blue-600 hover:underline text-sm"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add Admin
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      {company.rating ? (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {company.rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          toggleVerification(company.id, company.isVerified)
                        }
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {company.isVerified ? "Verified" : "Pending"}
                      </button>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openSidebar(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium capitalize">
              {showAdminForm
                ? `Add Admin - ${selectedCompany?.name}`
                : currentCompany
                ? "Edit Company"
                : "Add New Company"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {showAdminForm ? (
            renderAdminForm()
          ) : (
            <>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div className="capitalize">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      className="capitalize"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Logo
                    </label>
                    <div className="mb-2">
                      {formData.logo || logoPreview ? (
                        <div className="relative">
                          <Image
                            src={formData.logo || logoPreview}
                            alt="Company Logo"
                            className="h-24 w-24 object-cover rounded-md mb-2"
                            width={96}
                            height={96}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, logo: "" }));
                              setLogoPreview("");
                            }}
                            className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="h-24 w-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            const uploadedUrl =
                              res[0].serverData?.fileUrl || res[0].url;
                            setFormData((prev) => ({
                              ...prev,
                              logo: uploadedUrl,
                            }));
                            setLogoPreview(uploadedUrl);
                            setIsUploading(false);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          console.error("Upload error:", error);
                          setError(`Upload failed: ${error.message}`);
                          setIsUploading(false);
                        }}
                        onUploadBegin={() => {
                          setIsUploading(true);
                        }}
                        appearance={{
                          button:
                            "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors",
                          allowedContent: "text-xs text-gray-500 mt-1",
                        }}
                        content={{
                          button({ ready }) {
                            if (isUploading) return "Uploading...";
                            if (ready) return "Upload Logo";
                            return "Loading...";
                          },
                          allowedContent: "Images up to 4MB",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About Company
                    </label>
                    <Textarea
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      placeholder="Brief description about the company"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Company address"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <Input
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <Input
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="e.g., 4.5"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVerified"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isVerified"
                      className="text-sm font-medium text-gray-700"
                    >
                      Verified Company
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeSidebar}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {currentCompany ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        text={confirmText}
        onConfirm={onConfirmCallback ?? (() => {})}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
    </div>
  );
};

export default CompanyManagement;
