import { describe, expect, test } from "bun:test";
import { useTaskSearch } from "@/lib/hooks/useSearch";
import { renderHook } from "@testing-library/react";
import { Task } from "@/lib/types";

describe("useTaskSearch", () => {
  const tasks: Task[] = [
    {
      id: "1",
      listId: "list1",
      title: "Prepare presentation",
      description: "Create slides for the client meeting",
      scheduleDate: new Date(),
      deadline: null,
      estimatedMinutes: 60,
      actualMinutes: null,
      priority: "high",
      recurrence: null,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      labels: [
        {
          id: "label1",
          name: "Work",
          color: "#3b82f6",
          icon: "💼",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      subtasks: [],
      reminders: [],
      attachments: [],
      changeLogs: [],
      list: {
        id: "list1",
        name: "Inbox",
        color: "#3b82f6",
        icon: "📥",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      id: "2",
      listId: "list2",
      title: "Grocery shopping",
      description: "Buy ingredients for dinner",
      scheduleDate: new Date(),
      deadline: null,
      estimatedMinutes: 30,
      actualMinutes: null,
      priority: "medium",
      recurrence: null,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      labels: [
        {
          id: "label2",
          name: "Personal",
          color: "#10b981",
          icon: "🏠",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      subtasks: [],
      reminders: [],
      attachments: [],
      changeLogs: [],
      list: {
        id: "list2",
        name: "Home",
        color: "#10b981",
        icon: "🏠",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ];

  test("returns all tasks when query is empty", () => {
    const { result } = renderHook(() => useTaskSearch(tasks, ""));
    expect(result.current).toHaveLength(2);
  });

  test("filters tasks by title", () => {
    const { result } = renderHook(() => useTaskSearch(tasks, "presentation"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe("Prepare presentation");
  });

  test("filters tasks by label name", () => {
    const { result } = renderHook(() => useTaskSearch(tasks, "Personal"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe("Grocery shopping");
  });
});
