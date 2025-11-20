"use client";

import { Calendar, CalendarDays, Clock, List as ListIcon, Plus, AlertCircle, BarChart3, Crosshair } from "lucide-react";
import { useLists } from "@/lib/hooks/useLists";
import { useLabels } from "@/lib/hooks/useLabels";
import { useOverdueTasksCount } from "@/lib/hooks/useOverdueTasks";
import { useAppStore } from "@/lib/stores/useAppStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CreateListDialog } from "./create-list-dialog";
import { CreateLabelDialog } from "./create-label-dialog";

const viewItems = [
  { id: "today", icon: Calendar, label: "Today" },
  { id: "next7days", icon: CalendarDays, label: "Next 7 Days" },
  { id: "upcoming", icon: Clock, label: "Upcoming" },
  { id: "all", icon: ListIcon, label: "All" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "focus", icon: Crosshair, label: "Focus Mode" },
];

export function AppSidebar() {
  const { data: lists = [] } = useLists();
  const { data: labels = [] } = useLabels();
  const overdueCount = useOverdueTasksCount();
  const {
    currentView,
    currentListId,
    currentLabelId,
    setCurrentView,
    setCurrentListId,
    setCurrentLabelId,
  } = useAppStore();
  const [showCreateList, setShowCreateList] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);

  const handleViewClick = (viewId: string) => {
    setCurrentView(viewId as any);
  };

  const handleListClick = (listId: string) => {
    setCurrentListId(listId);
  };

  const handleLabelClick = (labelId: string) => {
    setCurrentLabelId(labelId);
  };

  return (
    <>
      <Sidebar role="navigation" aria-label="Main navigation">
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">FocusFlow</h1>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="gap-1" aria-label={`${overdueCount} overdue task${overdueCount !== 1 ? 's' : ''}`}>
                <AlertCircle className="size-3" aria-hidden="true" />
                <span>{overdueCount}</span>
              </Badge>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Views</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {viewItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleViewClick(item.id)}
                      isActive={currentView === item.id}
                      aria-label={`${item.label} view`}
                      aria-current={currentView === item.id ? "page" : undefined}
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.id === "today" && overdueCount > 0 && (
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground"
                          aria-label={`${overdueCount} overdue task${overdueCount !== 1 ? "s" : ""}`}
                        >
                          {overdueCount}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Lists</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreateList(true)}
                aria-label="Create new list"
              >
                <Plus className="size-3" aria-hidden="true" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {lists.map((list) => (
                  <SidebarMenuItem key={list.id}>
                    <SidebarMenuButton
                      onClick={() => handleListClick(list.id)}
                      isActive={currentListId === list.id}
                      aria-label={`${list.name} list`}
                      aria-current={currentListId === list.id ? "page" : undefined}
                    >
                      <span className="text-lg" aria-hidden="true">{list.icon}</span>
                      <span className="flex-1">{list.name}</span>
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: list.color }}
                        role="presentation"
                        aria-hidden="true"
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Labels</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreateLabel(true)}
                aria-label="Create new label"
              >
                <Plus className="size-3" aria-hidden="true" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels.map((label) => (
                  <SidebarMenuItem key={label.id}>
                    <SidebarMenuButton
                      onClick={() => handleLabelClick(label.id)}
                      isActive={currentLabelId === label.id}
                      aria-label={`${label.name} label`}
                      aria-current={currentLabelId === label.id ? "page" : undefined}
                    >
                      <span className="text-lg" aria-hidden="true">{label.icon}</span>
                      <span className="flex-1">{label.name}</span>
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                        role="presentation"
                        aria-hidden="true"
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateListDialog open={showCreateList} onOpenChange={setShowCreateList} />
      <CreateLabelDialog open={showCreateLabel} onOpenChange={setShowCreateLabel} />
    </>
  );
}
