"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, Flag } from "lucide-react";
import { parseNaturalLanguageTask } from "@/lib/nlp-parser";
import { useCreateTask } from "@/lib/hooks/useTasks";
import { useLists } from "@/lib/hooks/useLists";
import { useLabels } from "@/lib/hooks/useLabels";
import { toast } from "sonner";
import { format } from "date-fns";

interface QuickAddTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddTask({ open, onOpenChange }: QuickAddTaskProps) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseNaturalLanguageTask> | null>(null);
  const createTask = useCreateTask();
  const { data: lists = [] } = useLists();
  const { data: allLabels = [] } = useLabels();

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      const parsed = parseNaturalLanguageTask(value);
      setPreview(parsed);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !preview) return;

    const defaultList = lists.find((l) => l.isDefault) || lists[0];
    if (!defaultList) {
      toast.error("No list available");
      return;
    }

    try {
      // Match label names to label IDs
      const labelIds = preview.labels
        ?.map((labelName) => {
          const label = allLabels.find(
            (l) => l.name.toLowerCase() === labelName.toLowerCase()
          );
          return label?.id;
        })
        .filter(Boolean) as string[];

      await createTask.mutateAsync({
        title: preview.title,
        listId: defaultList.id,
        scheduleDate: preview.scheduleDate,
        deadline: preview.deadline,
        priority: preview.priority || "none",
        estimatedMinutes: preview.estimatedMinutes,
        labelIds: labelIds || [],
      });

      toast.success("Task created! 🎉");
      setInput("");
      setPreview(null);
      onOpenChange(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Quick Add Task
          </DialogTitle>
          <DialogDescription>
            Type naturally! Try "Buy milk tomorrow at 3pm" or "Urgent meeting on Friday 2h"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g., Call dentist tomorrow at 2pm urgent #health"
            autoFocus
            className="text-base"
          />

          {preview && (
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Task will be created as:</div>
                <div className="mt-2 font-medium">{preview.title}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.scheduleDate && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="size-3" />
                    Scheduled: {format(preview.scheduleDate, "MMM d, h:mm a")}
                  </Badge>
                )}
                {preview.deadline && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="size-3" />
                    Due: {format(preview.deadline, "MMM d, h:mm a")}
                  </Badge>
                )}
                {preview.priority && preview.priority !== "none" && (
                  <Badge
                    variant="outline"
                    className="gap-1"
                    style={{
                      borderColor:
                        preview.priority === "high"
                          ? "#ef4444"
                          : preview.priority === "medium"
                          ? "#f97316"
                          : "#3b82f6",
                      color:
                        preview.priority === "high"
                          ? "#ef4444"
                          : preview.priority === "medium"
                          ? "#f97316"
                          : "#3b82f6",
                    }}
                  >
                    <Flag className="size-3" />
                    {preview.priority}
                  </Badge>
                )}
                {preview.estimatedMinutes && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" />
                    {preview.estimatedMinutes} min
                  </Badge>
                )}
                {preview.labels?.map((label) => (
                  <Badge key={label} variant="outline">
                    #{label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!preview || createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          <div className="font-medium">Quick tips:</div>
          <ul className="mt-1 space-y-1">
            <li>• Time: "tomorrow", "friday", "next week", "at 3pm"</li>
            <li>• Priority: "urgent", "important", "low priority"</li>
            <li>• Duration: "30min", "2h", "1.5 hours"</li>
            <li>• Labels: "#work", "#personal", "#health"</li>
            <li>• Deadline: "by friday", "due tomorrow"</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
