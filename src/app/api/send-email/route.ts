 /* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();

    // Validate input
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.NODEMAILER_EMAIL_USER || !process.env.NODEMAILER_EMAIL_PASSWORD) {
      console.error("Missing email credentials in environment variables");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    console.log("Setting up email transporter...");

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL_USER,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified");

    // Send email
    const info = await transporter.sendMail({
      from: `"Website Contact Form" <${process.env.NODEMAILER_EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });

  } catch (error: any) {
    console.error("Email sending failed:", error);
    
    let errorMessage = "Failed to send email";
    
    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Check your credentials.";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Could not connect to email server.";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { message: "This endpoint only accepts POST requests" },
    { status: 405 }
  );
}