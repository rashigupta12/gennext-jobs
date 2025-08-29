// /app/api/subcategories/route.ts
import { NextResponse } from "next/server";
import { SubcategoriesTable, CategoriesTable } from "@/db/schema";

import { eq,inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";

// Validation schema for subcategory creation
const createSubcategorySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(100),
 
  slug: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");
    const subcategoryIds = searchParams.getAll("subcategoryIds");

    let subcategories;

    if (subcategoryId) {
      // Fetch a single subcategory by `subcategoryId`
      subcategories = await db
        .select()
        .from(SubcategoriesTable)
        .where(eq(SubcategoriesTable.id, subcategoryId));
    } else if (subcategoryIds.length > 0) {
      // Fetch multiple subcategories by `subcategoryIds`
      subcategories = await db
        .select()
        .from(SubcategoriesTable)
        .where(inArray(SubcategoriesTable.id, subcategoryIds));
    } else if (categoryId) {
      // Fetch subcategories filtered by `categoryId`
      subcategories = await db
        .select()
        .from(SubcategoriesTable)
        .where(eq(SubcategoriesTable.categoryId, categoryId));
    } else {
      // Fetch all subcategories if no filters are provided
      subcategories = await db.select().from(SubcategoriesTable);
    }

    return NextResponse.json({ subcategories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createSubcategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Check if category exists
    const category = await db
      .select()
      .from(CategoriesTable)
      .where(eq(CategoriesTable.id, data.categoryId))
      .limit(1);
      
    if (category.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-");
    }
    
    // Create subcategory
    const [newSubcategory] = await db
      .insert(SubcategoriesTable)
      .values(data)
      .returning();
      
    return NextResponse.json({ subcategory: newSubcategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}






