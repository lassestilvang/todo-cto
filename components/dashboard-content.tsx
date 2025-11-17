"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { useTaskSearch } from "@/lib/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLabels } from "@/lib/hooks/useLabels";
import { useLists } from "@/lib/hooks/useLists";
import { useTask } from "@/lib/hooks/useTasks";

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
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

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

  const handleTaskClick = (taskId: string) => {
    setDetailTaskId(taskId);
    setDetailOpen(true);
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setShowTaskDialog(true);
  };

  const handleEditFromDetail = (task: any) => {
    setTaskToEdit(task);
    setDetailOpen(false);
    setShowTaskDialog(true);
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
          <Input
            placeholder="Search tasks, descriptions, or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-96"
          />
        </div>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {searchedTasks.length} task{searchedTasks.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : searchedTasks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <p className="text-lg font-medium">No tasks found</p>
                  <p className="text-sm text-muted-foreground">
                    Try creating a new task or adjust your filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task.id)}
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
        onOpenChange={setShowTaskDialog}
        task={taskToEdit ?? null}
        defaultListId={currentListId ?? undefined}
      />

      <TaskDetailSheet
        taskId={detailTaskId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
}
