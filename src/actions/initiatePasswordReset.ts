"use server";


import { sendEmail } from "@/lib/mailer";
import { generatePasswordResetToken } from "@/lib/token";
import { z } from "zod";
import { findUserByEmail } from "./user";
import { ForgotPasswordSchema } from "@/validaton-schema";
import { Details } from "@/lib/data";

export async function initiatePasswordReset(
  values: z.infer<typeof ForgotPasswordSchema>
) {
  const validation = ForgotPasswordSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid email!" } as const;
  }

  const { email } = validation.data;

  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return { error: "Email not found!" } as const;
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (passwordResetToken) {
    const resetPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT}`;
    const url = `${resetPasswordUrl}?token=${passwordResetToken.token}`;

    await sendEmail(
      Details.name,
      passwordResetToken.email,
      "Reset your password",
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f3f4f6; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; padding:20px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src=${Details.logoUrl} alt=${Details.name} width="150" style="display:block;">
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding:10px 0; border-bottom:1px solid #e0e0e0;">
              <h1 style="margin:0; font-size:22px; font-weight:600; color:#222;">Reset Your Password</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:20px; font-size:15px; line-height:1.6; color:#444;">
              <p>Hello,</p>
              <p>We received a request to reset your password. If you made this request, please click the button below to set a new password:</p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${url}" 
                   style="background:#0066cc; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                  Reset My Password
                </a>
              </div>

              <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
              <p style="word-break:break-all; color:#0066cc;">${url}</p>

              <p>This reset link will expire in 24 hours.</p>
              <p>If you did not request a password reset, please ignore this email. Your account will remain secure.</p>

              <p style="margin-top:20px;">Best regards,<br>The ${Details.name} Team</p>
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

    



    return { success: "Reset email sent!" } as const;
  }

  return { error: "Email not sent!" } as const;
}
