# Quick Accessibility & UX Wins
**Priority:** Critical improvements that can be implemented quickly

## Overview

This document provides code examples for immediate accessibility improvements that can be implemented in 1-2 days. These changes will significantly improve the FocusFlow experience for users with disabilities and improve overall UX.

## 1. Add ARIA Labels to Icon Buttons ⚡

### app-sidebar.tsx
```tsx
// BEFORE:
<Button
  variant="ghost"
  size="icon"
  className="h-6 w-6"
  onClick={() => setShowCreateList(true)}
>
  <Plus className="size-3" />
</Button>

// AFTER:
<Button
  variant="ghost"
  size="icon"
  className="h-6 w-6"
  onClick={() => setShowCreateList(true)}
  aria-label="Create new list"
>
  <Plus className="size-3" aria-hidden="true" />
</Button>
```

Apply to:
- Create list button (line 90-97)
- Create label button (line 123-130)
- All other icon-only buttons

### create-list-dialog.tsx
```tsx
// Icon selection buttons (line 86-99)
<button
  key={emoji}
  type="button"
  onClick={() => setIcon(emoji)}
  className={`...`}
  aria-label={`Select ${emoji} icon`}
>
  <span aria-hidden="true">{emoji}</span>
</button>

// Color selection buttons (line 106-116)
<button
  key={c}
  type="button"
  onClick={() => setColor(c)}
  className={`...`}
  style={{ backgroundColor: c }}
  aria-label={`Select ${c} color`}
/>
```

### task-dialog.tsx
```tsx
// Subtask add button (line 378-380)
<Button 
  type="button" 
  size="icon" 
  onClick={addSubtask}
  aria-label="Add subtask"
>
  <Plus className="size-4" aria-hidden="true" />
</Button>

// Subtask remove buttons (line 390-398)
<Button
  type="button"
  variant="ghost"
  size="icon"
  className="size-6"
  onClick={() => removeSubtask(index)}
  aria-label={`Remove subtask: ${subtask}`}
>
  <X className="size-3" aria-hidden="true" />
</Button>
```

## 2. Fix Color-Only Information 🎨

### task-item.tsx
```tsx
// Priority flag with text alternative (line 94-96)
{task.priority !== "none" && (
  <div className="flex items-center gap-1">
    <Flag 
      className={cn("size-4 shrink-0", priorityColors[task.priority])}
      aria-hidden="true"
    />
    <span className="sr-only">
      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
    </span>
  </div>
)}

// Overdue badge with clear text (line 113-122)
{task.deadline && (
  <Badge
    variant={isOverdue ? "destructive" : "outline"}
    className="gap-1 text-xs"
    aria-label={isOverdue ? `Overdue: ${format(task.deadline, "MMM d, h:mm a")}` : undefined}
  >
    <Clock className="size-3" aria-hidden="true" />
    {format(task.deadline, "MMM d, h:mm a")}
    {isOverdue && " (Overdue)"}
  </Badge>
)}
```

### app-sidebar.tsx
```tsx
// List color dots (line 109-112)
<div
  className="size-2 rounded-full"
  style={{ backgroundColor: list.color }}
  role="presentation"
  aria-hidden="true"
/>

// Or better yet, add tooltip:
<Tooltip>
  <TooltipTrigger asChild>
    <div
      className="size-2 rounded-full"
      style={{ backgroundColor: list.color }}
      aria-label={`${list.name} color indicator`}
    />
  </TooltipTrigger>
  <TooltipContent>{list.name}</TooltipContent>
</Tooltip>
```

## 3. Add Skip Navigation Link 🔗

### app/page.tsx
```tsx
// Add at the very top, before everything
export default function Home() {
  return (
    <SidebarProvider>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="absolute left-0 top-0 z-50 -translate-y-full bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <AppSidebar />
        <main id="main-content" className="flex-1 overflow-hidden">
          <DashboardContent />
        </main>
      </div>
      <Toaster richColors position="bottom-right" closeButton />
    </SidebarProvider>
  );
}
```

## 4. Add Reduced Motion Support 🎬

