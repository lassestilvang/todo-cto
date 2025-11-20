"use client";

import { useState, useEffect, useMemo } from "react";
import { Task } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Flag,
  ChevronRight,
  ChevronLeft,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import { toast } from "sonner";
import { format } from "date-fns";
import { PomodoroTimer } from "./pomodoro-timer";

interface FocusModeProps {
  tasks: Task[];
  onClose: () => void;
}

const priorityColors = {
  high: "text-red-500 bg-red-50 dark:bg-red-950",
  medium: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  low: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  none: "text-gray-500 bg-gray-50 dark:bg-gray-950",
};

export function FocusMode({ tasks, onClose }: FocusModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const updateTask = useUpdateTask();

  const uncompletedTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const currentTask = uncompletedTasks[currentIndex];
  const progress = uncompletedTasks.length > 0
    ? ((currentIndex + 1) / uncompletedTasks.length) * 100
    : 100;

  const completedSubtasks = currentTask?.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = currentTask?.subtasks?.length ?? 0;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && currentIndex < uncompletedTasks.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === " " && currentTask) {
        e.preventDefault();
        handleToggleComplete();
      } else if (e.key === "d" || e.key === "D") {
        setShowDetails(!showDetails);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, uncompletedTasks.length, currentTask, showDetails, onClose]);

  const handleToggleComplete = async () => {
    if (!currentTask) return;

    try {
      await updateTask.mutateAsync({
        id: currentTask.id,
        completed: true,
      });

      toast.success("Task completed! 🎉");

      if (currentIndex < uncompletedTasks.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (uncompletedTasks.length === 1) {
        toast.success("All tasks complete! Great work! 🌟");
        onClose();
      }
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const handleNext = () => {
    if (currentIndex < uncompletedTasks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentTask) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-6 text-green-500" />
              All Done!
            </CardTitle>
            <CardDescription>
              You've completed all your tasks. Great work!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onClose} className="w-full">
              Exit Focus Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <EyeOff className="mr-2 size-4" />
              Exit Focus Mode
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <Eye className="mr-2 size-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {uncompletedTasks.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPomodoro(true)}
            >
              <Timer className="mr-2 size-4" />
              Start Pomodoro
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-1" />
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-6">
            {currentTask.priority !== "none" && (
              <div className="flex justify-center">
                <Badge
                  className={cn(
                    "px-4 py-2 text-base",
                    priorityColors[currentTask.priority]
                  )}
                >
                  <Flag className="mr-2 size-4" />
                  {currentTask.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
            )}

            <h1 className="text-center text-4xl font-bold leading-tight md:text-5xl">
              {currentTask.title}
            </h1>

            {showDetails && currentTask.description && (
              <p className="text-center text-lg text-muted-foreground">
                {currentTask.description}
              </p>
            )}

            {showDetails && (
              <div className="flex flex-wrap justify-center gap-3">
                {currentTask.scheduleDate && (
                  <Badge variant="outline" className="gap-2">
                    <Clock className="size-4" />
                    Scheduled: {format(currentTask.scheduleDate, "MMM d")}
                  </Badge>
                )}
                {currentTask.deadline && (
                  <Badge variant="outline" className="gap-2">
                    <Clock className="size-4" />
                    Due: {format(currentTask.deadline, "MMM d, h:mm a")}
                  </Badge>
                )}
                {currentTask.estimatedMinutes && (
                  <Badge variant="outline" className="gap-2">
                    <Clock className="size-4" />
                    Est: {currentTask.estimatedMinutes} min
                  </Badge>
                )}
                {totalSubtasks > 0 && (
                  <Badge variant="secondary" className="gap-2">
                    <CheckCircle2 className="size-4" />
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </Badge>
                )}
              </div>
            )}

            {showDetails && currentTask.subtasks && currentTask.subtasks.length > 0 && (
              <Card className="mx-auto max-w-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Subtasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentTask.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox checked={subtask.completed} disabled />
                      <span
                        className={cn(
                          "flex-1",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-5" />
            </Button>

            <Button
              size="lg"
              className="px-12 text-lg"
              onClick={handleToggleComplete}
            >
              <CheckCircle2 className="mr-2 size-5" />
              Complete Task
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={currentIndex >= uncompletedTasks.length - 1}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              <kbd className="rounded border bg-muted px-2 py-1">Space</kbd> to complete •{" "}
              <kbd className="rounded border bg-muted px-2 py-1">←</kbd>{" "}
              <kbd className="rounded border bg-muted px-2 py-1">→</kbd> to navigate •{" "}
              <kbd className="rounded border bg-muted px-2 py-1">D</kbd> toggle details •{" "}
              <kbd className="rounded border bg-muted px-2 py-1">Esc</kbd> to exit
            </p>
          </div>
        </div>
      </div>

      <PomodoroTimer
        open={showPomodoro}
        onOpenChange={setShowPomodoro}
        task={currentTask}
      />
    </div>
  );
}
