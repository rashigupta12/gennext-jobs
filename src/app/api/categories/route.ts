
// File: app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq, and, or, not,inArray } from "drizzle-orm";
import { db } from "@/db";
import { CategoriesTable } from "@/db/schema";
import { z } from "zod";



// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - Fetch all categories
// GET - Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Check if we need to get active only
    const activeOnly = url.searchParams.get("active") === "true";

    // Get `id` or `ids` from query parameters
    const id = url.searchParams.get("id");
    const ids = url.searchParams.getAll("ids");

    let categories;

    if (id) {
      // Fetch a single category by `id`
      categories = await db
        .select()
        .from(CategoriesTable)
        .where(eq(CategoriesTable.id, id));
    } else if (ids.length > 0) {
      // Fetch multiple categories by `ids`
      categories = await db
        .select()
        .from(CategoriesTable)
        .where(inArray(CategoriesTable.id, ids));
    } else {
      // Fetch all categories (with optional active filter)
      if (activeOnly) {
        categories = await db
          .select()
          .from(CategoriesTable)
          .where(eq(CategoriesTable.isActive, true));
      } else {
        categories = await db.select().from(CategoriesTable);
      }
    }

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}


// POST - Create a new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.format() }, { status: 400 });
    }

    // Check for duplicate category name or slug
    const existingCategory = await db
      .select()
      .from(CategoriesTable)
      .where(or(eq(CategoriesTable.name, body.name), eq(CategoriesTable.slug, body.slug || "")))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({ error: "Category with this name or slug already exists" }, { status: 409 });
    }

    // Insert new category
    const newCategory = await db.insert(CategoriesTable).values({
      name: body.name,
      slug: body.slug,
      description: body.description,
      isActive: body.isActive ?? true,
    }).returning();

    return NextResponse.json({ category: newCategory[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}





export async function PUT(request: NextRequest ) {
  try {

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await db.select().from(CategoriesTable).where(eq(CategoriesTable.id, id!)).limit(1);
    if (existingCategory.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Ensure no duplicate category name or slug
    const checkDuplicate = await db
      .select()
      .from(CategoriesTable)
      .where(
        and(
          or(eq(CategoriesTable.name, body.name), eq(CategoriesTable.slug, body.slug || "")),
          not(eq(CategoriesTable.id, id!))
        )
      )
      .limit(1);

    if (checkDuplicate.length > 0) {
      return NextResponse.json({ error: "Category with this name or slug already exists" }, { status: 409 });
    }

    // Update category
    const updatedCategory = await db
      .update(CategoriesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(CategoriesTable.id, id!))
      .returning();

    return NextResponse.json({ category: updatedCategory[0] }, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE - Delete a category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    // Check if category exists
    const existingCategory = await db.select().from(CategoriesTable).where(eq(CategoriesTable.id, id!)).limit(1);
    if (existingCategory.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete category
    await db.delete(CategoriesTable).where(eq(CategoriesTable.id, id!));

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}