### app/globals.css
```css
/* Add at the end of the file */

/* Respect user's reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Enhanced focus visibility */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### task-item.tsx
```tsx
// Add reduced motion check
import { motion, useReducedMotion } from "framer-motion";

export function TaskItem({ task, onClick }: TaskItemProps) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      // ... rest of component
    >
  );
}
```

## 5. Add ARIA Live Regions 📢

### Create a new file: components/aria-announcer.tsx
```tsx
"use client";

import { useEffect, useState } from "react";

let announceCallback: ((message: string, priority?: "polite" | "assertive") => void) | null = null;

export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  if (announceCallback) {
    announceCallback(message, priority);
  }
}

export function AriaAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  useEffect(() => {
    announceCallback = (message, priority = "polite") => {
      if (priority === "assertive") {
        setAssertiveMessage(message);
        setTimeout(() => setAssertiveMessage(""), 1000);
      } else {
        setPoliteMessage(message);
        setTimeout(() => setPoliteMessage(""), 1000);
      }
    };

    return () => {
      announceCallback = null;
    };
  }, []);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </>
  );
}

// Add sr-only class to globals.css if not present:
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### app/page.tsx
```tsx
import { AriaAnnouncer } from "@/components/aria-announcer";

export default function Home() {
  return (
    <SidebarProvider>
      {/* ... existing code ... */}
      <AriaAnnouncer />
      <Toaster richColors position="bottom-right" closeButton />
    </SidebarProvider>
  );
}
```

### task-item.tsx
```tsx
import { announce } from "@/components/aria-announcer";

const handleToggleComplete = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsCompleting(true);

  try {
    await updateTask.mutateAsync({
      id: task.id,
      completed: !task.completed,
    });

    const action = !task.completed ? "completed" : "marked incomplete";
    announce(`Task ${task.title} ${action}`);
    
    if (!task.completed) {
      toast.success("Task completed! 🎉");
    }
  } catch {
    announce("Failed to update task", "assertive");
    toast.error("Failed to update task");
  } finally {
    setTimeout(() => setIsCompleting(false), 300);
  }
};
```

## 6. Improve Loading States 📊

### dashboard-content.tsx
```tsx
// Better loading state (line 144-147)
{isLoading ? (
  <div className="flex h-full flex-col items-center justify-center gap-2">
    <Loader2 className="size-6 animate-spin" aria-hidden="true" />
    <span className="text-sm text-muted-foreground">Loading tasks...</span>
    <span className="sr-only">Loading tasks, please wait</span>
  </div>
) : // ... rest
}

// Better empty state (line 148-154)
{searchedTasks.length === 0 ? (
  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
    <div className="rounded-full bg-muted p-4">
      <ListIcon className="size-8 text-muted-foreground" aria-hidden="true" />
    </div>
    <div>
      <p className="text-lg font-medium">No tasks found</p>
      <p className="text-sm text-muted-foreground">
        {searchQuery 
          ? `No tasks match "${searchQuery}"`
          : showCompletedTasks
          ? "Create a new task to get started"
          : "Try showing completed tasks or create a new one"
        }
      </p>
    </div>
    <Button onClick={handleCreateTask} size="sm">
      <Plus className="mr-2 size-4" aria-hidden="true" />
      Create Task
    </Button>
  </div>
) : // ... rest
}
```

## 7. Add Keyboard Handlers to Task Cards ⌨️

### task-item.tsx
```tsx
// Make task cards keyboard accessible
return (
  <motion.div
    // ... existing props ...
    onClick={() => onClick(task)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(task);
      }
    }}
    tabIndex={0}
    role="button"
    aria-label={`Task: ${task.title}${task.completed ? ", completed" : ""}${isOverdue ? ", overdue" : ""}`}
    // ... rest of props
  >
```

## 8. Make Label Selection Keyboard Accessible 🏷️

