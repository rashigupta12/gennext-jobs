'use client'

import { Details } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-50 to-gray-100 py-12 border-t border-blue-100">
      <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Contact */}
        <div>
          <Image
            src={Details.logoUrl}
            alt="Logo"
            width={150}
            height={30}
            className="transition-transform duration-300 hover:scale-105"
          />
          <p className="text-gray-700 mt-4 font-semibold">Need help? 24/7</p>
          <a 
            href={`tel:${Details.phone}`}
            className="text-[#007BFF] mt-1 font-medium hover:text-blue-600 transition-colors cursor-pointer inline-block"
          >
            {Details.phone}
          </a>
          
          {/* Add email - either from Details or hardcoded */}
          <div className="mt-2">
            <a 
              href={`mailto:${Details.email || 'contact@gennext.com'}`}
              className="text-[#007BFF] font-medium hover:text-blue-600 transition-colors cursor-pointer inline-block"
            >
              {Details.email || 'contact@gennext.com'}
            </a>
          </div>
          
          <p className="text-gray-600 mt-3">{Details.address}</p>
        </div>

        {/* Quick Links */}
        <div>
          {/* <h2 className="text-lg font-semibold text-gray-800">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li><Link href="/" className="hover:text-[#007BFF] transition-colors">Home</Link></li>
            <li><a href="/UploadResume" className="hover:text-[#007BFF] transition-colors">Upload Resume</a></li>
          </ul> */}
        </div>

        {/* For Candidates & Social Media */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">For Candidates</h2>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li><Link href="/aboutUs" className="hover:text-[#007BFF] transition-colors">About Us</Link></li>
            <li><Link href="/contactUs" className="hover:text-[#007BFF] transition-colors">Contact Us</Link></li>
          </ul>
          
          <h2 className="text-lg font-semibold text-gray-800 mt-6">Follow Us</h2>
          <div className="flex space-x-4 mt-3">
            <a href={Details.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
              <FaFacebookF className="text-gray-600 hover:text-[#007BFF] cursor-pointer transition-colors" />
            </a>
            <a href={Details.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn className="text-gray-600 hover:text-[#007BFF] cursor-pointer transition-colors" />
            </a>
            <a href={Details.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-gray-600 hover:text-[#007BFF] cursor-pointer transition-colors" />
            </a>
          
            <a href={Details.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-gray-600 hover:text-[#007BFF] cursor-pointer transition-colors" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="mt-10 pt-6 border-t border-blue-100 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Gennext IT. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;