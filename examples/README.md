# ChatKit Node.js SDK Examples

This directory contains examples demonstrating how to use the ChatKit Node.js SDK.

## Hello World Example

**File:** `hello-world.ts`

The simplest possible ChatKit server that echoes back what the user says. Perfect for testing your integration.

### Prerequisites

```bash
# Install the example dependencies
npm install express
npm install --save-dev @types/express tsx
```

### Running the Example

```bash
# 1. Build the SDK first (from project root)
npm run build

# 2. Run the example
npx tsx examples/hello-world.ts
```

The server will start on `http://localhost:3000`.

### Testing with Your Frontend

The Hello World server runs on port 3001, while the frontend is served from port 3000.

**Setup:**
1. Start the Hello World backend:
   ```bash
   cd chatkit-node
   npx tsx examples/hello-world.ts
   ```
   Server will run on `http://localhost:3001`

2. Start the frontend server (from project root):
   ```bash
   cd ..
   npm run dev
   ```
   Frontend will be served at `http://localhost:3000`

3. Open `http://localhost:3000` in your browser
4. Send a test message
5. You should receive an echo response

### Testing with curl

```bash
# Create a new thread
curl -X POST http://localhost:3001/chatkit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [{"type": "input_text", "text": "Hello!"}],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

You should see a stream of SSE events including:
- `thread.created` - New thread created
- `thread.item.done` - User message saved
- `thread.item.done` - Assistant echo response

**Expected Output:**
```
data: {"type":"thread.created","thread":{...}}

data: {"type":"thread.item.done","item":{"type":"user_message",...}}

data: {"type":"thread.item.done","item":{"type":"assistant_message","content":[{"type":"output_text","text":"Hello! You said: \"Hello!\""}]}}
```

## What Next?

Once the Hello World example is working:

1. ✅ Verify SSE streaming works
2. ✅ Verify events flow correctly
3. ✅ Test with your actual ChatKit frontend
4. ✅ Confirm no errors in console

Then you can proceed to implement more advanced features like:
- OpenAI integration for real AI responses
- Widgets for rich UI
- Actions for interactivity
- Custom store implementations (SQL, NoSQL, etc.)
- Attachment handling
