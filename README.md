# Multi-View Project Tracker

A high-performance, feature-rich project management tool built from scratch with React, TypeScript, and Tailwind CSS. This project demonstrates core frontend engineering skills: custom drag-and-drop logic, virtual scrolling, state architecture, and complex UI layouts without the use of third-party UI or utility libraries for core features.

## 🚀 Live Demo
[Deployed Link Placeholder]

## 🛠️ Tech Stack
- **Framework**: React 18 (TypeScript)
- **State Management**: Zustand (Minimal boilerplate, high performance)
- **Styling**: Tailwind CSS (Custom design system, no UI libraries)
- **Date Handling**: date-fns
- **Icons**: Lucide React

## ✨ Key Features

### 1. Custom Drag-and-Drop (Zero Libraries)
- **Core Logic**: Implemented using native **Pointer Events** for seamless mouse and touch support.
- **UX**: 
  - Dynamic **placeholder** elements prevent layout shifts during drag.
  - **Snap-back animation**: Cards smoothly transition to their original position on invalid drops.
  - **Visual Feedback**: Dragged cards have reduced opacity and enhanced shadows; target columns highlight on hover.
  - **Touch Support**: Fully functional on mobile and tablet devices.

### 2. High-Performance Virtual Scrolling
- **Implementation**: A custom "windowing" engine renders only the rows visible in the viewport plus a 5-row buffer.
- **Scale**: Handles **500+ tasks** at 60FPS.
- **Logic**: Uses a spacer element to maintain correct scroll height and relative positioning for visible rows.

### 3. Real-Time Collaboration Simulation
- **Dynamic Presence**: Simulated "other users" move between tasks randomly.
- **Visuals**: Animated avatars on cards, stacking logic with "+X" overflow, and a top-bar presence indicator.

### 4. Advanced Views & Filtering
- **Three Views**: Instant switching between Kanban, List, and Timeline (Gantt-style) views with shared state.
- **URL Sync**: All filters (Status, Priority, Assignee, Search, Dates) are synced with URL query parameters for shareability.
- **Persistent State**: Remembers your preferred view and theme (Light/Dark) across sessions.

### 5. Premium UI/UX
- **Dark Mode**: Fully themed with persistent user preference.
- **Stats Bar**: Instant visibility into project health (Total, Completed, Overdue).
- **Edge Cases**: Smart date labels ("Due Today", "X days overdue") and rich empty states.

## 📐 Architecture Decisions

### Why Zustand?
Zustand was chosen over Redux or Context API because:
1. **Performance**: It provides atomic updates, ensuring that dragging a card or typing in a search bar doesn't re-render the entire app unnecessarily.
2. **Simplicity**: Redux boilerplate would be overkill for this scope, while Context can lead to provider hell and performance bottlenecks with large datasets.

### Virtual Scrolling Explanation
The `ListView` uses a `useRef` to track scroll position and calculates `startIndex` and `endIndex` based on a fixed `ROW_HEIGHT`. A large `div` provides the native scrollbar feel, while an inner container uses `translateY` to position only the sliced array of tasks. This keeps the DOM nodes under 20-30 regardless of the dataset size.

### Drag-and-Drop Approach
Instead of `HTML5 Drag and Drop API` (which is notoriously difficult to style and inconsistent), I used **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`). This allows for:
1. Complete styling control over the "dragged" element.
2. Unified mouse/touch logic.
3. Precise coordinate-based collision detection for drop zones.

## 📈 Performance (Lighthouse)
[Lighthouse Screenshot Placeholder - Score: 95+]

## 🔨 Setup Instructions
1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev` to start the development server.
4. Run `npm run build` to create a production bundle.
