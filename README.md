# Task Manager

A comprehensive task management web application built with Next.js 14+, React, and TypeScript. This application allows users to create, edit, delete, and manage tasks with advanced features like subtasks, Kanban board, filtering, sorting, and pagination.

## Features

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks
- **Task Fields**: Title, description, priority (low, medium, high), due date
- **Task Status**: Track tasks with status (To Do, In Progress, Done)
- **Task Completion**: Mark tasks as completed/incomplete

### Advanced Features
- **Subtasks**: Create and manage subtasks for each task with progress tracking
- **Kanban Board**: Visualize tasks in a Kanban-style board with drag-and-drop functionality
- **Filtering**: Filter tasks by status (all, completed, incomplete) and priority (all, low, medium, high)
- **Sorting**: Sort tasks by creation date, due date, or priority (ascending/descending)
- **Pagination**: Display 10 tasks per page with navigation controls
- **Dark Theme**: Toggle between light and dark themes with persistent preference
- **Responsive Design**: Fully responsive layout optimized for mobile devices

### Technical Features
- **State Management**: Global state management using React Context API
- **Performance Optimizations**: 
  - React.memo for component memoization
  - React.lazy for code splitting
  - useMemo and useCallback for expensive operations
- **Form Validation**: Client-side validation with error messages
- **Mock API**: Next.js API routes with in-memory data store (Vercel-ready)
- **TypeScript**: Full type safety throughout the application
- **CSS Modules**: Component-scoped styling

## Project Structure

```
task_manager/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (task list/Kanban)
│   ├── create/                  # Create task page
│   │   └── page.tsx
│   └── task/[id]/               # Task details page
│       └── page.tsx
├── components/                   # React components
│   ├── TaskCard/                # Individual task card
│   ├── TaskList/                # Task list component
│   ├── TaskForm/                # Task creation/editing form
│   ├── TaskDetails/             # Task details view
│   ├── SubtaskList/             # Subtasks management
│   ├── KanbanBoard/             # Kanban board with drag-and-drop
│   ├── FilterBar/               # Filtering controls
│   ├── SortBar/                 # Sorting controls
│   ├── Pagination/              # Pagination component
│   └── ThemeToggle/             # Dark/light theme switcher
├── context/                      # Context providers
│   ├── TaskContext.tsx          # Task state management
│   └── ThemeContext.tsx         # Theme state management
├── hooks/                        # Custom React hooks
│   ├── useFilterAndSort.ts      # Filtering and sorting logic
│   └── usePagination.ts         # Pagination logic
├── app/
│   └── api/                      # Next.js API routes
│       ├── tasks/                # Task API endpoints
│       └── subtasks/             # Subtask API endpoints
├── lib/                          # Utilities and API
│   ├── api.ts                    # API client for Next.js routes
│   └── data.ts                   # In-memory data store
├── types/                        # TypeScript types
│   └── task.ts                   # Task and related interfaces
├── utils/                        # Utility functions
│   ├── validation.ts             # Form validation
│   └── dateUtils.ts              # Date formatting utilities
├── styles/                       # Global styles
│   └── globals.css               # Global CSS and theme variables
├── db.json                       # Initial data (for reference)
└── package.json                  # Dependencies and scripts
```

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Basic knowledge of React and Next.js

## Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd task_manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

   The API routes are automatically available at `/api/tasks` and `/api/subtasks`. No separate server is needed!

## Usage

### Creating a Task
1. Click the "+ New Task" button in the header
2. Fill in all required fields:
   - Title (minimum 3 characters)
   - Description
   - Priority (Low, Medium, High)
   - Due Date (cannot be in the past)
3. Click "Create Task"

### Managing Tasks
- **View Tasks**: Tasks are displayed on the home page in either List or Kanban view
- **Edit Task**: Click the edit icon (✏️) on a task card or navigate to the task details page
- **Delete Task**: Click the delete icon (🗑️) and confirm the deletion
- **Mark Complete**: Check the checkbox on a task card to toggle completion status

### Subtasks
1. Navigate to a task's details page
2. In the Subtasks section, enter a subtask title and click "Add"
3. Toggle subtask completion by checking the checkbox
4. Delete subtasks using the delete button

### Kanban Board
1. Switch to Kanban view using the toggle buttons
2. Drag and drop tasks between columns (To Do, In Progress, Done)
3. Task status automatically updates when moved between columns

### Filtering and Sorting
- **Filter by Status**: Use the status filter buttons (All, Completed, Incomplete)
- **Filter by Priority**: Use the priority filter buttons (All, Low, Medium, High)
- **Sort Tasks**: Select a sort field (Creation Date, Due Date, Priority) and order (Ascending/Descending)
- **Clear Filters**: Click "Clear Filters" to reset all filters

### Pagination
- Navigate between pages using Previous/Next buttons
- Click page numbers to jump to specific pages
- 10 tasks are displayed per page

### Theme Toggle
- Click the theme toggle button in the header to switch between light and dark themes
- Theme preference is saved in localStorage

## API Endpoints

The application uses Next.js API routes to provide a REST API. The following endpoints are available:

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get a single task
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Subtasks
- `GET /subtasks?taskId=:id` - Get subtasks for a task
- `POST /subtasks` - Create a new subtask
- `PUT /subtasks/:id` - Update a subtask
- `DELETE /subtasks/:id` - Delete a subtask

## Data Model

### Task
```typescript
interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string // ISO date string
  status: 'todo' | 'in-progress' | 'done'
  completed: boolean
  createdAt: string // ISO date string
  subtasks: Subtask[]
}
```

### Subtask
```typescript
interface Subtask {
  id: string
  title: string
  completed: boolean
  taskId: string
}
```

## Technologies Used

- **Next.js 14+**: React framework with App Router and API routes
- **React 18+**: UI library
- **TypeScript**: Type safety
- **@dnd-kit/core**: Drag and drop functionality
- **CSS Modules**: Component-scoped styling

## Performance Optimizations

- **React.memo**: Applied to TaskCard, FilterBar, SortBar, Pagination, and KanbanColumn components
- **React.lazy**: Lazy loading for TaskDetails, TaskForm, and KanbanBoard components
- **useMemo**: Memoized filtered and sorted task lists
- **useCallback**: Memoized event handlers in Context providers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start Next.js development server (includes API routes)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting (if configured)
- CSS Modules for styling

## Deployment

This application is ready to deploy on Vercel without any additional configuration:

1. **Push your code to GitHub**
2. **Import the repository in Vercel**
3. **Deploy** - Vercel will automatically detect Next.js and deploy

The API routes work seamlessly on Vercel's serverless infrastructure. The in-memory data store will reset on each serverless function invocation, so for production use, consider integrating with a database (MongoDB, PostgreSQL, etc.).

### Environment Variables

No environment variables are required for basic functionality. The API routes use relative paths that work automatically on Vercel.

## Future Enhancements

Potential features for future versions:
- User authentication
- Task categories/tags
- Task search functionality
- Task attachments
- Task comments
- Email notifications
- Calendar view
- Task templates
- Export/import functionality

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