### task-dialog.tsx
```tsx
// Labels section (line 340-361)
<div className="space-y-2">
  <Label>Labels</Label>
  <div 
    className="flex flex-wrap gap-2" 
    role="group" 
    aria-label="Select task labels"
  >
    {allLabels.map((label) => (
      <Badge
        key={label.id}
        variant={selectedLabelIds.includes(label.id) ? "default" : "outline"}
        className="cursor-pointer gap-1"
        style={{
          borderColor: label.color,
          ...(selectedLabelIds.includes(label.id) && {
            backgroundColor: label.color,
            color: "white",
          }),
        }}
        onClick={() => toggleLabel(label.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleLabel(label.id);
          }
        }}
        tabIndex={0}
        role="checkbox"
        aria-checked={selectedLabelIds.includes(label.id)}
        aria-label={`${label.name} label`}
      >
        <span aria-hidden="true">{label.icon}</span>
        {label.name}
      </Badge>
    ))}
  </div>
</div>
```

## 9. Improve Search UX 🔍

### dashboard-content.tsx
```tsx
// Enhanced search input (line 127-134)
<div className="relative">
  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
    <Search className="size-4 text-muted-foreground" aria-hidden="true" />
  </div>
  <Input
    placeholder="Search tasks, descriptions, or labels..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-9 pr-9 md:w-96"
    aria-label="Search tasks"
  />
  {searchQuery && (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
      onClick={() => setSearchQuery("")}
      aria-label="Clear search"
    >
      <X className="size-4" aria-hidden="true" />
    </Button>
  )}
</div>
```

## 10. Add Form Field Validation ✅

### task-dialog.tsx
```tsx
// Add state for errors
const [errors, setErrors] = useState<Record<string, string>>({});

// Validation function
const validate = () => {
  const newErrors: Record<string, string> = {};
  
  if (!title.trim()) {
    newErrors.title = "Task title is required";
  }
  
  if (!listId) {
    newErrors.listId = "Please select a list";
  }
  
  if (deadline && scheduleDate && deadline < scheduleDate) {
    newErrors.deadline = "Deadline must be after schedule date";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Update submit handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) {
    return;
  }
  
  // ... rest of submit logic
};

// Update title field
<div className="space-y-2">
  <Label htmlFor="title">
    Title
    <span className="text-destructive" aria-label="required">*</span>
  </Label>
  <Input
    id="title"
    value={title}
    onChange={(e) => {
      setTitle(e.target.value);
      if (errors.title) {
        setErrors({ ...errors, title: "" });
      }
    }}
    placeholder="e.g. Review project proposal"
    autoFocus
    aria-invalid={!!errors.title}
    aria-describedby={errors.title ? "title-error" : undefined}
  />
  {errors.title && (
    <p id="title-error" className="text-sm text-destructive" role="alert">
      {errors.title}
    </p>
  )}
</div>
```

## Implementation Checklist

- [ ] 1. Add aria-label to all icon-only buttons (30 min)
- [ ] 2. Add aria-hidden to decorative icons (20 min)
- [ ] 3. Fix color-only information with text alternatives (45 min)
- [ ] 4. Add skip navigation link (10 min)
- [ ] 5. Add reduced motion support (30 min)
- [ ] 6. Create ARIA live region system (1 hour)
- [ ] 7. Improve loading and empty states (45 min)
- [ ] 8. Add keyboard handlers to interactive elements (1 hour)
- [ ] 9. Make label selection keyboard accessible (30 min)
- [ ] 10. Enhance search UX with clear button (30 min)
- [ ] 11. Add form field validation (1.5 hours)

**Total estimated time: 7-8 hours**

## Testing After Implementation

1. **Keyboard Testing**
   - Tab through entire interface
   - Verify all interactive elements are reachable
   - Test keyboard shortcuts
   - Ensure no keyboard traps

2. **Screen Reader Testing**
   - Test with NVDA (Windows)
   - Test with JAWS (Windows)
   - Test with VoiceOver (Mac)
   - Verify announcements work

3. **Visual Testing**
   - Test with browser zoom at 200%
   - Test in high contrast mode
   - Test with reduced motion enabled
   - Verify focus indicators are visible

4. **Automated Testing**
   - Run Lighthouse accessibility audit (target: 90+)
   - Run axe DevTools
   - Check WAVE browser extension

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Inclusive Components](https://inclusive-components.design/)
