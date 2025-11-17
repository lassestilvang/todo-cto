import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { List, CreateListInput, UpdateListInput } from "@/lib/types";

export function useLists() {
  return useQuery<List[]>({
    queryKey: ["lists"],
    queryFn: async () => {
      const response = await fetch("/api/lists");
      if (!response.ok) throw new Error("Failed to fetch lists");
      return response.json();
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateListInput) => {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to create list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateListInput) => {
      const response = await fetch(`/api/lists/${input.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to update list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listId: string) => {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
