import { NextRequest, NextResponse } from "next/server";
import { db, initializeDefaultList } from "@/lib/db";
import { lists } from "@/lib/db/schema";
import { nanoid } from "@/lib/utils";
import { timestampToDate } from "@/lib/db/utils";

// Initialize default list
initializeDefaultList();

export async function GET() {
  try {
    const allLists = db.select().from(lists).all();

    const mapped = allLists.map((list) => ({
      id: list.id,
      name: list.name,
      color: list.color,
      icon: list.icon,
      isDefault: Boolean(list.isDefault),
      createdAt: timestampToDate(list.createdAt) ?? new Date(),
      updatedAt: timestampToDate(list.updatedAt) ?? new Date(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color = "#6b7280", icon = "📋" } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const listId = nanoid();

    db.insert(lists)
      .values({
        id: listId,
        name,
        color,
        icon,
        isDefault: false,
      })
      .run();

    return NextResponse.json({ id: listId }, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
