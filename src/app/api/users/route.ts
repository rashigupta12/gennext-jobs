//MATCH-MY-JOB

/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { CompaniesTable, UsersTable } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { sendEmail } from "@/lib/mailer";
import { Details } from "@/lib/data";

// Generate a secure random password
function generateSecurePassword(length = 8) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = "";
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function sendWelcomeEmail(name: string, email: string, password: string, role: string, companyName?: string) {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;
    const roleDisplay = role === "ADMIN" ? "Company Admin" : role === "RECRUITER" ? "Recruiter" : "User";
    
    await sendEmail(
      Details.name,
      email,
      `Welcome to ${Details.name} - Account Created`,
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ${Details.name}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <img src=${Details.logoUrl} alt=${Details.name} width="140" style="margin-bottom: 15px; display:block; margin-left:auto; margin-right:auto;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${Details.name}!</h1>
    <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Your journey with technology begins here 🚀</p>
  </div>
  
  <!-- Body -->
  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${name}</strong>,</p>
    
    <p style="margin-bottom: 20px;">Welcome to ${Details.name}! Your account has been successfully created. Here are your login credentials:</p>
    
    <!-- Login Details -->
    <div style="background: #f8fafc; border-left: 4px solid #1e3a8a; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 18px;">🔐 Login Details</h3>
      <p style="margin: 8px 0;"><strong>Email:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${email}</code></p>
      <p style="margin: 8px 0;"><strong>Default Password:</strong> <code style="background: #fef2f2; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #dc2626;">${password}</code></p>
      <p style="margin: 8px 0;"><strong>Role:</strong> <span style="background: #059669; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; text-transform: uppercase; font-weight: 600;">${roleDisplay}</span></p>
      ${companyName ? `<p style="margin: 8px 0;"><strong>Company:</strong> <span style="color: #1f2937; font-weight: 600;">${companyName}</span></p>` : ''}
    </div>
    
    <!-- Login Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
        🔗 Access ${Details.name}
      </a>
    </div>
    
    <!-- Security Reminder -->
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h4 style="color: #92400e; margin: 0 0 10px 0; display: flex; align-items: center; font-size: 16px;">
        <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
        Security Reminder
      </h4>
      <p style="color: #92400e; margin: 0; font-weight: 500; font-size: 14px;">
        For your security, please <strong>change this temporary password</strong> immediately after your first login.
      </p>
    </div>
    
    <!-- Next Steps -->
    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">📋 Next Steps:</h4>
      <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 14px;">
        <li style="margin: 8px 0;">Complete your profile setup</li>
        ${role === "ADMIN" ? '<li style="margin: 8px 0;">Set up your company profile and manage access</li>' : ''}
        ${role === "RECRUITER" ? '<li style="margin: 8px 0;">Post jobs and review applications</li>' : ''}
        ${role === "USER" ? '<li style="margin: 8px 0;">Explore opportunities and apply for jobs</li>' : ''}
        <li style="margin: 8px 0;">Change your temporary password</li>
      </ul>
    </div>
    
    <!-- Footer -->
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280;">
      <p style="margin: 0;">Need assistance? Contact our support team</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">Best regards, <strong>The ${Details.name} Team</strong></p>
    </div>
  </div>
  
  <!-- Bottom Footer -->
  <tr>
            <td style="border-top:1px solid #e0e0e0; padding:20px; font-size:13px; color:#555; text-align:center;">
              <p style="margin:5px 0;">📞 ${Details.phone}</p>
              <p style="margin:5px 0;">✉️ ${Details.email}</p>
              <p style="margin:10px 0 0 0;">${Details.address}</p>
              <p style="margin:15px 0 0 0; font-size:12px; color:#999;">© 2025 ${Details.name}. All rights reserved.<br>
              This is an automated message, please do not reply.</p>
            </td>
          </tr>

</body>
</html>
`
    );

    console.log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const Id = searchParams.get("Id");
  const Ids = searchParams.get("Ids");
  const role = searchParams.get("role");
  const companyId = searchParams.get("companyId");

  try {
    // Case 1: Fetch a single user by ID
    if (Id) {
      const user = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.id, Id));

        console.log("User Response:", user);

      return NextResponse.json({
        success: true,
        data: user.length > 0 ? user[0] : null,
        message: user.length > 0 ? "User received successfully" : "User not found",
      });
    }
    
    // Case 2: Fetch multiple users by IDs
    else if (Ids) {
      const idArray = Ids.split(',').map(id => id.trim());
      
      const users = await db
        .select()
        .from(UsersTable)
        .where(inArray(UsersTable.id, idArray));

      return NextResponse.json({
        success: true,
        data: users,
        message: "Users fetched successfully",
      });
    }
    
    // Case 3: Fetch users with filters
    else {
      // Build where conditions dynamically
      const conditions = [];
      if (role) conditions.push(eq(UsersTable.role, role as "ADMIN" | "USER" | "RECRUITER"));
      if (companyId) conditions.push(eq(UsersTable.companyId, companyId));

      // Apply conditions only if they exist
      const users = await db
        .select()
        .from(UsersTable)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return NextResponse.json({
        success: true,
        data: users,
        message: "Users fetched successfully",
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create a new user (including company admins)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      mobile, 
      profile, 
      role, 
      companyId, 
      phone,
      generatePassword,
      sendWelcomeEmail: shouldSendEmail = true // Default to true
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(eq(UsersTable.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // Handle password logic
    let finalPassword = password;
    let passwordToSendInEmail = null;
    let isTemporaryPassword = false;

    if (generatePassword || !password) {
      // Generate a secure random password
      const generatedPassword = generateSecurePassword(10);
      finalPassword = generatedPassword;
      passwordToSendInEmail = generatedPassword;
      isTemporaryPassword = true;
    } else {
      // Use the provided password and treat it as default password
      passwordToSendInEmail = password;
      isTemporaryPassword = true; // Treat provided password as temporary/default
    }

    // Validate password exists
    if (!finalPassword) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(finalPassword, 12);

    // Determine role - if companyId is provided and no specific role, make them ADMIN
    const userRole = companyId && !role ? "ADMIN" : (role || "USER");

    // Get company name if companyId is provided
    let companyName = null;
    if (companyId) {
      const company = await db
        .select({ name: CompaniesTable.name })
        .from(CompaniesTable)
        .where(eq(CompaniesTable.id, companyId))
        .limit(1);
      
      if (company.length > 0) {
        companyName = company[0].name;
      }
    }

    // Insert new user
    const newUser = await db.insert(UsersTable).values({
      name,
      email,
      password: hashedPassword,
      mobile: phone || mobile || null,
      profile: profile || null,
      role: userRole,
      companyId: companyId || null,
      defaultpassword: isTemporaryPassword ? finalPassword : null, // Store original password if it's temporary/default
    }).returning();

    // If this is a company admin, update the company's adminId
    if (companyId && newUser[0] && userRole === "ADMIN") {
      await db
        .update(CompaniesTable)
        .set({ 
          adminId: newUser[0].id,
          updatedAt: new Date()
        })
        .where(eq(CompaniesTable.id, companyId));
    }

    // Send welcome email with login credentials
    let emailSent = false;
    if (shouldSendEmail && passwordToSendInEmail) {
      emailSent = await sendWelcomeEmail(
        name, 
        email, 
        passwordToSendInEmail, 
        userRole, 
        companyName || undefined
      );
    }

    // Prepare response data
    const responseData = {
      ...newUser[0],
      // Remove password from response for security
      password: undefined,
      defaultpassword: undefined, // Don't expose this in API response
      emailSent,
      ...(isTemporaryPassword && process.env.NODE_ENV === 'development' && { 
        // Only include in development for debugging
        tempPassword: passwordToSendInEmail 
      })
    };

    const roleDisplayName = userRole === 'ADMIN' ? 'Company admin' : 
                           userRole === 'RECRUITER' ? 'Recruiter' : 'User';

    return NextResponse.json({
      success: true,
      data: responseData,
      message: passwordToSendInEmail && emailSent
        ? `${roleDisplayName} created successfully. Login credentials sent to email.`
        : passwordToSendInEmail && !emailSent
        ? `${roleDisplayName} created successfully. Failed to send welcome email.`
        : `${roleDisplayName} created successfully.`,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing user
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, password, mobile, profile, role } = body;

    // Check if user exists
    const existingUser = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(eq(UsersTable.id, id));

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hash(password, 12);
    if (mobile !== undefined) updateData.mobile = mobile;
    if (profile !== undefined) updateData.profile = profile;
    if (role) updateData.role = role;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    // If password is being changed, clear the default password
    if (password) {
      updateData.defaultpassword = null;
    }

    // If no fields to update (except updatedAt which is always added)
    if (Object.keys(updateData).length <= 1) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    // Check if changing email to one that already exists
    if (email) {
      const emailExists = await db
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));
      
      if (emailExists.length > 0 && emailExists[0].id !== id) {
        return NextResponse.json(
          { success: false, message: "Email already in use by another user" },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await db
      .update(UsersTable)
      .set(updateData)
      .where(eq(UsersTable.id, id))
      .returning();

    // Remove sensitive data from response
    const responseData = {
      ...updatedUser[0],
      password: undefined,
      defaultpassword: undefined
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}