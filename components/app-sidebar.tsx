"use client";

import { Calendar, CalendarDays, Clock, Inbox, List as ListIcon, Plus, Tag } from "lucide-react";
import { useLists } from "@/lib/hooks/useLists";
import { useLabels } from "@/lib/hooks/useLabels";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateListDialog } from "./create-list-dialog";
import { CreateLabelDialog } from "./create-label-dialog";
import { cn } from "@/lib/utils";

const viewItems = [
  { id: "today", icon: Calendar, label: "Today" },
  { id: "next7days", icon: CalendarDays, label: "Next 7 Days" },
  { id: "upcoming", icon: Clock, label: "Upcoming" },
  { id: "all", icon: ListIcon, label: "All" },
];

export function AppSidebar() {
  const { data: lists = [] } = useLists();
  const { data: labels = [] } = useLabels();
  const { currentView, currentListId, setCurrentView, setCurrentListId } = useAppStore();
  const [showCreateList, setShowCreateList] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);

  const handleViewClick = (viewId: string) => {
    setCurrentView(viewId as any);
  };

  const handleListClick = (listId: string) => {
    setCurrentListId(listId);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-3">
          <h1 className="text-xl font-bold">FocusFlow</h1>
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
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
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
              >
                <Plus className="size-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {lists.map((list) => (
                  <SidebarMenuItem key={list.id}>
                    <SidebarMenuButton
                      onClick={() => handleListClick(list.id)}
                      isActive={currentListId === list.id}
                    >
                      <span className="text-lg">{list.icon}</span>
                      <span className="flex-1">{list.name}</span>
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: list.color }}
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
              >
                <Plus className="size-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels.map((label) => (
                  <SidebarMenuItem key={label.id}>
                    <SidebarMenuButton>
                      <span className="text-lg">{label.icon}</span>
                      <span className="flex-1">{label.name}</span>
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: label.color }}
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
