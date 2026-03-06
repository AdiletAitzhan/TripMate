# Chat Feature Implementation

This document describes the real-time chat feature implementation for TripMate frontend.

## Overview

The chat system provides real-time messaging using WebSocket connections with fallback REST API support. Users can communicate in chat groups associated with trip vacancies.

## Architecture

### Files Created

#### Types

- **`src/types/chat.ts`** - TypeScript definitions for chat-related data structures
  - ChatGroup, ChatMember, ChatMessage
  - WebSocket message types (incoming/outgoing)
  - API request/response types

#### API Layer

- **`src/api/chatApi.ts`** - REST API client for chat operations
  - Get chat groups
  - Get chat members
  - Get message history
  - Send messages (REST fallback)
  - Delete messages
  - Get active users
  - WebSocket URL generation

#### Hooks

- **`src/hooks/useChatWebSocket.ts`** - Custom React hook for WebSocket chat
  - Real-time message delivery
  - Typing indicators
  - User presence tracking
  - Auto-reconnection with exponential backoff
  - Network status handling
  - Message history loading

#### Components

- **`src/components/ChatRoom.tsx/.css`** - Main chat interface
  - Message display with date dividers
  - Message input with typing indicators
  - Connection status indicator
  - Auto-scroll to new messages
  - Own/other message styling

- **`src/components/ChatGroupList.tsx/.css`** - Chat group sidebar
  - List of user's chat groups
  - Group selection
  - Active group highlighting
  - Empty state handling

#### Pages

- **`src/pages/Chat.tsx/.css`** - Main chat page
  - Two-column layout (groups + room)
  - Navigation header
  - Theme toggle integration
  - Responsive design

## Features

### ✅ Implemented

1. **Real-time Messaging**
   - WebSocket-based instant message delivery
   - Automatic message broadcasting to all participants
   - Message persistence to database

2. **Typing Indicators**
   - Real-time typing status
   - Debounced updates (2-second timeout)
   - Multi-user support

3. **User Presence**
   - Online/offline status
   - Active user count
   - Join/leave notifications

4. **Message History**
   - Load recent messages on chat open
   - Seamless integration with real-time messages
   - Configurable history limit (default: 50)

5. **Connection Management**
   - Auto-reconnection on disconnect
   - Exponential backoff (max 5 attempts)
   - Network status monitoring
   - Manual reconnect option

6. **Error Handling**
   - Connection failure feedback
   - Authentication errors
   - Permission checks
   - User-friendly error messages

7. **UI/UX**
   - Dark/light theme support
   - Date separators for messages
   - Own/other message distinction
   - Auto-scroll to latest messages
   - Responsive design (mobile-friendly)
   - Loading states
   - Empty states

## Usage

### Accessing the Chat

Users can access the chat feature from:

1. The **Messages** link in the sidebar navigation (Home page)
2. Direct URL: `/chat`

### Authentication

The chat feature is protected by `PrivateRoute` and requires:

- Valid JWT access token
- Authenticated user session

### WebSocket Connection

The WebSocket connection is automatically established when:

1. A chat group is selected
2. Valid token is available
3. User is a member of the chat group

Connection URL format:

```
ws://backend-url/api/v1/chats/ws/{chat_group_id}?token={jwt_token}
```

### Message Flow

1. **User Opens Chat**
   - Fetches chat groups from API
   - Displays group list
   - Waits for user to select a group

2. **User Selects Group**
   - Loads message history (REST API)
   - Establishes WebSocket connection
   - Displays historical + real-time messages

3. **User Sends Message**
   - Message sent via WebSocket
   - Backend saves to database
   - Backend broadcasts to all connected users
   - All users receive message instantly

4. **User Types**
   - Typing indicator sent every 2 seconds
   - Other users see "Someone is typing..."
   - Indicator cleared on send or timeout

## Configuration

### Environment Variables

The chat feature uses the same base URL as other API calls:

- **Development**: Vite proxy (`/api` → backend)
- **Production**: `VITE_API_BASE_URL` environment variable

### WebSocket URLs

- **HTTP**: `ws://`
- **HTTPS**: `wss://` (automatically converted)

### Reconnection Settings

Located in `useChatWebSocket.ts`:

```typescript
const maxReconnectAttempts = 5;
const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
```

- Max attempts: 5
- Backoff: Exponential (1s, 2s, 4s, 8s, 16s, capped at 30s)

