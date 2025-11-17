import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/types";

export function useTasks(params?: {
  view?: string;
  listId?: string;
  includeCompleted?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.view) query.set("view", params.view);
  if (params?.listId) query.set("listId", params.listId);
  if (params?.includeCompleted) query.set("includeCompleted", "true");

  return useQuery<Task[]>({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?${query.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
  });
}

export function useTask(taskId: string) {
  return useQuery<Task>({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch task");
      return response.json();
    },
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const response = await fetch(`/api/tasks/${input.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
