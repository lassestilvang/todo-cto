"use client";

import { Task } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Calendar, CheckSquare, Clock, Flag } from "lucide-react";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";

interface TaskItemProps {
  task: Task;
  onClick: () => void;
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

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleting(true);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        completed: !task.completed,
      });

      if (!task.completed) {
        toast.success("Task completed! 🎉");
      }
    } catch {
      toast.error("Failed to update task");
    } finally {
      setTimeout(() => setIsCompleting(false), 300);
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        task.completed && "opacity-60",
        isOverdue && "border-red-500/50"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="pt-0.5" onClick={handleToggleComplete}>
          <Checkbox
            checked={task.completed}
            disabled={isCompleting}
            className="size-5"
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
              <Flag className={cn("size-4 shrink-0", priorityColors[task.priority])} />
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {task.scheduleDate && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Calendar className="size-3" />
                {getDateLabel(task.scheduleDate)}
              </Badge>
            )}

            {task.deadline && (
              <Badge
                variant={isOverdue ? "destructive" : "outline"}
                className="gap-1 text-xs"
              >
                <Clock className="size-3" />
                {format(task.deadline, "MMM d, h:mm a")}
                {isOverdue && " (Overdue)"}
              </Badge>
            )}

            {hasSubtasks && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckSquare className="size-3" />
                {completedSubtasks}/{totalSubtasks}
              </Badge>
            )}

            {task.labels?.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="gap-1 text-xs"
                style={{ borderColor: label.color, color: label.color }}
              >
                <span>{label.icon}</span>
                {label.name}
              </Badge>
            ))}

            {task.list && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <span>{task.list.icon}</span>
                {task.list.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
