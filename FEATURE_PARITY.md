# ChatKit Node.js Feature Parity with Python SDK

This document tracks the implementation status of features to achieve parity with the Python ChatKit SDK.

## Implementation Status: 7/10 Features Complete ✅

### ✅ Completed Features

1. **Feature #1: Reuse Agent SDK Message IDs**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:187`
   - Description: Reuses message IDs from the Agent SDK for consistency instead of generating new ones
   - Matches Python: `agents.py:486-487`

2. **Feature #2: Support Multiple Content Parts**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:91, 243, 267`
   - Description: Tracks text accumulation separately for each content part using `content_index` from events
   - Matches Python: `agents.py:441, 449, 457`

3. **Feature #3: Add Content Part Lifecycle Events**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:216-236`
   - Description: Emits `content_part.added` events when content parts are initialized
   - Matches Python: `agents.py:434-444`

4. **Feature #4: Add Annotations Support (Citations)**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:11-42, 217-232`
   - Description: Converts Agent SDK annotations (file citations, URL citations) to ChatKit format
   - Matches Python: `agents.py:224-254`

5. **Feature #5: Add Workflow/Reasoning Support**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:107-156, 287-372`
   - Description: Emits workflow items for GPT-5 reasoning with streaming thought support
   - Matches Python: `agents.py:468-526`
   - Configuration: Toggle via `showThinking` option (default: true)

6. **Feature #9: Use SDK's Final Content**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:384-427`
   - Description: Uses Agent SDK's final content from `response.output_item.done` instead of accumulated text
   - Matches Python: `agents.py:527-545`

7. **Feature #10: Handle response.output_text.done Events**
   - Status: ✅ Complete
   - Location: `src/agents/stream-converter.ts:265-285`
   - Description: Processes `response.output_text.done` events to finalize content parts
   - Matches Python: `agents.py:453-463`

### 🔄 Remaining Features (Advanced Use Cases)

8. **Feature #6: Add Tool Call Support**
   - Status: ⏸️ Pending
   - Priority: Medium
   - Description: Handle tool calls from Agent SDK when tools are configured
   - Required for: Agent tool usage (function calls, code interpreter, file search)
   - Python reference: `agents.py:416-426, 592-608`
   - Implementation notes:
     - Listen for `run_item_stream_event` with `tool_call_item` type
     - Track `current_tool_call` and `current_item_id`
     - Emit `ClientToolCallItem` at end of run if `context.client_tool_call` is set

9. **Feature #7: Implement Event Merging (Multi-Agent Support)**
   - Status: ⏸️ Pending (TODO: Come back for multi-agent)
   - Priority: Low (Advanced)
   - Description: Merge Agent SDK stream events with custom integration events
   - Required for: Custom widgets, multi-agent workflows, advanced integrations
   - Python reference: `agents.py:261-294, 386-414`
   - Implementation notes:
     - Create `_merge_generators()` utility to merge async iterators
     - Merge `agentRunner` stream with `AgentContext._events` queue
     - Support `AgentContext.stream_widget()`, `start_workflow()`, `add_workflow_task()`
     - Handle `_EventWrapper` to distinguish custom events from Agent SDK events

10. **Feature #8: Add Guardrail Handling**
    - Status: ⏸️ Pending
    - Priority: Low (Safety/Moderation)
    - Description: Handle input/output guardrail tripwire events
    - Required for: Content moderation, safety checks
    - Python reference: `agents.py:570-580`
    - Implementation notes:
      - Track `produced_items` set of item IDs
      - Catch `InputGuardrailTripwireTriggered` and `OutputGuardrailTripwireTriggered` exceptions
      - Emit `ThreadItemRemovedEvent` for all produced items on tripwire
      - Drain remaining events without processing

## Feature #7 Details: Event Merging for Multi-Agent Support

### What is Event Merging?

Event merging allows combining two async event streams:
1. **Agent SDK Stream**: Model responses (messages, reasoning, tool calls)
2. **Custom Integration Stream**: Custom events (widgets, tasks, workflows)

This enables advanced patterns like:
- Streaming custom UI widgets alongside agent responses
- Multi-agent workflows with custom task tracking
- Custom workflow visualization while agents run
- Integration-specific events (progress, status updates)

### Python Implementation Reference

```python
# agents.py:261-294
async def _merge_generators(
    a: AsyncIterator[T1],
    b: AsyncIterator[T2],
) -> AsyncIterator[T1 | T2]:
    # Merges two async iterators, yielding events as they arrive from either source
    # Uses asyncio.wait with FIRST_COMPLETED to get events in arrival order
```

Usage in `stream_agent_response()`:
```python
# agents.py:386
async for event in _merge_generators(result.stream_events(), queue_iterator):
    # Events from either stream are processed together
    if isinstance(event, _EventWrapper):
        # This is a custom event from AgentContext
        yield event.event
    else:
        # This is an Agent SDK event
        # ... process raw_response_event, run_item_stream_event, etc.
```

### When to Implement?

Implement Feature #7 when you need:
- ✅ **Multi-agent systems** - Multiple agents collaborating with custom coordination
- ✅ **Custom widgets** - Streaming interactive UI components alongside responses
- ✅ **Advanced workflows** - Custom task tracking beyond basic reasoning
- ✅ **Integration events** - Custom progress indicators, status updates

You **don't** need Feature #7 for:
- ❌ Basic single-agent chat (current implementation is sufficient)
- ❌ Standard reasoning workflows (Feature #5 already handles this)
- ❌ Simple tool usage (Feature #6 handles this)

## Testing Coverage

Current test coverage:
- ✅ Basic message streaming
- ✅ Reasoning/workflow display
- ✅ Annotations/citations
- ✅ Multiple content parts
- ⏸️ Tool calls (pending Feature #6)
- ⏸️ Custom event merging (pending Feature #7)
- ⏸️ Guardrail handling (pending Feature #8)

## Notes

- All completed features match Python SDK behavior
- Configuration options (e.g., `showThinking`) match Python patterns
- Event types and structure match ChatKit protocol specification
- Ready for basic production use with single-agent workflows
