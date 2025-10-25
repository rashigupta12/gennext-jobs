/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
  const [validationErrors, setValidationErrors] = useState({
  mobile: "",
  email: "",
});
  
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

  // const handleEdit = (recruiter: Recruiter) => {
  //   setEditingRecruiter(recruiter);
  //   setFormData({
  //     name: recruiter.name,
  //     email: recruiter.email,
  //     mobile: recruiter.mobile,
  //     password: "", // Keep password empty for editing
  //   });
  //   setShowCreateForm(true);
  //   setError("");
  //   setSuccess("");
  // };

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

        const response = await fetch(`/api/users/${editingRecruiter.id}`, {
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

  if (loading) {
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
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Recruiter Management</h1>
        {!showCreateForm && recruiters.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Recruiter
          </button>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {recruiters.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No recruiters found.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create First Recruiter
          </button>
        </div>
      )}

      {/* Create Form - Responsive Layout */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              {editingRecruiter ? "Edit Recruiter" : "Create New Recruiter"}
            </h2>
            <button
              onClick={handleCancelForm}
              className="text-gray-500 hover:text-gray-700 self-end sm:self-auto"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Email Address *</label>
  <input
    type="email"
    name="email"
    placeholder="Enter email address"
    value={formData.email}
    onChange={handleInputChange}
    required
    pattern="^(?!.*\.\.)(?!.*\.$)(?!^\.)[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  {validationErrors.email && (
    <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
  )}
</div>
            </div>

            {/* Row 2: Mobile and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
  <input
    type="tel"
    name="mobile"
    placeholder="Enter 10-digit mobile number"
    value={formData.mobile}
    onChange={handleInputChange}
    required
    maxLength={10}
    pattern="[0-9]{10}"
    inputMode="numeric"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  {validationErrors.mobile && (
    <p className="text-xs text-red-600 mt-1">{validationErrors.mobile}</p>
  )}
</div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Default Password {editingRecruiter ? "(Leave blank to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={editingRecruiter ? "Leave blank to keep current password" : "Enter default password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingRecruiter}
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

           

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleCancelForm}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors order-2 sm:order-1"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
              >
                {submitting ? (editingRecruiter ? "Updating..." : "Creating...") : (editingRecruiter ? "Update Recruiter" : "Create Recruiter")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recruiters List */}
      {recruiters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiters.map((recruiter) => (
            <div key={recruiter.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{recruiter.name}</h3>
                {/* <button
                  onClick={() => handleEdit(recruiter)}
                  className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Edit
                </button> */}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2 break-all">
                  <span>📧</span> {recruiter.email}
                </p>
                <p className="flex items-center gap-2">
                  <span>📱</span> {recruiter.mobile}
                </p>
               
                <p className="flex items-center gap-2 text-xs">
                  <span>📅</span> {new Date(recruiter.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}