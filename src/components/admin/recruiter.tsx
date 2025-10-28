/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Users,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import DeleteConfirmation from "../common/DeleteComfirmation";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

const initialFormState: FormData = {
  name: "",
  email: "",
  mobile: "",
  password: "",
};

export default function RecruiterManagement() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    mobile: "",
    email: "",
  });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const { data: session } = useSession();

  // Single effect to handle all initialization
  useEffect(() => {
    const initializeData = async () => {
      if (!session?.user || session.user.role !== "ADMIN") {
        setLoading(false);
        return;
      }

      try {
        // Get company ID
        const companyResponse = await fetch(`/api/companies?adminId=${session.user.id}`);
        const companyData = await companyResponse.json();
        const currentCompanyId = companyData.companies?.[0]?.id;

        if (!currentCompanyId) {
          throw new Error("No company found");
        }

        setCompanyId(currentCompanyId);

        // Get recruiters
        const recruitersResponse = await fetch(`/api/users?role=RECRUITER&companyId=${currentCompanyId}`);
        const recruitersData = await recruitersResponse.json();

        setRecruiters(recruitersData.data || []);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle mobile number - allow only digits and limit to 10
    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: digitsOnly }));

        // Validate mobile number
        if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
          setValidationErrors(prev => ({ ...prev, mobile: "Mobile number must be exactly 10 digits" }));
        } else {
          setValidationErrors(prev => ({ ...prev, mobile: "" }));
        }
      }
      return;
    }

    // Handle email validation
    if (name === "email") {
      setFormData(prev => ({ ...prev, [name]: value }));

      const emailRegex = /^(?!.*\.\.)(?!.*\.$)(?!^\.)[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
      if (value && !emailRegex.test(value)) {
        setValidationErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: "" }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setFormData({
      name: recruiter.name,
      email: recruiter.email,
      mobile: recruiter.mobile,
      password: "", // Keep password empty for editing
    });
    setShowCreateForm(true);
    setError("");
    setSuccess("");
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingRecruiter(null);
    setFormData(initialFormState);
    setValidationErrors({ mobile: "", email: "" });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validationErrors.mobile || validationErrors.email) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    // Check mobile number length
    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (editingRecruiter) {
        // Update existing recruiter
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
        };

        // Only include password if it's provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        const response = await fetch(`/api/users?id=${editingRecruiter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update recruiter');
        }

        // Update recruiter in list
        setRecruiters(prev =>
          prev.map(r => r.id === editingRecruiter.id ? { ...r, ...result.data } : r)
        );
        setSuccess("Recruiter updated successfully!");
      } else {
        // Create new recruiter
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            role: "RECRUITER",
            companyId,
            generatePassword: false,
            sendWelcomeEmail: true,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create recruiter');
        }

        // Add new recruiter to list
        setRecruiters(prev => [...prev, result.data]);
        setSuccess("Recruiter created successfully!");
      }

      handleCancelForm();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save recruiter");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmText(
      `Are you sure you want to delete this recruiter? This action cannot be undone.`
    );

    setOnConfirmCallback(() => async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to delete recruiter');
        }

        // Remove recruiter from list
        setRecruiters(prev => prev.filter(r => r.id !== id));
        setSuccess("Recruiter deleted successfully!");
        
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        setError(err.message || "Failed to delete recruiter");
      } finally {
        setLoading(false);
        setIsDeleteModalOpen(false);
      }
    });

    setIsDeleteModalOpen(true);
  };

  // Filter recruiters based on search term
  const filteredRecruiters = recruiters.filter((recruiter) =>
    recruiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.mobile.includes(searchTerm)
  );

  if (loading && recruiters.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-sm text-red-700">You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Recruiter Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search recruiters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Recruiter
          </Button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  S.No.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Mobile
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Joined Date
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && recruiters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-500">Loading recruiters...</p>
                  </td>
                </tr>
              ) : filteredRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No recruiters match your search"
                        : "No recruiters found"}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Recruiter
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRecruiters.map((recruiter, index) => (
                  <tr key={recruiter.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full mr-3 bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {recruiter.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {recruiter.email}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {recruiter.mobile}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(recruiter.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(recruiter)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(recruiter.id)}
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

      {/* Sidebar Form */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
          showCreateForm ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">
              {editingRecruiter ? "Edit Recruiter" : "Add New Recruiter"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleCancelForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  pattern="^(?!.*\.\.)(?!.*\.$)(?!^\.)[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$"
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="mobile"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                />
                {validationErrors.mobile && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.mobile}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password {editingRecruiter ? "(Leave blank to keep current)" : ""}<span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder={
                    editingRecruiter
                      ? "Leave blank to keep current password"
                      : "Enter default password"
                  }
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingRecruiter}
                  minLength={6}
                />
              </div>
            </div>
          </form>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelForm} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {submitting
                  ? editingRecruiter
                    ? "Updating..."
                    : "Creating..."
                  : editingRecruiter
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showCreateForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCancelForm}
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
}