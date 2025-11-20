# FocusFlow • Daily Planner

A modern, professional Next.js daily task planner for managing lists, tasks, and schedules with ease.

## Features

### Core Features

- **Lists Management**
  - Default "Inbox" list
  - Create custom lists with colors and emoji icons
  - Organize tasks across multiple lists

- **Comprehensive Task Management**
  - Full-featured tasks with:
    - Title, description, schedule date, deadline
    - Priority levels (High, Medium, Low, None)
    - Time tracking (estimated and actual time)
    - Subtasks and checklists
    - Labels with icons
    - Reminders
    - File attachments (local development)
    - Recurring tasks support
    - Complete change log history

- **Smart Views**
  - **Today**: Tasks scheduled for today
  - **Next 7 Days**: Tasks in the coming week
  - **Upcoming**: All future scheduled tasks
  - **All**: Complete task overview
  - **Analytics**: Productivity insights dashboard
  - **Focus Mode**: Distraction-free deep work view
  - Toggle completed tasks visibility

- **Advanced Search**
  - Fast fuzzy search powered by Fuse.js
  - Search across titles, descriptions, labels, and list names
  - Real-time filtering

- **Task Change Logging**
  - Every task modification is tracked
  - View complete history in task details

### Flow & Productivity Enhancements

- **Productivity Analytics Dashboard** with completion trends, streaks, focus time, and estimation accuracy
- **Integrated Pomodoro Timer** that updates task time tracking and sends desktop alerts
- **Focus Mode** surface one task at a time with keyboard navigation and Pomodoro controls
- **Natural Language Quick Add** (Ctrl+Q) understands phrases like "call mom tomorrow at 5pm #family urgent"
- **Global Keyboard Shortcuts** for quick capture, search, focus mode, Pomodoro, and more

### UI/UX Features

- **Modern Design**
  - Clean, minimalistic interface
  - Vibrant colors for categories
  - Professional shadcn/ui components
  - Smooth animations with Framer Motion

- **Theme Support**
  - Light and dark mode
  - System preference detection
  - Seamless transitions

- **Responsive Layout**
  - Split view: Sidebar + Main panel
  - Works beautifully on desktop and mobile
  - Collapsible sidebar

- **Visual Feedback**
  - Loading states
  - Error handling
  - Success notifications
  - Overdue task highlights

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: SQLite (better-sqlite3 + Drizzle ORM)
- **ORM**: Drizzle ORM
- **Data Fetching**: TanStack Query (React Query)
- **Search**: Fuse.js
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Zod
- **Testing**: Bun Test + @testing-library/react
- **Runtime**: Bun

## Getting Started

### Prerequisites

- Bun v1.0.0 or higher
- Node.js 18.17 or higher (for Next.js compatibility)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
bun install
```

3. Run database migrations:
```bash
bun run lib/db/migrate.ts
```

4. Start the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
bun run build
bun run start
```

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── tasks/        # Task CRUD operations
│   │   ├── lists/        # List management
│   │   └── labels/       # Label management
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── app-sidebar.tsx   # Navigation sidebar
│   ├── dashboard-content.tsx  # Main content area
│   ├── task-item.tsx     # Task list item
│   ├── task-dialog.tsx   # Create/edit task modal
│   ├── task-detail-sheet.tsx  # Task details side panel
│   ├── analytics-dashboard.tsx # Productivity analytics
│   ├── pomodoro-timer.tsx     # Integrated Pomodoro timer
│   ├── focus-mode.tsx         # Distraction-free task view
│   ├── quick-add-task.tsx     # Natural language quick add
│   ├── create-list-dialog.tsx
│   ├── create-label-dialog.tsx
│   └── providers.tsx     # App providers
├── lib/
│   ├── db/
│   │   ├── schema.ts     # Database schema (13 tables)
│   │   ├── index.ts      # Database client
│   │   ├── migrate.ts    # Migration runner
│   │   └── utils.ts      # Database utilities
│   ├── hooks/
│   │   ├── useTasks.ts   # Task data hooks
│   │   ├── useLists.ts   # List data hooks
│   │   ├── useLabels.ts  # Label data hooks
│   │   ├── useSearch.ts  # Search functionality
│   │   └── useKeyboardShortcuts.ts # Keyboard shortcuts system
│   ├── stores/
│   │   └── useAppStore.ts # Global app state
│   ├── nlp-parser.ts     # Natural language task parser
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── data/
│   └── planner.db        # SQLite database (git-ignored)
└── __tests__/            # Test files
```

## Keyboard Shortcuts

- **Ctrl+Q** - Quick add task (natural language)
- **Ctrl+N** - New task (detailed form)
- **Ctrl+Shift+P** - Start Pomodoro timer
- **Ctrl+Shift+F** - Enter Focus Mode
- **Ctrl+/** - Search tasks
- **Shift+?** - Show keyboard shortcuts help
- **Space** - Toggle task completion (in Focus Mode)
- **Arrow Keys** - Navigate tasks (in Focus Mode)
- **D** - Toggle details (in Focus Mode)
- **Esc** - Exit dialogs/Focus Mode

## Testing

Run tests:
```bash
bun test
```

Run tests in watch mode:
```bash
bun test --watch
```

## Database Schema

### Core Tables

- **lists**: Custom task lists
- **labels**: Task labels/tags
- **tasks**: Main task table with all task properties
- **task_labels**: Many-to-many relationship between tasks and labels
- **subtasks**: Task sub-items/checklist
- **reminders**: Task reminder times
- **attachments**: File attachments for tasks
- **change_logs**: Complete audit trail of task modifications

### Productivity Tables

- **focus_sessions**: Pomodoro timer sessions with task links
- **task_templates**: Reusable task structures (for future UI)
- **habit_streaks**: Recurring task completion tracking (for future UI)
- **time_blocks**: Calendar time blocking (for future UI)
- **keyboard_shortcuts**: User-customizable shortcuts (for future UI)

## Development Notes

### Adding New Features

1. Define types in `lib/types.ts`
2. Update database schema in `lib/db/schema.ts`
3. Generate and run migrations
4. Create API routes in `app/api/`
5. Create React Query hooks in `lib/hooks/`
6. Build UI components
7. Write tests

### Code Style

- Use TypeScript strict mode
- Follow existing component patterns
- Use shadcn/ui for consistent UI components
- Prefer server components where possible
- Use React Query for data fetching
- Zustand for client-side state only

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
