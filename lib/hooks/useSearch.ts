import { useMemo } from "react";
import Fuse from "fuse.js";
import { Task } from "@/lib/types";

export function useTaskSearch(tasks: Task[], query: string) {
  const fuse = useMemo(
    () =>
      new Fuse(tasks, {
        keys: [
          { name: "title", weight: 2 },
          { name: "description", weight: 1 },
          { name: "list.name", weight: 0.5 },
          { name: "labels.name", weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [tasks]
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return tasks;
    }
    const searchResults = fuse.search(query);
    return searchResults.map((result) => result.item);
  }, [fuse, query, tasks]);

  return results;
}
