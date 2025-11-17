import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments, changeLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "@/lib/utils";
import fs from "fs";
import path from "path";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileId = nanoid();
    const fileName = `${fileId}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${fileName}`;

    db.insert(attachments)
      .values({
        id: fileId,
        taskId,
        name: file.name,
        url: relativeUrl,
        mimeType: file.type,
        size: file.size,
      })
      .run();

    db.insert(changeLogs)
      .values({
        id: nanoid(),
        taskId,
        field: "attachment",
        previousValue: null,
        newValue: file.name,
        description: `Attachment added: ${file.name}`,
        actor: "user",
      })
      .run();

    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const attachment = db
      .select()
      .from(attachments)
      .where(eq(attachments.id, taskId))
      .get();

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const absolutePath = path.join(process.cwd(), "public", attachment.url.replace(/^\//, ""));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    db.delete(attachments)
      .where(eq(attachments.id, taskId))
      .run();

    db.insert(changeLogs)
      .values({
        id: nanoid(),
        taskId: attachment.taskId,
        field: "attachment",
        previousValue: attachment.name,
        newValue: null,
        description: `Attachment removed: ${attachment.name}`,
        actor: "user",
      })
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
