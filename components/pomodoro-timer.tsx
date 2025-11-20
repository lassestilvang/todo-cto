"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Task } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, RotateCcw, SkipForward, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateTask } from "@/lib/hooks/useTasks";

interface PomodoroTimerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes
const SESSIONS_BEFORE_LONG_BREAK = 4;

type TimerMode = "work" | "shortBreak" | "longBreak";

export function PomodoroTimer({ open, onOpenChange, task }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const updateTask = useUpdateTask();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const getDuration = useCallback((currentMode: TimerMode) => {
    switch (currentMode) {
      case "work":
        return WORK_DURATION;
      case "shortBreak":
        return SHORT_BREAK;
      case "longBreak":
        return LONG_BREAK;
    }
  }, []);

  const getModeLabel = (currentMode: TimerMode) => {
    switch (currentMode) {
      case "work":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playNotificationSound = () => {
    if (typeof window !== "undefined" && window.Audio) {
      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      } catch (error) {
        // Silently fail if audio doesn't work
      }
    }
  };

  const notifyUser = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon.png" });
    }
    playNotificationSound();
  }, []);

  const completeSession = useCallback(async () => {
    if (mode === "work") {
      const focusMinutes = WORK_DURATION / 60;
      setSessionsCompleted((prev) => prev + 1);
      setTotalFocusTime((prev) => prev + focusMinutes);

      // Update task's actual minutes if task is selected
      if (task) {
        const currentActual = task.actualMinutes || 0;
        await updateTask.mutateAsync({
          id: task.id,
          actualMinutes: currentActual + focusMinutes,
        });
      }

      toast.success(`Focus session complete! 🎉`, {
        description: `You completed ${focusMinutes} minutes of focused work.`,
      });

      notifyUser("Focus Session Complete!", `Great job! You completed ${focusMinutes} minutes of focused work.`);

      // Determine next mode
      const nextSessionCount = sessionsCompleted + 1;
      if (nextSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
        setMode("longBreak");
        setTimeLeft(LONG_BREAK);
        toast.info("Time for a long break! 🌟");
      } else {
        setMode("shortBreak");
        setTimeLeft(SHORT_BREAK);
        toast.info("Time for a short break! ☕");
      }
    } else {
      toast.success("Break complete!", {
        description: "Ready to focus again?",
      });
      notifyUser("Break Complete!", "Time to get back to work!");
      setMode("work");
      setTimeLeft(WORK_DURATION);
    }
    setIsRunning(false);
  }, [mode, sessionsCompleted, task, updateTask, notifyUser]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      startTimeRef.current = null;
    }
  }, [isRunning, timeLeft, completeSession]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
    if (!isRunning && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
    startTimeRef.current = null;
  };

  const skipSession = () => {
    setIsRunning(false);
    completeSession();
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  useEffect(() => {
    if (!open) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="size-5" />
            Pomodoro Timer
          </DialogTitle>
          {task && (
            <DialogDescription className="text-left">
              Focusing on: <strong>{task.title}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            <Badge variant={mode === "work" ? "default" : "secondary"}>
              {getModeLabel(mode)}
            </Badge>
            <Badge variant="outline">
              {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""} completed
            </Badge>
          </div>

          <div className="relative">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-7xl font-bold tabular-nums tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="h-2 w-full" />
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              size="lg"
              onClick={toggleTimer}
              className="w-32"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 size-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 size-5" />
                  Start
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
            >
              <RotateCcw className="size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={skipSession}
            >
              <SkipForward className="size-5" />
            </Button>
          </div>

          {totalFocusTime > 0 && (
            <div className="rounded-lg border bg-muted p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4" />
                <span>Total focus time today: {totalFocusTime} minutes</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
