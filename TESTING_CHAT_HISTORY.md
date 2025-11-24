# Testing the Chat History Feature

## Manual Testing Steps

### 1. Start the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Test Chat Creation

1. Login to your account
2. Navigate to "Ask AI" section
3. Type a message and send it
4. Verify:
   - Message appears in chat
   - AI responds
   - Both messages are saved
   - A new chat appears in the left sidebar
   - Chat title is the first message (truncated)

### 3. Test Chat History

1. Send a few more messages in the same chat
2. Click "New Chat" button
3. Send messages in the new chat
4. Verify:
   - Two chats appear in sidebar
   - Most recent chat is at the top
   - Each shows correct timestamp
   - Each shows message count

### 4. Test Loading Previous Chat

1. Click on an older chat in the sidebar
2. Verify:
   - All previous messages load correctly
   - Messages are in correct order
   - Can continue the conversation
   - New messages are saved to the correct chat

### 5. Test Chat Management

**Rename:**
1. Hover over a chat in sidebar
2. Click the edit (pencil) icon
3. Type a new name
4. Press Enter or click away
5. Verify: Chat title updates

**Delete:**
1. Hover over a chat in sidebar
2. Click the delete (trash) icon
3. Confirm deletion
4. Verify: Chat is removed from sidebar

### 6. Test with PDFs

1. Select a PDF from dropdown
2. Ask a question about it
3. Verify:
   - Chat is created with PDF association
   - Can load this chat later
   - PDF selection is restored when loading chat

### 7. Test Language Persistence

1. Change language (e.g., to Arabic)
2. Send messages
3. Load a previous chat
4. Verify: Language setting is restored from that chat

## Expected Results

✓ All chats are saved automatically
✓ Chat history persists across sessions
✓ Can switch between multiple chats
✓ Can rename and delete chats
✓ Timestamps show relative time
✓ Message count is accurate
✓ PDF and language preferences are saved per chat
✓ UI is responsive and smooth

## Common Issues and Solutions

### Issue: Chat not saving
- Check MongoDB connection
- Verify authentication is working
- Check browser console for errors

### Issue: Chat sidebar not showing
- Verify API endpoint `/api/chats` is accessible
- Check if user is authenticated
- Look for CORS issues

### Issue: Messages not loading
- Check chat ID is being passed correctly
- Verify message format in database
- Check console for errors

## API Testing (Optional)

Use Postman or curl to test endpoints:

```bash
# Get all chats
GET http://localhost:5000/api/chats
Headers: Authorization: Bearer <token>

# Create new chat
POST http://localhost:5000/api/chats
Headers: Authorization: Bearer <token>
Body: {
  "title": "Test Chat",
  "language": "english"
}

# Add message
POST http://localhost:5000/api/chats/{chatId}/messages
Headers: Authorization: Bearer <token>
Body: {
  "role": "user",
  "content": "Hello AI"
}

# Delete chat
DELETE http://localhost:5000/api/chats/{chatId}
Headers: Authorization: Bearer <token>
```
