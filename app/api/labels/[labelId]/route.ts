import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { labels, taskLabels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ labelId: string }> }
) {
  try {
    const { labelId } = await context.params;
    const { name, color, icon } = await request.json();

    const updatedValues: Partial<{
      name: string;
      color: string;
      icon: string;
    }> = {};

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

    db.update(labels)
      .set(updatedValues)
      .where(eq(labels.id, labelId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating label:", error);
    return NextResponse.json(
      { error: "Failed to update label" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ labelId: string }> }
) {
  try {
    const { labelId } = await context.params;

    db.delete(taskLabels)
      .where(eq(taskLabels.labelId, labelId))
      .run();

    db.delete(labels)
      .where(eq(labels.id, labelId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting label:", error);
    return NextResponse.json(
      { error: "Failed to delete label" },
      { status: 500 }
    );
  }
}
