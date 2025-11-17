import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { labels } from "@/lib/db/schema";
import { nanoid } from "@/lib/utils";
import { timestampToDate } from "@/lib/db/utils";

export async function GET() {
  try {
    const allLabels = db.select().from(labels).all();

    const mapped = allLabels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      icon: label.icon,
      createdAt: timestampToDate(label.createdAt) ?? new Date(),
      updatedAt: timestampToDate(label.updatedAt) ?? new Date(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching labels:", error);
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color = "#6b7280", icon = "🏷️" } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const labelId = nanoid();

    db.insert(labels)
      .values({
        id: labelId,
        name,
        color,
        icon,
      })
      .run();

    return NextResponse.json({ id: labelId }, { status: 201 });
  } catch (error) {
    console.error("Error creating label:", error);
    return NextResponse.json(
      { error: "Failed to create label" },
      { status: 500 }
    );
  }
}
