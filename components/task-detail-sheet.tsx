"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTask } from "@/lib/hooks/useTasks";
import { Task } from "@/lib/types";
import { Loader2, Upload, Download, Flag, Clock, Calendar, Hourglass } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface TaskDetailSheetProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
}

export function TaskDetailSheet({ taskId, open, onOpenChange, onEdit }: TaskDetailSheetProps) {
  const { data: task, isLoading, refetch } = useTask(taskId ?? "");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !taskId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("Attachment uploaded");
      await refetch();
    } catch (error) {
      toast.error("Failed to upload attachment");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription>Review everything about this task</SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : !task ? (
            <p className="text-center text-muted-foreground">Select a task to view details.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{task.title}</h2>
                  {task.description && (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                      {task.description}
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={() => onEdit(task)}>
                  Edit Task
                </Button>
              </div>

              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <DetailItem icon={Flag} label="Priority" value={task.priority.toUpperCase()} />
                {task.scheduleDate && (
                  <DetailItem
                    icon={Calendar}
                    label="Scheduled"
                    value={format(task.scheduleDate, "PPP")}
                  />
                )}
                {task.deadline && (
                  <DetailItem
                    icon={Clock}
                    label="Deadline"
                    value={format(task.deadline, "PPP p")}
                  />
                )}
                <DetailItem
                  icon={Hourglass}
                  label="Estimate"
                  value={task.estimatedMinutes ? `${task.estimatedMinutes} minutes` : "Not set"}
                />
                <DetailItem
                  icon={Hourglass}
                  label="Actual"
                  value={task.actualMinutes ? `${task.actualMinutes} minutes` : "Not logged"}
                />
                {task.list && (
                  <DetailItem
                    icon={task.list.icon as any}
                    label="List"
                    value={task.list.name}
                    color={task.list.color}
                  />
                )}
              </div>

              {task.labels && task.labels.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Labels
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.labels.map((label) => (
                      <Badge
                        key={label.id}
                        variant="outline"
                        className="gap-1"
                        style={{ borderColor: label.color, color: label.color }}
                      >
                        <span>{label.icon}</span>
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Subtasks
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {task.subtasks.map((subtask) => (
                      <li
                        key={subtask.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span>{subtask.title}</span>
                        <Badge variant={subtask.completed ? "default" : "secondary"}>
                          {subtask.completed ? "Done" : "Pending"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Attachments
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <label className="flex cursor-pointer items-center gap-2">
                        <Upload className="size-4" />
                        {isUploading ? "Uploading..." : "Upload"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supported in local development. Files stored in repository.
                    </p>
                  </div>

                  {task.attachments && task.attachments.length > 0 ? (
                    <ul className="space-y-2">
                      {task.attachments.map((attachment) => (
                        <li
                          key={attachment.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            {attachment.size && (
                              <p className="text-xs text-muted-foreground">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                          <Button asChild size="icon" variant="secondary">
                            <a href={attachment.url} download>
                              <Download className="size-4" />
                            </a>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No attachments yet.
                    </p>
                  )}
                </div>
              </section>

              {task.changeLogs && task.changeLogs.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Change Log
                  </h3>
                  <div className="mt-2 space-y-3">
                    {task.changeLogs.map((log) => (
                      <div key={log.id} className="rounded-md border p-3">
                        <p className="text-sm font-medium">{log.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(log.createdAt, "PPP p")}
                        </p>
                        {log.field && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Field: {log.field}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {typeof Icon === "string" ? (
        <span className="text-2xl" aria-hidden>
          {Icon}
        </span>
      ) : (
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      )}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}
