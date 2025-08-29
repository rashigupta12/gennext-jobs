"use client";
import { Details } from "@/lib/data";
import { Briefcase, LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check user role
  const isAdmin = session?.user?.role === "ADMIN";
  const isRecruiter = session?.user?.role === "RECRUITER";

  const handleLogout = async () => {
    await signOut({ redirectTo: "/" });
  };

  // Function to determine dashboard URL based on user role
  const getDashboardUrl = () => {
    if (isAdmin) return "/dashboard/admin";
    if (isRecruiter) return "/dashboard/recruiter";
    return "/dashboard/user";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("session" , session)

  return (
    <nav className="fixed z-50 top-0 w-full bg-white p-4 shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Image
              src={Details.logoUrl}
              alt="Logo"
              width={100}
              height={14}
              className="transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>
        <div className="hidden space-x-6 md:flex">
          {/* <Link href="/" className="text-gray-700 transition-colors duration-300 hover:underline">
            Home
          </Link> */}
          <Link href="/jobs" className="text-gray-700 transition-colors duration-300 hover:underline flex items-center gap-1">
            <Briefcase size={16} />
            Jobs
          </Link>
          <Link href="/aboutUs" className="text-gray-700 transition-colors duration-300 hover:underline">
            About us
          </Link>
          <Link href="/contactUs" className="text-gray-700 transition-colors duration-300 hover:underline">
            Contact us
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          {session ? (
            <>
              {/* Dashboard Button for All User Types */}
              <Link href={getDashboardUrl()}>
                <Button
                  variant="outline"
                  className="transition-transform duration-300 hover:scale-105 hover:bg-gennext-dark hover:text-white flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <User size={20} className="text-gray-700" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">Welcome,</p>
                      <p>{session.user?.name || "User"}</p>
                    </div>
                    {session.user?.role=== "USER" && (
                    <Link href={`/profile/${session.user?.id}`}>
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <Settings size={16} className="mr-2" />
                        Profile Settings
                      </div>
                    </Link>
                    )}
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="transition-transform duration-300 hover:scale-105 hover:bg-gennext-dark hover:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  className="transition-transform duration-300 hover:scale-105 hover:bg-gennext-dark hover:text-white"
                >
                  Signup
                </Button>
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-4 bg-white p-4 shadow-lg">
          {/* <Link href="/" className="text-gray-700 transition-colors duration-300 hover:underline" onClick={() => setIsOpen(false)}>
            Home
          </Link> */}
          <Link href="/jobs" className="text-gray-700 transition-colors duration-300 hover:underline flex items-center gap-1" onClick={() => setIsOpen(false)}>
            <Briefcase size={16} />
            Jobs
          </Link>
          <Link href="/aboutUs" className="text-gray-700 transition-colors duration-300 hover:underline" onClick={() => setIsOpen(false)}>
            About us
          </Link>
          <Link href="/contactUs" className="text-gray-700 transition-colors duration-300 hover:underline" onClick={() => setIsOpen(false)}>
            Contact us
          </Link>

          {session ? (
            <>
              {/* Dashboard Option for All User Types */}
              <Link href={getDashboardUrl()} onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              </Link>

               {session.user?.role=== "USER" && (

              <Link href={`/profile/${session.user?.id}`} onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <User size={16} />
                  Profile Settings
                </Button>
              </Link>
               )}
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">Signup</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;