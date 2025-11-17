import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label, CreateLabelInput, UpdateLabelInput } from "@/lib/types";

export function useLabels() {
  return useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: async () => {
      const response = await fetch("/api/labels");
      if (!response.ok) throw new Error("Failed to fetch labels");
      return response.json();
    },
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLabelInput) => {
      const response = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to create label");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateLabelInput) => {
      const response = await fetch(`/api/labels/${input.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to update label");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (labelId: string) => {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete label");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
