// loginUser.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import * as z from "zod";
import { findUserByEmail } from "./user";
import { sendEmail } from "@/lib/mailer";
import { LoginSchema } from "@/validaton-schema";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateEmailVerificationToken } from "@/lib/token";
import bcrypt from "bcryptjs";
import { Details } from "@/lib/data";

export async function loginUser(values: z.infer<typeof LoginSchema>) {
  const validation = LoginSchema.safeParse(values);

  if (!validation.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validation.data;
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateEmailVerificationToken(existingUser.email);

    if (verificationToken) {
      const emailVerificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENDPOINT}`;
      const url = `${emailVerificationUrl}?token=${verificationToken.token}`;

      await sendEmail(
        Details.name,
        verificationToken.email,
        "Activate Your Account",
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Activation</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f3f4f6; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; padding:24px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <img src=${Details.logoUrl} 
                   alt=${Details.name} width="130" style="display:block; margin:0 auto;">
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:16px 0; border-bottom:1px solid #e0e0e0;">
              <h1 style="margin:0; font-size:22px; font-weight:bold; color:#222;">Activate Your Account</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:24px; font-size:15px; line-height:1.6; color:#444;">
              <p>Hello,</p>
              <p>Thank you for registering with us. To start using your account, please activate it by clicking the button below:</p>

              <div style="text-align:center; margin:32px 0;">
                <a href="${url}" 
                   style="background:#0066cc; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                  Activate My Account
                </a>
              </div>

              <p style="font-size:13px; color:#666;">If the button above doesn’t work, you can also copy and paste the following link into your browser:</p>
              <p style="font-size:13px; color:#0066cc; word-break:break-all;">${url}</p>

              <p style="margin-top:16px;">This activation link will expire in 24 hours.</p>
              <p>If you did not create an account, please disregard this email.</p>
              <p style="margin-top:12px;">Best regards,<br>The ${Details.name} Team</p>
            </td>
          </tr>

          <!-- Footer -->
         <tr>
            <td style="border-top:1px solid #e0e0e0; padding:20px; font-size:13px; color:#555; text-align:center;">
              <p style="margin:5px 0;">📞 ${Details.phone}</p>
              <p style="margin:5px 0;">✉️ ${Details.email}</p>
              <p style="margin:10px 0 0 0;">${Details.address}</p>
              <p style="margin:15px 0 0 0; font-size:12px; color:#999;">© 2025 ${Details.name}. All rights reserved.<br>
              This is an automated message, please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

`
      );

      return { success: "Email sent for email verification!" };
    }
  }
  const isUsingDefaultPassword = existingUser.defaultpassword &&
    await bcrypt.compare(password, existingUser.password) &&
    password === existingUser.defaultpassword;

  try {
    // Don't include redirectTo in signIn call
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false // Important: disable automatic redirect
    });

    if (result?.error) {
      return { error: "Invalid credentials!" };
    }

    // If user is logging in with default password, redirect to password change
    if (isUsingDefaultPassword) {
      return {
        success: "First-time login detected!",
        redirectTo: `/auth/change-password?userId=${existingUser.id}&firstTime=true`,
        requirePasswordChange: true,
        userId: existingUser.id
      };
    }

    return { success: "Logged in successfully!", redirectTo: DEFAULT_LOGIN_REDIRECT };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    return { error: "An unexpected error occurred." };
  }
}

