"use client";

import { Task } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Calendar, CheckSquare, Clock, Flag } from "lucide-react";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { announce } from "@/components/aria-announcer";

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityColors = {
  high: "text-red-500",
  medium: "text-orange-500",
  low: "text-blue-500",
  none: "text-gray-500",
};

export function TaskItem({ task, onClick }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const [isCompleting, setIsCompleting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleToggleComplete = async () => {
    setIsCompleting(true);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        completed: !task.completed,
      });

      const action = !task.completed ? "completed" : "marked incomplete";
      announce(`Task ${task.title} ${action}`);

      if (!task.completed) {
        toast.success("Task completed! 🎉");
      }
    } catch {
      announce("Failed to update task", "assertive");
      toast.error("Failed to update task");
    } finally {
      setTimeout(() => setIsCompleting(false), 300);
    }
  };

  const handleToggleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await handleToggleComplete();
  };

  const handleToggleKeyDown = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      await handleToggleComplete();
    }
  };

  const isOverdue = task.deadline && !task.completed && isPast(task.deadline);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        task.completed && "opacity-60",
        isOverdue && "border-red-500/50"
      )}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task ${task.title}${task.completed ? ", completed" : ""}${isOverdue ? ", overdue" : ""}`}
    >
      <div className="flex gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            disabled={isCompleting}
            className="size-5"
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            onClick={handleToggleClick}
            onKeyDown={handleToggleKeyDown}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-medium leading-tight",
                task.completed && "line-through"
              )}
            >
              {task.title}
            </h3>

            {task.priority !== "none" && (
              <div className="flex items-center gap-1" aria-label={`${task.priority} priority`}>
                <Flag className={cn("size-4 shrink-0", priorityColors[task.priority])} aria-hidden="true" />
                <span className="sr-only">{task.priority} priority</span>
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Task metadata">
            {task.scheduleDate && (
              <Badge variant="outline" className="gap-1 text-xs" role="listitem" aria-label={`Scheduled for ${getDateLabel(task.scheduleDate)}`}>
                <Calendar className="size-3" aria-hidden="true" />
                {getDateLabel(task.scheduleDate)}
              </Badge>
            )}

            {task.deadline && (
              <Badge
                variant={isOverdue ? "destructive" : "outline"}
                className="gap-1 text-xs"
                role="listitem"
                aria-label={isOverdue ? `Deadline ${format(task.deadline, "MMM d, h:mm a")} overdue` : `Deadline ${format(task.deadline, "MMM d, h:mm a")}`}
              >
                <Clock className="size-3" aria-hidden="true" />
                {format(task.deadline, "MMM d, h:mm a")}
                {isOverdue && " (Overdue)"}
              </Badge>
            )}

            {hasSubtasks && (
              <Badge variant="secondary" className="gap-1 text-xs" role="listitem" aria-label={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}>
                <CheckSquare className="size-3" aria-hidden="true" />
                {completedSubtasks}/{totalSubtasks}
              </Badge>
            )}

            {task.labels?.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="gap-1 text-xs"
                style={{ borderColor: label.color, color: label.color }}
                role="listitem"
                aria-label={`Label ${label.name}`}
              >
                <span aria-hidden="true">{label.icon}</span>
                {label.name}
              </Badge>
            ))}

            {task.list && (
              <Badge variant="secondary" className="gap-1 text-xs" role="listitem" aria-label={`List ${task.list.name}`}>
                <span aria-hidden="true">{task.list.icon}</span>
                {task.list.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
