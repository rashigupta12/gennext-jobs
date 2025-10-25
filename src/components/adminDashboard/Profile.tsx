import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";

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

const CompanyProfile = () => {
  const user = useCurrentUser();
  const userId = user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCompanyDetail(userId);
    }
  }, [userId]);

  const fetchCompanyDetail = async (adminId: string) => {
    try {
      const response = await fetch(`/api/companies?adminId=${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch company details");
      const data = await response.json();
      console.log("Fetched company data:", data);
      setCompany(data.companies[0] || null);
      setEditedCompany(data);
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to load company details");
    }
  };

  useEffect(() => {
    if (company) {
      setEditedCompany(company);
    }
  }, [company]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedCompany((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!company?.id) return;

      console.log("Saving company data:", editedCompany);

      const response = await fetch(`/api/companies?id=${company.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCompany),
      });

      if (!response.ok) throw new Error("Failed to update company");

      const updatedCompany = await response.json();
      console.log("Updated company data:", updatedCompany);
      setCompany(updatedCompany.company);
      setEditedCompany(updatedCompany.company);
      setIsEditing(false);

      toast("Company details updated successfully");
    } catch (error) {
      console.error("Error updating company:", error);
      toast("Failed to update company details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedCompany(company || {});
    setIsEditing(false);
  };

  if (!company) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="text-gray-500">No company profile found</div>
            <div className="text-sm text-gray-400">Create a company profile to get started</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <Card className="w-full shadow-md">
        <CardHeader className="space-y-4 md:space-y-0">
          {/* Mobile Layout: Horizontal layout similar to desktop */}
          <div className="md:hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Image
                    width={60}
                    height={60}
                    src={
                      isEditing && editedCompany.logo
                        ? editedCompany.logo
                        : company.logo || "/default-company-logo.png"
                    }
                    alt={company.name}
                    className="w-15 h-15 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      name="name"
                      value={editedCompany.name || ""}
                      onChange={handleInputChange}
                      className="text-lg font-semibold"
                      placeholder="Company Name"
                    />
                  ) : (
                    <h2 className="text-lg font-semibold truncate">{company.name}</h2>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col space-y-2 flex-shrink-0">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      size="sm"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    size="sm"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
            
            {/* Upload button for mobile - placed separately below */}
            {isEditing && (
              <div className="mt-4 flex justify-center">
                <UploadButton
                  endpoint="imageUploader"
                  className="text-xs"
                  appearance={{ 
                    button: "h-8 text-xs px-3 py-1"
                  }}
                  onClientUploadComplete={(res) => {
                    if (res.length > 0) {
                      setEditedCompany((prev) => ({
                        ...prev,
                        logo: res[0].serverData.fileUrl,
                      }));
                    }
                  }}
                  onUploadError={(error) => {
                    console.error("Upload Error:", error);
                    toast.error("Logo upload failed: " + error.message);
                  }}
                />
              </div>
            )}
          </div>

          {/* Desktop Layout: Horizontal flex */}
          <div className="hidden md:flex md:flex-row md:justify-between md:items-center">
            <CardTitle className="text-xl flex items-center gap-4">
              <Image
                width={48}
                height={48}
                src={
                  isEditing && editedCompany.logo
                    ? editedCompany.logo
                    : company.logo || "/default-company-logo.png"
                }
                alt={company.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />

              {isEditing && (
                <UploadButton
                  endpoint="imageUploader"
                  className="h-16 text-xs mt-2"
                  appearance={{ button: "h-9 text-md p-3" }}
                  onClientUploadComplete={(res) => {
                    if (res.length > 0) {
                      setEditedCompany((prev) => ({
                        ...prev,
                        logo: res[0].serverData.fileUrl,
                      }));
                    }
                  }}
                  onUploadError={(error) => {
                    console.error("Upload Error:", error);
                    toast.error("Logo upload failed: " + error.message);
                  }}
                />
              )}

              {isEditing ? (
                <Input
                  name="name"
                  value={editedCompany.name || ""}
                  onChange={handleInputChange}
                  className="text-xl font-semibold max-w-xs"
                  placeholder="Company Name"
                />
              ) : (
                company.name
              )}
            </CardTitle>
            
            {/* Desktop Action Buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div className="space-y-2">
              <strong className="text-gray-700">Industry:</strong>
              {isEditing ? (
                <Input
                  name="industry"
                  value={editedCompany.industry || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Healthcare"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-600">{company.industry || "Not specified"}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <strong className="text-gray-700">Website:</strong>
              {isEditing ? (
                <Input
                  name="website"
                  value={editedCompany.website || ""}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full"
                />
              ) : company.website ? (
                <a
                  href={
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {company.website}
                </a>
              ) : (
                <p className="text-gray-600">Not specified</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <strong className="text-gray-700">Address:</strong>
            {isEditing ? (
              <Textarea
                name="address"
                value={editedCompany.address || ""}
                onChange={handleInputChange}
                placeholder="Enter company address"
                className="w-full resize-none"
                rows={2}
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">{company.address || "Not specified"}</p>
            )}
          </div>

          {/* About */}
          <div className="space-y-2">
            <strong className="text-gray-700">About:</strong>
            {isEditing ? (
              <Textarea
                name="about"
                value={editedCompany.about || ""}
                onChange={handleInputChange}
                placeholder="Tell us about your company..."
                className="w-full resize-none"
                rows={4}
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">{company.about || "Not specified"}</p>
            )}
          </div>

          {/* Status and Admin Info */}
          <div className="border-t pt-4 space-y-3">
  {company.isVerified && (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
      <div>
        <strong className="text-gray-700">Verification Status: </strong>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Verified
        </span>
      </div>
    </div>
  )}

  {company.companyAdmin && (
    <div className="bg-gray-50 p-3 rounded-lg">
      <strong className="text-gray-700">Company Admin:</strong>
      <div className="mt-1 text-sm text-gray-600">
        <p>{company.companyAdmin.name}</p>
        <p className="text-blue-600">{company.companyAdmin.email}</p>
        {company.companyAdmin.phone && (
          <p>{company.companyAdmin.phone}</p>
        )}
      </div>
    </div>
  )}
</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;