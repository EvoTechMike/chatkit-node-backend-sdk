# ChatKit actions

Actions are a way for the ChatKit SDK frontend to trigger a streaming response without the user submitting a message. They can also be used to trigger side-effects outside ChatKit SDK.

## Triggering actions

### In response to user interaction with widgets

Actions can be triggered by attaching an `ActionConfig` to any widget node that supports it. For example, you can respond to click events on Buttons. When a user clicks on this button, the action will be sent to your server where you can update the widget, run inference, stream new thread items, etc.

```typescript
import { Button, ActionConfig } from 'chatkit-node/widgets';

new Button({
  label: 'Example',
  onClickAction: new ActionConfig({
    type: 'example',
    payload: { id: 123 },
  })
})
```

Actions can also be sent imperatively by your frontend with `sendAction()`. This is probably most useful when you need ChatKit to respond to interaction happening outside ChatKit, but it can also be used to chain actions when you need to respond on both the client and the server (more on that below).

```typescript
await chatKit.sendAction({
  type: 'example',
  payload: { id: 123 },
});
```

## Handling actions

### On the server

By default, actions are sent to your server. You can handle actions on your server by implementing the `action` method on `ChatKitServer`.

```typescript
import { ChatKitServer } from 'chatkit-node';
import {
  Action,
  ThreadMetadata,
  ThreadStreamEvent,
  WidgetItem,
  HiddenContextItem,
} from 'chatkit-node';

interface RequestContext {
  [key: string]: any;
}

class MyChatKitServer extends ChatKitServer<RequestContext> {
  async *action(
    thread: ThreadMetadata,
    action: Action<string, any>,
    sender: WidgetItem | null,
    context: RequestContext
  ): AsyncGenerator<ThreadStreamEvent> {
    if (action.type === 'example') {
      await doThing(action.payload['id']);

      // often you'll want to add a HiddenContextItem so the model
      // can see that the user did something
      const hidden: HiddenContextItem = {
        type: 'hidden_context',
        id: this.store.generateItemId('message', thread, context),
        threadId: thread.id,
        createdAt: new Date().toISOString(),
        content: ['<USER_ACTION>The user did a thing</USER_ACTION>'],
      };
      await this.store.addThreadItem(thread.id, hidden, context);

      // then you might want to run inference to stream a response
      // back to the user.
      for await (const e of this.generate(context, thread)) {
        yield e;
      }
    }

    if (action.type === 'another.example') {
      // ...
    }
  }
}
```

**NOTE:** As with any client/server interaction, actions and their payloads are sent by the client and should be treated as untrusted data.

### Client

Sometimes you'll want to handle actions in your client integration. To do that you need to specify that the action should be sent to your client-side action handler by adding `handler: 'client'` to the `ActionConfig`.

```typescript
import { Button, ActionConfig } from 'chatkit-node/widgets';

new Button({
  label: 'Example',
  onClickAction: new ActionConfig({
    type: 'example',
    payload: { id: 123 },
    handler: 'client'
  })
})
```

Then, when the action is triggered, it will then be passed to a callback that you provide when instantiating ChatKit.

```typescript
async function handleWidgetAction(action: { type: string, [key: string]: unknown }) {
  if (action.type === 'example') {
    const res = await doSomething(action);

    // You can fire off actions to your server from here as well.
    // e.g. if you want to stream new thread items or update a widget.
    await chatKit.sendAction({
      type: 'example_complete',
      payload: res
    });
  }
}

chatKit.setOptions({
  // other options...
  widgets: { onAction: handleWidgetAction }
});
```

## Strongly typed actions

By default `Action` and `ActionConfig` are not strongly typed. However, we do expose a `create` helper on `Action` making it easy to generate `ActionConfig`s from a set of strongly-typed actions.

