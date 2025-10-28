/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import Analytics from "@/components/admin/analytics";
import Application from "@/components/admin/application";
import JobListingForm from "@/components/admin/jobListing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Home, LogOut, Settings, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../../../../public/images/logo.png";

import RecruiterManagement from "@/components/admin/recruiter";
import Companies from "@/components/super-admin/Companies";

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/admin?tab=${tab}`, { scroll: false });
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
     
      default:
        return <Companies />;
    }
  };

  const {data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-4 md:px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {!isMobile && (
              <button 
                onClick={toggleSidebar}
                className="mr-2 p-1 rounded-md hover:bg-gray-100 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className={`flex items-center ${isMobile ? 'mx-auto' : ''}`}>
              <Image 
                src={logo} 
                alt="Logo" 
                width={isMobile ? 80 : 100} 
                height={isMobile ? 8 : 10} 
                className="transition-transform duration-300 hover:scale-105" 
              />
            </div>
          </div>
          <h1 className="hidden md:block text-center text-2xl font-bold">Super Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-1">
                  {/* <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </button> */}

                  {/* <p className="">{session?.user?.name}</p> */}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </nav>

      <div className="flex relative">
        {/* Sidebar Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`
          bg-white border-r min-h-[calc(100vh-64px)] p-4 transition-all duration-300 ease-in-out
          fixed md:relative z-30 w-64
          ${isSidebarOpen ? 'left-0' : '-left-64'}
          md:left-0
        `}>
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="font-semibold">Navigation</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => handleTabChange("dashboard")} 
              className={`w-full flex items-center gap-2 rounded-lg p-2 ${activeTab === "dashboard" ? "bg-gray-100" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm">Companies</span>
            </button>
            
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}