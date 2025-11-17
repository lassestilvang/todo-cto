import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ListParams {
  params: {
    listId: string;
  };
}

export async function PATCH(request: NextRequest, { params }: ListParams) {
  try {
    const { name, color, icon } = await request.json();

    const updatedValues: Record<string, any> = {};

    if (name !== undefined) {
      updatedValues.name = name;
    }
    if (color !== undefined) {
      updatedValues.color = color;
    }
    if (icon !== undefined) {
      updatedValues.icon = icon;
    }

    if (Object.keys(updatedValues).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    db.update(lists)
      .set(updatedValues)
      .where(eq(lists.id, params.listId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating list:", error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: ListParams) {
  try {
    const listId = params.listId;

    // Prevent deleting default inbox list
    const list = db.select().from(lists).where(eq(lists.id, listId)).get();
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    if (list.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default inbox list" },
        { status: 400 }
      );
    }

    db.delete(lists)
      .where(eq(lists.id, listId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