```typescript
import { Action, ActionConfig } from 'chatkit-node';
import { z } from 'zod';

// Define action payloads
interface ExamplePayload {
  id: number;
}

// Define action types
type ExampleAction = Action<'example', ExamplePayload>;
type OtherAction = Action<'other', null>;

// Union type for all actions
type AppAction = ExampleAction | OtherAction;

// Helper to parse actions
function parseAppAction(action: Action<string, any>): AppAction {
  // Add runtime validation if needed
  return action as AppAction;
}

// Usage in a widget
// Action provides a create helper which makes it easy to generate
// ActionConfigs from strongly typed actions.
import { Button } from 'chatkit-node/widgets';

new Button({
  label: 'Example',
  onClickAction: ActionConfig.create<ExampleAction>({
    type: 'example',
    payload: { id: 123 }
  })
})

// usage in action handler
class MyChatKitServer extends ChatKitServer<RequestContext> {
  async *action(
    thread: ThreadMetadata,
    action: Action<string, any>,
    sender: WidgetItem | null,
    context: RequestContext
  ): AsyncGenerator<ThreadStreamEvent> {
    // add custom error handling if needed
    const appAction = parseAppAction(action);
    if (appAction.type === 'example') {
      await doThing(appAction.payload.id);
    }
  }
}
```

## Use widgets and actions to create custom forms

When widget nodes that take user input are mounted inside a `Form`, the values from those fields will be included in the `payload` of all actions that originate from within the `Form`.

Form values are keyed in the `payload` by their `name` e.g.

- `Select(name: "title")` → `action.payload.title`
- `Select(name: "todo.title")` → `action.payload.todo.title`

```typescript
import { Form, Title, Text, Button, ActionConfig, EditableProps } from 'chatkit-node/widgets';

interface Todo {
  id: string;
  title: string;
  description: string;
}

const todo: Todo = {
  id: '123',
  title: 'Buy groceries',
  description: 'Get milk, eggs, bread'
};

new Form({
  direction: 'col',
  onSubmitAction: new ActionConfig({
    type: 'update_todo',
    payload: { id: todo.id }
  }),
  children: [
    new Title({ value: 'Edit Todo' }),

    new Text({ value: 'Title', color: 'secondary', size: 'sm' }),
    new Text({
      value: todo.title,
      editable: new EditableProps({ name: 'title', required: true }),
    }),

    new Text({ value: 'Description', color: 'secondary', size: 'sm' }),
    new Text({
      value: todo.description,
      editable: new EditableProps({ name: 'description' }),
    }),

    new Button({ label: 'Save', submit: true })
  ]
})

class MyChatKitServer extends ChatKitServer<RequestContext> {
  async *action(
    thread: ThreadMetadata,
    action: Action<string, any>,
    sender: WidgetItem | null,
    context: RequestContext
  ): AsyncGenerator<ThreadStreamEvent> {
    if (action.type === 'update_todo') {
      const id = action.payload['id'];
      // Any action that originates from within the Form will
      // include title and description
      const title = action.payload['title'];
      const description = action.payload['description'];

      // ...
    }
  }
}
```

### Validation

`Form` uses basic native form validation; enforcing `required` and `pattern` on fields where they are configured and blocking submission when the form has any invalid field.

We may add new validation modes with better UX, more expressive validation, custom error display, etc in the future. Until then, widgets are not a great medium for complex forms with tricky validation. If you have this need, a better pattern would be to use client side action handling to trigger a modal, show a custom form there, then pass the result back into ChatKit with `sendAction`.

### Treating `Card` as a `Form`

You can pass `asForm: true` to `Card` and it will behave as a `Form`, running validation and passing collected fields to the Card's `confirm` action.

### Payload key collisions

If there is a naming collision with some other existing pre-defined key on your payload, the form value will be ignored. This is probably a bug, so we'll emit an `error` event when we see this.

## Customize how actions interact with loading states in widgets

Use `ActionConfig.loadingBehavior` to control how actions trigger different loading states in a widget.

```typescript
import { Button, ActionConfig } from 'chatkit-node/widgets';

new Button({
  label: 'This make take a while...',
  onClickAction: new ActionConfig({
    type: 'long_running_action_that_should_block_other_ui_interactions',
    loadingBehavior: 'container'
  })
})
```

| Value       | Behavior                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `auto`      | The action will adapt to how it's being used. (_default_)                                                                       |
| `self`      | The action triggers loading state on the widget node that the action was bound to.                                              |
| `container` | The action triggers loading state on the entire widget container. This causes the widget to fade out slightly and become inert. |
| `none`      | No loading state                                                                                                                |

### Using `auto` behavior

Generally, we recommend using `auto`, which is the default. `auto` triggers loading states based on where the action is bound, for example:

- `Button.onClickAction` → `self`
- `Select.onChangeAction` → `none`
- `Card.confirm.action` → `container`
