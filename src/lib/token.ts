import {
  createEmailVerificationToken,
  deleteEmailVerificationToken,
  findEmailVerificationTokenByEmail,
} from "@/actions/email-verification-token";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  findPasswordResetTokenByEmail,
} from "@/actions/password-reset-token";

import { v4 as uuidv4 } from "uuid";

export async function generateEmailVerificationToken(email: string) {
  const expirationTimeMs = parseInt(
    process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME_MS!
  );

  try {
    // Check if there's an existing token for this email
    const existingToken = await findEmailVerificationTokenByEmail(email);
    
    // If token exists and is still valid (not expired), return it
    if (existingToken && !isTokenExpired(existingToken.expiresAt)) {
      console.log(`Reusing existing valid token for email: ${email}`);
      return existingToken;
    }
    
    // If token exists but is expired, delete it
    if (existingToken) {
      console.log(`Deleting expired token for email: ${email}`);
      await deleteEmailVerificationToken(existingToken.id);
    }

    // Generate new token
    console.log(`Generating new email verification token for: ${email}`);
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + expirationTimeMs);
    return await createEmailVerificationToken({ email, token, expiresAt });
    
  } catch (error) {
    console.error(`Error generating email verification token for ${email}:`, error);
    return null;
  }
}

export async function generatePasswordResetToken(email: string) {
  const expirationTimeMs = parseInt(
    process.env.PASSWORD_RESET_TOKEN_EXPIRY_TIME_MS!
  );

  try {
    // Check if there's an existing token for this email
    const existingToken = await findPasswordResetTokenByEmail(email);
    
    // If token exists and is still valid (not expired), return it
    if (existingToken && !isTokenExpired(existingToken.expiresAt)) {
      console.log(`Reusing existing valid password reset token for email: ${email}`);
      return existingToken;
    }
    
    // If token exists but is expired, delete it
    if (existingToken) {
      console.log(`Deleting expired password reset token for email: ${email}`);
      await deletePasswordResetToken(existingToken.id);
    }

    // Generate new token
    console.log(`Generating new password reset token for: ${email}`);
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + expirationTimeMs);
    return await createPasswordResetToken({ email, token, expiresAt });
    
  } catch (error) {
    console.error(`Error generating password reset token for ${email}:`, error);
    return null;
  }
}

// Helper function to check if token is expired
function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}