### Message History Limit

Default: 50 recent messages
Can be adjusted in `useChatWebSocket.ts`:

```typescript
const recentMessages = await chatApi.getRecentMessages(token, chatGroupId, {
  limit: 50, // Change this value
});
```

## Styling

The chat feature uses CSS custom properties from the main theme:

- `--bg` - Background color
- `--bg-elevated` - Elevated surfaces
- `--text` - Primary text
- `--text-muted` - Secondary text
- `--primary` - Primary color (own messages)
- `--border` - Border color
- `--radius` - Border radius
- `--shadow` - Box shadows

All components support both light and dark themes automatically.

## Responsive Design

### Desktop (≥1024px)

- Sidebar: 320px
- Main chat: Flexible width
- Two-column layout

### Tablet (768px - 1023px)

- Sidebar: 280px
- Adjusted spacing
- Two-column layout maintained

### Mobile (<768px)

- Stacked layout (vertical)
- Sidebar: 200px max height
- Full-width chat room
- Compact header

## Known Limitations

1. **Message History Integration**
   - Historical messages are loaded separately from WebSocket messages
   - Real-time messages always appear after historical ones
   - No infinite scroll for older messages (future enhancement)

2. **User Information**
   - Messages only show user IDs, not names/avatars
   - Profile integration needed for better UX

3. **Message Features**
   - No message editing
   - No message reactions
   - No file attachments
   - No message search

4. **Notifications**
   - No desktop notifications
   - No unread message counts
   - No sound alerts

## Future Enhancements

### Priority Features

1. User profile integration (names, avatars)
2. Unread message badges
3. Message editing/deletion UI
4. File/image sharing
5. Desktop notifications
6. Infinite scroll for message history

### Nice-to-Have

1. Message search
2. Message reactions (emoji)
3. Reply/thread functionality
4. Link previews
5. Read receipts
6. Message formatting (bold, italic, etc.)
7. Voice messages

## Testing

### Manual Testing Checklist

- [ ] Open chat page (`/chat`)
- [ ] Select a chat group
- [ ] Verify connection status shows "Connected"
- [ ] Send a message
- [ ] Open chat in another browser/tab with different user
- [ ] Verify real-time message delivery
- [ ] Test typing indicators
- [ ] Close/reopen browser tab
- [ ] Verify message history loads
- [ ] Test dark/light theme switch
- [ ] Test mobile responsive layout
- [ ] Disconnect network, verify error handling
- [ ] Reconnect network, verify auto-reconnect

### Browser Console Testing

```javascript
// Open browser console and connect to WebSocket
const token = "your_jwt_token";
const chatGroupId = 1;
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/chats/ws/${chatGroupId}?token=${token}`,
);

ws.onmessage = (e) => console.log("Received:", JSON.parse(e.data));
ws.onopen = () =>
  ws.send(JSON.stringify({ type: "message", content: "Test from console" }));
```

## Troubleshooting

### Connection Issues

**Problem**: "Disconnected" status

- Check backend is running
- Verify WebSocket endpoint is accessible
- Check JWT token is valid (not expired)
- Verify user is member of chat group

**Problem**: Auto-reconnect fails

- Check network connection
- Check browser console for errors
- Verify backend WebSocket server is running
- Try manual reconnect button

### Message Issues

**Problem**: Messages not appearing

- Check WebSocket connection status
- Verify backend is processing messages
- Check browser console for errors
- Refresh page to reload history

**Problem**: Can't send messages

- Verify connection is "Connected"
- Check message input is not empty
- Verify JWT token is valid
- Check backend logs for errors

### UI Issues

**Problem**: Messages not auto-scrolling

- Check if user manually scrolled up
- Verify `messagesEndRef` is rendering
- Check browser console for React errors

**Problem**: Theme not applying

- Verify ThemeProvider is wrapping the app
- Check CSS custom properties are defined
- Clear browser cache and reload

## API Reference

See the main documentation file provided by the backend team for complete API details:

- REST endpoints
- WebSocket message formats
- Authentication requirements
- Error codes

## Support

For issues or questions:

1. Check browser console for errors
2. Check backend logs for server errors
3. Verify all prerequisites (auth, membership, etc.)
4. Review the backend API documentation
5. Contact the development team

---

**Implementation Date**: March 2026
**Last Updated**: March 6, 2026
**Version**: 1.0.0
