"use client";
import JobListingForm from "@/components/admin/jobListing";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Home, LogOut, Menu, Users, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../../../../public/images/logo.png";

import RecruiterManagement from "@/components/admin/recruiter";
import Profile from "@/components/adminDashboard/Profile";

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on component unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [sidebarOpen]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/admin?tab=${tab}`, { scroll: false });
    setSidebarOpen(false); // auto-close sidebar on mobile
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "recruiter":
        return <RecruiterManagement />;
      case "jobListing":
        return <JobListingForm />;
      case "profile":
        return <Profile />;
      default:
        return <Profile />;
    }
  };

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: Home,
      description: "Manage company profile"
    },
    {
      id: "recruiter", 
      label: "Recruiters",
      icon: Users,
      description: "Manage recruiter accounts"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <Image
              src={logo}
              alt="Company Logo"
              width={100}
              height={40}
              className="transition-transform duration-300 hover:scale-105"
              priority
            />
            
          </div>
        </div>

        {/* Current tab indicator for mobile */}
        {/* <div className="sm:hidden">
          <span className="text-sm font-medium text-gray-700 capitalize">
            {activeTab}
          </span>
        </div> */}

        {/* Avatar Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-700">Admin</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-1">
              {/* <div className="px-2 py-1.5 border-b">
                <div className="text-sm font-medium">Admin Panel</div>
                <div className="text-xs text-gray-500">Manage your dashboard</div>
              </div> */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r shadow-sm">
          {/* <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Navigation</h2>
            <p className="text-xs text-gray-500 mt-1">Manage your dashboard</p>
          </div> */}
          
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 ${
                    activeTab === item.id 
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    activeTab === item.id ? "text-blue-600" : "text-gray-500"
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Sidebar for Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <aside className="relative w-80 max-w-[80vw] bg-white border-r shadow-xl z-50 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div>
                  <h2 className="font-semibold text-gray-800">Dashboard Menu</h2>
                  <p className="text-xs text-gray-500">Navigate your admin panel</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 ${
                        activeTab === item.id 
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" 
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        activeTab === item.id ? "text-blue-600" : "text-gray-500"
                      }`} />
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  Admin Dashboard v1.0
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden pb-16 lg:pb-0">
          <div className="h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Fixed Position */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-2 z-20">
        <div className="flex justify-center items-center gap-6">
          {menuItems.slice(0, 3).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}