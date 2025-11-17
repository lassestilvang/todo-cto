"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import { useLists } from "@/lib/hooks/useLists";
import { useLabels } from "@/lib/hooks/useLabels";
import { Task, Priority, RecurrenceType } from "@/lib/types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock, Flag, Plus, X, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultListId?: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultListId,
}: TaskDialogProps) {
  const { data: lists = [] } = useLists();
  const { data: allLabels = [] } = useLabels();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listId, setListId] = useState(defaultListId || "");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>("none");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceType | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setListId(task.listId);
      setScheduleDate(task.scheduleDate || undefined);
      setDeadline(task.deadline || undefined);
      setPriority(task.priority);
      setSelectedLabelIds(task.labels?.map((l) => l.id) || []);
      setEstimatedMinutes(task.estimatedMinutes?.toString() || "");
      setSubtasks(task.subtasks?.map((s) => s.title) || []);
      setRecurrence(task.recurrence || null);
    } else {
      resetForm();
    }
  }, [task, open, defaultListId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setListId(defaultListId || lists[0]?.id || "");
    setScheduleDate(undefined);
    setDeadline(undefined);
    setPriority("none");
    setSelectedLabelIds([]);
    setEstimatedMinutes("");
    setSubtaskInput("");
    setSubtasks([]);
    setRecurrence(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!listId) {
      toast.error("Please select a list");
      return;
    }

    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          title,
          description: description || undefined,
          listId,
          scheduleDate,
          deadline,
          priority,
          labelIds: selectedLabelIds,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
          recurrence: recurrence || undefined,
          subtasks: subtasks.map((title, index) => ({
            title,
            completed: false,
            position: index,
          })) as any,
        });
        toast.success("Task updated successfully");
      } else {
        await createTask.mutateAsync({
          title,
          description,
          listId,
          scheduleDate,
          deadline,
          priority,
          labelIds: selectedLabelIds,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
          recurrence: recurrence || undefined,
          subtaskTitles: subtasks,
        });
        toast.success("Task created successfully");
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(task ? "Failed to update task" : "Failed to create task");
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details of your task"
              : "Fill in the details to create a new task"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review project proposal"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="list">List*</Label>
              <Select value={listId} onValueChange={setListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <span className="flex items-center gap-2">
                        <span>{list.icon}</span>
                        {list.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟠 Medium</SelectItem>
                  <SelectItem value="low">🔵 Low</SelectItem>
                  <SelectItem value="none">⚪ None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Schedule Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 size-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated">Estimated time (minutes)</Label>
            <Input
              id="estimated"
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="60"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={recurrence || "none"}
              onValueChange={(value) =>
                setRecurrence(value === "none" ? null : (value as RecurrenceType))
              }
            >
              <SelectTrigger>
                <Repeat className="mr-2 size-4" />
                <SelectValue placeholder="Does not repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekdays">Every weekday (Mon-Fri)</SelectItem>
                <SelectItem value="weekly">Every week</SelectItem>
                <SelectItem value="monthly">Every month</SelectItem>
                <SelectItem value="yearly">Every year</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {allLabels.map((label) => (
                <Badge
                  key={label.id}
                  variant={selectedLabelIds.includes(label.id) ? "default" : "outline"}
                  className="cursor-pointer gap-1"
                  style={{
                    borderColor: label.color,
                    ...(selectedLabelIds.includes(label.id) && {
                      backgroundColor: label.color,
                      color: "white",
                    }),
                  }}
                  onClick={() => toggleLabel(label.id)}
                >
                  <span>{label.icon}</span>
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="flex gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add a subtask..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <Button type="button" size="icon" onClick={addSubtask}>
                <Plus className="size-4" />
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1 rounded-md border p-2">
                {subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded p-2 hover:bg-muted"
                  >
                    <span className="text-sm">{subtask}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => removeSubtask(index)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
            >
              {createTask.isPending || updateTask.isPending
                ? "Saving..."
                : task
                ? "Update Task"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
