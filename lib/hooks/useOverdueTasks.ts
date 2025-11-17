import { useMemo } from "react";
import { useTasks } from "./useTasks";
import { isPast } from "date-fns";

export function useOverdueTasksCount() {
  const { data: tasks = [] } = useTasks({ includeCompleted: false });

  const overdueCount = useMemo(() => {
    return tasks.filter(
      (task) => task.deadline && !task.completed && isPast(task.deadline)
    ).length;
  }, [tasks]);

  return overdueCount;
}
