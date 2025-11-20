"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { Task } from "@/lib/types";
import { useTaskSearch } from "@/lib/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Search, X, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLabels } from "@/lib/hooks/useLabels";
import { useLists } from "@/lib/hooks/useLists";

export function DashboardContent() {
  const {
    currentView,
    currentListId,
    currentLabelId,
    showCompletedTasks,
    searchQuery,
    setSearchQuery,
    toggleShowCompletedTasks,
  } = useAppStore();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const { data: lists = [] } = useLists();
  const { data: labels = [] } = useLabels();

  const taskQueryParams = useMemo(() => {
    if (currentView === "list" && currentListId) {
      return { listId: currentListId, includeCompleted: showCompletedTasks };
    }

    let viewParam: string | undefined;
    if (["today", "next7days", "upcoming", "all"].includes(currentView)) {
      viewParam = currentView;
    }

    return {
      view: viewParam,
      includeCompleted: showCompletedTasks,
    };
  }, [currentView, currentListId, showCompletedTasks]);

  const { data: tasks = [], isLoading } = useTasks(taskQueryParams);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (currentLabelId) {
      filtered = filtered.filter((task) =>
        task.labels?.some((label) => label.id === currentLabelId)
      );
    }

    return filtered;
  }, [tasks, currentLabelId]);

  const searchedTasks = useTaskSearch(filteredTasks, searchQuery);

  const handleTaskClick = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskDialog(true);
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setShowTaskDialog(true);
  };

  const handleTaskDialogOpenChange = (open: boolean) => {
    setShowTaskDialog(open);
    if (!open) {
      setTaskToEdit(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {currentView === "list" && currentListId
                ? lists.find((list) => list.id === currentListId)?.name ?? "List"
                : currentView === "label" && currentLabelId
                ? `Label · ${labels.find((label) => label.id === currentLabelId)?.name ?? "Label"}`
                : currentView === "next7days"
                ? "Next 7 Days"
                : currentView === "upcoming"
                ? "Upcoming"
                : currentView === "all"
                ? "All Tasks"
                : "Today"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Stay on top of your priorities with a modern daily planner.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="toggle-completed"
                checked={showCompletedTasks}
                onCheckedChange={toggleShowCompletedTasks}
              />
              <Label htmlFor="toggle-completed" className="text-sm">
                Show completed
              </Label>
            </div>

            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 size-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative md:w-96" role="search">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="size-4" aria-hidden="true" />
            </span>
            <Input
              aria-label="Search tasks"
              placeholder="Search tasks, descriptions, or labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <Card className="h-full" aria-live="polite">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {isLoading ? "Loading tasks..." : `${searchedTasks.length} task${searchedTasks.length !== 1 ? "s" : ""}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              {isLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <Loader2 className="size-6 animate-spin" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">Loading tasks, please wait...</p>
                  <span className="sr-only">Loading tasks</span>
                </div>
              ) : searchedTasks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <ListChecks className="size-8 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">No tasks found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `No tasks match "${searchQuery}"`
                        : showCompletedTasks
                        ? "Create a new task to get started"
                        : "Try showing completed tasks or create a new one"}
                    </p>
                  </div>
                  <Button onClick={handleCreateTask} size="sm">
                    <Plus className="mr-2 size-4" aria-hidden="true" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={showTaskDialog}
        onOpenChange={handleTaskDialogOpenChange}
        task={taskToEdit}
        defaultListId={currentListId ?? undefined}
      />
    </div>
  );
}
