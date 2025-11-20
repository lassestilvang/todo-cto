"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLabel } from "@/lib/hooks/useLabels";
import { toast } from "sonner";

interface CreateLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#a855f7",
  "#64748b",
];

const defaultIcons = ["🏷️", "🔥", "💡", "⚡", "🚀", "🧠", "🛠️", "❤️", "📅", "✅"];

export function CreateLabelDialog({ open, onOpenChange }: CreateLabelDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColors[0]);
  const [icon, setIcon] = useState(defaultIcons[0]);
  const createLabel = useCreateLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a label name");
      return;
    }

    try {
      await createLabel.mutateAsync({ name, color, icon });
      toast.success("Label created successfully");
      setName("");
      setColor(defaultColors[0]);
      setIcon(defaultIcons[0]);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create label");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Label</DialogTitle>
          <DialogDescription>Labels help you group tasks visually.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labelName">Label name</Label>
            <Input
              id="labelName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High Focus, Personal"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select label icon">
              {defaultIcons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIcon(emoji);
                    }
                  }}
                  className={`size-10 rounded-md border-2 text-xl transition-colors ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:bg-muted"
                  }`}
                  aria-label={`Icon: ${emoji}`}
                  aria-pressed={icon === emoji}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select label color">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setColor(c);
                    }
                  }}
                  className={`size-8 rounded-full border-2 ${
                    color === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLabel.isPending}>
              {createLabel.isPending ? "Creating..." : "Create Label"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
