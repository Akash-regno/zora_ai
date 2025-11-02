# Canvas Management Rules

## Overview
The canvas system is designed to be intuitive and reliable, with proper state management and database synchronization.

## Core Rules

### 1. Initial State (No Canvases)
- **When**: User first signs in or has deleted all canvases
- **Behavior**: 
  - Shows "What's on your mind today?" prompt screen
  - No canvas is selected (`currentCanvasId = null`)
  - Sidebar shows "No canvases yet"

### 2. Creating First Canvas
- **Trigger**: User types and sends first message
- **Behavior**:
  - Creates new canvas in Supabase with the conversation
  - Canvas appears in sidebar as "Canvas 1" with node count
  - Canvas is automatically selected and displayed
  - User sees their conversation immediately

### 3. New Canvas Button
- **Trigger**: User clicks "New canvas" button in sidebar
- **Behavior**:
  - Immediately creates empty canvas in Supabase
  - Canvas appears in sidebar as "Canvas N" (where N = total + 1)
  - Canvas is selected and becomes current
  - Shows "What's on your mind today?" prompt screen
  - User can create first conversation in this new canvas

### 4. Selecting Canvas
- **Trigger**: User clicks on a canvas in sidebar
- **Behavior**:
  - Switches to selected canvas
  - Displays all nodes and edges from that canvas
  - Sidebar highlights the selected canvas

### 5. Deleting Canvas
- **Trigger**: User clicks delete button on canvas in sidebar
- **Behavior**:
  - Deletes canvas from Supabase
  - Removes canvas from sidebar
  - If deleted canvas was current:
    - Switches to first remaining canvas (if any exist)
    - Shows prompt screen if no canvases remain
  - Cannot delete if it's the last canvas (optional protection)

### 6. Updating Canvas
- **Trigger**: User creates/modifies nodes or edges
- **Behavior**:
  - Updates local state immediately (optimistic update)
  - Saves to Supabase in background
  - Updates node count in sidebar
  - No loading states or delays for user

### 7. Canvas Persistence
- **On Page Refresh**: 
  - Loads all canvases from Supabase
  - Selects most recent canvas (first in list)
  - Restores full state including nodes and edges

### 8. Error Handling
- **Database Errors**: Shows alert with error message
- **Network Errors**: Logs to console, shows user-friendly message
- **Missing Table**: Provides instructions to run migration

## Technical Implementation

### State Management
- `canvases`: Array of all user's canvases
- `currentCanvasId`: ID of currently selected canvas (null if none)
- `loading`: Loading state for initial data fetch
- `authLoading`: Loading state for authentication

### Database Operations
- **Create**: `INSERT` new canvas with empty nodes/edges
- **Read**: `SELECT` all canvases on mount, ordered by created_at
- **Update**: `UPDATE` nodes/edges when canvas changes
- **Delete**: `DELETE` canvas by ID

### Synchronization
- Local state updates immediately for responsiveness
- Database saves happen asynchronously
- No blocking operations for user interactions

## User Experience Goals

1. **Fast**: No waiting for database operations
2. **Reliable**: All changes are saved to database
3. **Intuitive**: Clear visual feedback for all actions
4. **Forgiving**: Can't accidentally lose work
5. **Consistent**: Same behavior across all scenarios

## Edge Cases Handled

- ✅ No canvases exist
- ✅ All canvases deleted
- ✅ Deleting current canvas
- ✅ Network errors during save
- ✅ Multiple rapid canvas creations
- ✅ Switching canvases while editing
- ✅ Page refresh during edit
