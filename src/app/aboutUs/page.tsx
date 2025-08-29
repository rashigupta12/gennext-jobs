"use client";

import React from "react";
import Footer from "@/components/common/Footer";

import Image from "next/image";
import person from "../../../public/aboutUs/person.png";
import client from "../../../public/images/client.png";
import Navbar from "@/components/common/Navbar";
import { Details } from "@/lib/data";

const AboutUs: React.FC = () => {
  return (
    <div>
      <div className="min-h-screen w-full bg-gray-50  overflow-hidden">
        <Navbar />

        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-white mt-16">
          <div className="relative w-full md:w-1/2 flex justify-center">
            <Image src={person} alt="" width={450} height={500}></Image>
            <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-lg p-2 flex items-center">
              <Image
                src={client}
                alt="User"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-2">
                <p className="text-sm font-semibold">480+</p>
                <p className="text-xs text-gray-500">Happy Candidates</p>
              </div>
              <span className="ml-2 text-blue-500">👍</span>
            </div>
            <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-2">
              <p className="text-lg font-semibold">25M+</p>
              <p className="text-xs text-gray-500">Jobs Available</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left mt-6 md:mt-0">
            <h2 className="text-3xl font-bold text-center mt-12 text-gray-900">About Us</h2>
            <p className="text-gray-600 mt-4">
              At {Details.name}, we bridge the gap between top-tier Finance
              professionals and the right career opportunities. Whether you&apos;re
              an employer seeking highly skilled candidates or a finance
              professional looking for the perfect role, our platform is
              designed to streamline the hiring process with precision and
              expertise.
            </p>

            <p className="text-gray-600 mt-4">
              For Employers: We understand that traditional hiring processes
              often fall short when it comes to assessing technical
              competencies. That’s why our recruitment approach is powered by
              industry experts, including Chartered Accountants, technical
              specialists, and HR professionals who pre-screen and interviews
              candidates to ensure only the most qualified professionals make it
              to your shortlist. 
            </p>

            <p className="text-gray-600 mt-4">
              For Finance Professionals: Your career deserves more than just job
              listings—it deserves the right match. Whether you are a Chartered
              Accountant, Company Secretary, Cost Accountant, Finance Executive,
              Article Assistant, Semi-Qualified Professional, or a Woman seeking
              remote work, we help you find opportunities that align with your
              skills, experience, and career aspirations. Our platform is built
              to connect you with employers who recognize your expertise and
              value your potential.
            </p>

            <p className="text-gray-600 mt-4">
              At {Details.name}, we are committed to redefining finance
              recruitment with efficiency, expertise, and the perfect job match.
              Join us today and #FindYourMatch.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
