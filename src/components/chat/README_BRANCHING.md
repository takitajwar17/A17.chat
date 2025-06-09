# Chat Branching Feature Documentation

## Overview

The Chat Branching feature allows users to create alternative conversation paths from any assistant response. This creates independent copies of the conversation up to that point, enabling exploration of different conversation directions without losing the original context.

## Key Concepts

### What is Chat Branching?
- **Independent Copy**: A branch creates a completely independent copy of messages up to a specific point
- **No Parent-Child Relationships**: Branches are standalone chats with minimal metadata linking
- **Branch from Assistant Messages**: Users can only branch from assistant responses
- **Preservation of Context**: All messages up to the branching point are copied to the new chat

### When to Use Branching
- Explore different conversation directions
- Test alternative questions or approaches
- Save important conversation states before diverging
- Compare different AI responses to similar prompts

## Implementation Details

### Database Schema Changes

#### Chat Interface Updates
```typescript
export interface Chat {
  id: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
  branchedFromChatId?: string; // Reference to original chat
}
```

#### New Types
```typescript
export interface BranchChatRequest {
  originalChatId: string;
  branchFromMessageIndex: number; // 0-based, inclusive
  newTitle?: string;
}

export interface BranchChatResponse {
  newChatId: string;
  branchedChat: Chat;
  messageCount: number;
}
```

### Core Components

#### 1. BranchButton Component
- **Location**: `src/components/chat/BranchButton.tsx`
- **Functionality**: Creates branch buttons that appear on hover over assistant messages
- **Features**:
  - Confirmation dialog before branching
  - Loading state during branch creation
  - Auto-navigation to new branch
  - Tooltip with context information

#### 2. BranchInfo Component
- **Location**: `src/components/chat/BranchInfo.tsx`
- **Functionality**: Shows branch information when viewing a branched chat
- **Features**:
  - Displays original chat reference
  - Shows other sibling branches
  - Navigation between related chats
  - Branch creation timestamp

#### 3. useChatBranching Hook
- **Location**: `src/hooks/useChatBranching.ts`
- **Functionality**: Manages branching operations and state
- **Features**:
  - Create branches with custom or auto-generated titles
  - Handle success/error callbacks
  - Navigation management
  - Loading state management

### API Endpoints

#### POST /api/chat/branch
- **Purpose**: Creates a new branched chat
- **Request Body**: `BranchChatRequest`
- **Response**: `BranchChatResponse`
- **Features**:
  - Validates input parameters
  - Creates new chat with branching metadata
  - Copies messages up to specified index
  - Comprehensive error handling and logging

### Database Methods

#### Core Branching Methods
```typescript
// Create a branch from an existing chat
async branchChat(
  originalChatId: string, 
  branchFromMessageIndex: number, 
  newTitle?: string
): Promise<{ newChat: Chat; messageCount: number }>

// Get all branches from a specific chat
async getBranchedChats(originalChatId: string): Promise<Chat[]>

// Get the original chat for a branched chat
async getOriginalChat(chatId: string): Promise<Chat | null>
```

## User Experience

### How Users Interact with Branching

1. **Discovering Branch Options**
   - Hover over any assistant message
   - Branch button appears in the message footer
   - Tooltip shows context information

2. **Creating a Branch**
   - Click the "Branch" button
   - Confirmation dialog appears
   - Click "Create Branch" to proceed
   - Automatic navigation to new branch

3. **Branch Indicators**
   - Branched chats show branch info at the top
   - Display original chat reference
   - Show other sibling branches
   - Quick navigation between related chats

### Visual Design

#### Branch Button
- **Icon**: Git-style fork icon
- **Colors**: Semantic color system (muted → foreground on hover)
- **States**: Normal, hover, loading, confirmation
- **Position**: Appears in message footer on hover

#### Branch Info Bar
- **Location**: Top of chat interface for branched chats
- **Content**: Original chat link, creation time, sibling branches
- **Styling**: Subdued background with semantic colors
- **Navigation**: Clickable elements for related chats

## Technical Implementation

### Message Index Calculation
- **Zero-based indexing**: Messages are indexed starting from 0
- **Inclusive copying**: The specified index message is included in the branch
- **Example**: Index 2 means copy messages 0, 1, and 2 (first 3 messages)

### State Management
- **Real-time updates**: Uses `useLiveQuery` for reactive database queries
- **Error handling**: Comprehensive error states and user feedback
- **Loading states**: Visual feedback during branch operations
- **Navigation**: Automatic routing to new branches

### Performance Considerations
- **Bulk operations**: Messages are copied using `bulkAdd` for efficiency
- **Minimal metadata**: Only essential branching information is stored
- **Lazy loading**: Branch relationships are loaded on demand
- **Memory efficiency**: No duplicate storage of message content

## Error Handling

### Validation Errors
- Missing or invalid chat ID
- Invalid message index (negative or out of bounds)
- Empty chat (no messages to branch from)

### Database Errors
- Chat not found
- Transaction failures
- Permission issues

### User Feedback
- **Success**: Automatic navigation with console logging
- **Errors**: User-friendly error messages
- **Loading**: Visual indicators during operations
- **Confirmation**: Dialog before destructive operations

## Logging and Debugging

### Console Logging
All branching operations include comprehensive logging:
- `[Branch]` prefix for hook operations
- `[BranchButton]` prefix for UI component actions
- `[DB]` prefix for database operations
- `[API]` prefix for API endpoint logging

### Performance Monitoring
- API operation timing
- Database query performance
- Navigation timing
- Error occurrence tracking

## Integration with Existing Features

### Chat Interface
- Seamless integration with existing message display
- Preserves all existing functionality
- Maintains responsive design
- Compatible with loading states

### Sidebar and Navigation
- Branched chats appear in chat list
- Proper sorting and organization
- Search functionality maintained
- Delete operations handle branches

### Model Selection
- Branch inherits model from original chat
- Model selection works normally in branches
- No special model handling required

## Future Enhancements

### Potential Improvements
1. **Branch visualization**: Tree view of related chats
2. **Bulk branch management**: Operations on multiple branches
3. **Branch comparison**: Side-by-side view of different paths
4. **Branch merging**: Combine insights from different branches
5. **Branch templates**: Pre-defined branching points
6. **Branch analytics**: Usage patterns and statistics

### Scalability Considerations
- **Large conversations**: Optimization for long chat histories
- **Many branches**: UI for managing numerous related chats
- **Storage optimization**: Deduplication of common message sequences
- **Performance**: Lazy loading and virtualization for branch lists

## Testing Guidelines

### Manual Testing Scenarios
1. Create branch from various message positions
2. Navigate between original and branched chats
3. Create multiple branches from same chat
4. Test error conditions (invalid inputs)
5. Verify UI responsiveness and loading states

### Edge Cases
- Very long messages
- Chats with only user messages
- Rapid branch creation
- Network interruptions during branching
- Storage quota limitations

## Conclusion

The Chat Branching feature provides a powerful way for users to explore alternative conversation paths while maintaining the simplicity and performance of the existing chat system. The implementation follows established architectural patterns and provides a robust, user-friendly experience for conversation management. 