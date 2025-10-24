"use client";
import Analytics from "@/components/admin/analytics";
import Application from "@/components/admin/application";
import Dashboard from "@/components/admin/dashboard";
import JobListingForm from "@/components/admin/jobListing";
import JobListingDashboard from "@/components/admin/ListedJobDashobard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookOpen, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../../../../public/images/logo.png";

export default function Recruiter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "jobListing";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {data :sesssion} = useSession()

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/recruiter?tab=${tab}`, { scroll: false });
    setIsSidebarOpen(false); // close sidebar on mobile after click
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "jobListing":
        return <JobListingForm />;
      case "listedJobs":
        return <JobListingDashboard />;
      case "application":
        return <Application />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          {/* Left side: Logo + Menu button */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
            <Image
              src={logo}
              alt="Logo"
              width={100}
              height={10}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Title */}
          <h1 className="hidden md:block text-xl md:text-2xl font-bold text-gray-800">
            Recruiter Dashboard
          </h1>

          {/* User menu */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                 
                  <AvatarFallback>{(sesssion?.user?.name)?.charAt(0)}</AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </button>
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
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4">
          <nav className="space-y-2">
            <button
              onClick={() => handleTabChange("jobListing")}
              className={`w-full flex items-center gap-2 rounded-lg p-2 ${
                activeTab === "jobListing"
                  ? "bg-gray-100 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              } transition-colors`}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">Job Listing Form</span>
            </button>
            <button
              onClick={() => handleTabChange("listedJobs")}
              className={`w-full flex items-center gap-2 rounded-lg p-2 ${
                activeTab === "listedJobs"
                  ? "bg-gray-100 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              } transition-colors`}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">Listed Jobs</span>
            </button>
            <button
              onClick={() => handleTabChange("application")}
              className={`w-full flex items-center gap-2 rounded-lg p-2 ${
                activeTab === "application"
                  ? "bg-gray-100 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              } transition-colors`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Student Application</span>
            </button>
          </nav>
        </aside>

        {/* Sidebar (mobile) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative bg-white w-64 p-4 border-r flex flex-col">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
              <nav className="mt-8 space-y-2">
                <button
                  onClick={() => handleTabChange("jobListing")}
                  className={`w-full flex items-center gap-2 rounded-lg p-2 ${
                    activeTab === "jobListing"
                      ? "bg-gray-100 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Job Listing Form</span>
                </button>
                <button
                  onClick={() => handleTabChange("listedJobs")}
                  className={`w-full flex items-center gap-2 rounded-lg p-2 ${
                    activeTab === "listedJobs"
                      ? "bg-gray-100 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Listed Jobs</span>
                </button>
                <button
                  onClick={() => handleTabChange("application")}
                  className={`w-full flex items-center gap-2 rounded-lg p-2 ${
                    activeTab === "application"
                      ? "bg-gray-100 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Student Application</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className=" flex-1 p-2">{renderContent()}</main>
      </div>
    </div>
  );
}
