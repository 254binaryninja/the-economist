# ChatInput Component

A reusable chat input component with file attachment support and system mode selection.

## Features

- ✅ Text input with send button
- ✅ File attachment support with preview
- ✅ System mode selector (configurable)
- ✅ File type restrictions
- ✅ Maximum file limit
- ✅ Individual file removal
- ✅ Clear all files option
- ✅ Loading state support
- ✅ Keyboard submission (Enter)
- ✅ TypeScript support

## Usage

### Basic Usage

```tsx
import { ChatInput } from '@/components/ai/ChatInput';

function MyChat() {
  const [input, setInput] = useState('');

  const handleSubmit = (e, options) => {
    console.log('Message:', input);
    console.log('Files:', options?.files);
    console.log('System Mode:', options?.systemMode);
  };

  return (
    <ChatInput
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
    />
  );
}
```

### With System Mode Selector

```tsx
<ChatInput
  input={input}
  onInputChange={setInput}
  onSubmit={handleSubmit}
  systemMode={systemMode}
  onSystemModeChange={setSystemMode}
  showSystemModeSelector={true}
/>
```

### File Restrictions

```tsx
<ChatInput
  input={input}
  onInputChange={setInput}
  onSubmit={handleSubmit}
  maxFiles={5}
  acceptedFileTypes="image/*,application/pdf,.txt"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `string` | - | Current input value |
| `onInputChange` | `(value: string) => void` | - | Input change handler |
| `onSubmit` | `(e: FormEvent, options?: {files?: FileList; systemMode?: string}) => void` | - | Submit handler |
| `isLoading` | `boolean` | `false` | Loading state |
| `placeholder` | `string` | `"Ask a question or attach a document..."` | Input placeholder |
| `systemMode` | `string` | `'normal'` | Current system mode |
| `onSystemModeChange` | `(mode: string) => void` | - | System mode change handler |
| `showSystemModeSelector` | `boolean` | `true` | Show/hide system mode selector |
| `maxFiles` | `number` | `10` | Maximum number of files |
| `acceptedFileTypes` | `string` | `"*/*"` | Accepted file types |

## System Modes

Available system modes:
- `normal` - Normal analysis
- `keynesian` - Keynesian economic analysis
- `classical` - Classical economic analysis
- `behavioral` - Behavioral economic analysis
- `monetarist` - Monetarist analysis

## Integration with Vercel AI SDK

This component is designed to work seamlessly with the Vercel AI SDK's `useChat` hook:

```tsx
import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/ai/ChatInput';

function AIChat() {
  const { messages, input, setInput, handleSubmit } = useChat();

  return (
    <ChatInput
      input={input}
      onInputChange={setInput}
      onSubmit={(e, options) => {
        const formData = new FormData();
        formData.append('messages', JSON.stringify([{ role: 'user', content: input }]));
        
        if (options?.files) {
          Array.from(options.files).forEach(f => formData.append('attachments', f));
        }
        
        handleSubmit(e, { body: formData });
      }}
    />
  );
}
```
