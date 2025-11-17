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
import { useCreateList } from "@/lib/hooks/useLists";
import { toast } from "sonner";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultColors = [
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
];

const defaultIcons = ["📋", "📝", "📌", "📍", "🎯", "⭐", "💼", "🏠", "🎨", "📚"];

export function CreateListDialog({ open, onOpenChange }: CreateListDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColors[6]);
  const [icon, setIcon] = useState(defaultIcons[0]);
  const createList = useCreateList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    try {
      await createList.mutateAsync({ name, color, icon });
      toast.success("List created successfully");
      setName("");
      setColor(defaultColors[6]);
      setIcon(defaultIcons[0]);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create list");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a new list to organize your tasks
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Personal, Shopping"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {defaultIcons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`size-10 rounded-md border-2 text-xl transition-colors ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-8 rounded-full border-2 ${
                    color === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
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
            <Button type="submit" disabled={createList.isPending}>
              {createList.isPending ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
