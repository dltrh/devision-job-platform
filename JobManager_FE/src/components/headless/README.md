# Headless Components Library

## Overview

This directory contains **headless components** - components that provide logic, state management, and behavior without enforcing any specific UI implementation. This follows the **Headless UI Pattern** (A.3.a requirement).

## Philosophy

**Separation of Concerns:**

- **Headless Component:** Manages logic, state, validation, and behavior
- **Render Props:** Provides data and handlers to children
- **Consumer:** Decides how to render the UI

**Benefits:**

1. **Reusability** - Logic can be shared across different UI designs
2. **Testability** - Business logic tested independently of UI
3. **Flexibility** - Complete control over styling and structure
4. **Maintainability** - Single source of truth for behavior
5. **No Style Conflicts** - Zero CSS bundled with components

---

## Components

### 1. HeadlessStatusBadge

**Purpose:** Manages status display logic with automatic variant detection.

**Use Cases:**

- Job post status indicators
- Application status badges
- General status displays

**Example:**

```tsx
import { HeadlessStatusBadge } from "@/components/headless";

<HeadlessStatusBadge status="published" variant="success">
    {({ status, variant, className }) => (
        <span
            className={`px-3 py-1 rounded-full ${
                variant === "success"
                    ? "bg-green-100 text-green-800"
                    : variant === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
            }`}
        >
            {status}
        </span>
    )}
</HeadlessStatusBadge>;
```

**Props:**

- `status: string` - The status text to display
- `variant?: 'default' | 'success' | 'warning' | 'error' | 'info'` - Badge variant
- `size?: 'sm' | 'md' | 'lg'` - Badge size
- `children: (props) => ReactNode` - Render function

**Auto-Variant Detection:**

- `published`, `active` → success (green)
- `draft`, `pending` → warning (yellow)
- `archived`, `rejected` → error (red)
- `expired` → info (blue)

---

### 2. HeadlessTagInput

**Purpose:** Manages tag input logic with autocomplete, validation, and keyboard navigation.

**Use Cases:**

- Skill tags input
- Category selection
- Multi-select with custom values
- Autocomplete lists

**Example:**

```tsx
import { HeadlessTagInput } from "@/components/headless";

<HeadlessTagInput
    value={["React", "TypeScript"]}
    onChange={setSkills}
    placeholder="Type a skill..."
    suggestions={["JavaScript", "Python", "Java"]}
    allowCustom={true}
    maxTags={10}
>
    {({
        tags,
        inputValue,
        filteredSuggestions,
        showSuggestions,
        handleInputChange,
        handleAddTag,
        handleRemoveTag,
        handleKeyDown,
        handleSuggestionClick,
        canAddMore,
    }) => (
        <div>
            {tags.map((tag) => (
                <span key={tag.id}>
                    {tag.label}
                    <button onClick={() => handleRemoveTag(tag.id)}>×</button>
                </span>
            ))}
            <input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!canAddMore}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul>
                    {filteredSuggestions.map((suggestion) => (
                        <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )}
</HeadlessTagInput>;
```

**Props:**

- `value: string[]` - Current tag values
- `onChange: (tags: string[]) => void` - Callback when tags change
- `placeholder?: string` - Input placeholder text
- `maxTags?: number` - Maximum number of tags allowed
- `suggestions?: string[]` - Autocomplete suggestions
- `allowCustom?: boolean` - Allow user-defined tags (default: true)
- `children: (props) => ReactNode` - Render function

**Keyboard Shortcuts:**

- `Enter` - Add current input as tag
- `Backspace` (empty input) - Remove last tag
- Arrow keys - Navigate suggestions (future enhancement)

**Features:**

- Duplicate prevention
- Case-insensitive filtering
- Max tags enforcement
- Custom tag validation

---

### 3. HeadlessSalaryInput

**Purpose:** Manages salary input logic with type switching and validation.

**Use Cases:**

- Job post salary input
- Compensation forms
- Budget range inputs

**Example:**

```tsx
import { HeadlessSalaryInput } from "@/components/headless";

<HeadlessSalaryInput
    salaryType="range"
    salaryMin={50000}
    salaryMax={80000}
    salaryEstimation="Competitive"
    onSalaryTypeChange={setSalaryType}
    onSalaryMinChange={setSalaryMin}
    onSalaryMaxChange={setSalaryMax}
    onSalaryEstimationChange={setSalaryEstimation}
>
    {({
        salaryType,
        salaryMin,
        salaryMax,
        salaryEstimation,
        handleSalaryTypeChange,
        handleSalaryMinChange,
        handleSalaryMaxChange,
        handleSalaryEstimationChange,
        errors,
        isRangeType,
        isEstimationType,
        isNegotiableType,
    }) => (
        <div>
            {/* Type selector */}
            <select value={salaryType} onChange={(e) => handleSalaryTypeChange(e.target.value)}>
                <option value="range">Range</option>
                <option value="estimation">Estimation</option>
                <option value="negotiable">Negotiable</option>
            </select>

            {/* Conditional inputs based on type */}
            {isRangeType && (
                <>
                    <input
                        type="number"
                        value={salaryMin || ""}
                        onChange={(e) => handleSalaryMinChange(e.target.value)}
                    />
                    <input
                        type="number"
                        value={salaryMax || ""}
                        onChange={(e) => handleSalaryMaxChange(e.target.value)}
                    />
                </>
            )}

            {isEstimationType && (
                <input
                    type="text"
                    value={salaryEstimation || ""}
                    onChange={(e) => handleSalaryEstimationChange(e.target.value)}
                />
            )}

            {errors.range && <p className="error">{errors.range}</p>}
        </div>
    )}
</HeadlessSalaryInput>;
```

**Props:**

- `salaryType: 'range' | 'estimation' | 'negotiable'` - Type of salary input
- `salaryMin?: number` - Minimum salary (for range type)
- `salaryMax?: number` - Maximum salary (for range type)
- `salaryEstimation?: string` - Estimation text (for estimation type)
- `onSalaryTypeChange: (type) => void` - Type change handler
- `onSalaryMinChange: (value) => void` - Min change handler
- `onSalaryMaxChange: (value) => void` - Max change handler
- `onSalaryEstimationChange: (value) => void` - Estimation change handler
- `children: (props) => ReactNode` - Render function

**Validation:**

- Range: min ≤ max
- Estimation: non-empty string
- Automatic error state management

---

### 4. HeadlessConfirmDialog

**Purpose:** Manages confirmation dialog logic with loading states.

**Use Cases:**

- Delete confirmations
- Archive confirmations
- Destructive action confirmations
- Async action confirmations

**Example:**

```tsx
import { HeadlessConfirmDialog } from "@/components/headless";

<HeadlessConfirmDialog
    isOpen={dialogOpen}
    onClose={() => setDialogOpen(false)}
    onConfirm={handleDelete}
    title="Delete Job Post"
    message="Are you sure you want to delete this job post? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
>
    {({
        title,
        message,
        confirmText,
        cancelText,
        variant,
        isLoading,
        handleConfirm,
        handleCancel,
    }) => (
        <div className="modal">
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="actions">
                <button onClick={handleCancel} disabled={isLoading}>
                    {cancelText}
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={variant === "danger" ? "btn-danger" : "btn-primary"}
                >
                    {isLoading ? "Processing..." : confirmText}
                </button>
            </div>
        </div>
    )}
</HeadlessConfirmDialog>;
```

**Props:**

- `isOpen: boolean` - Dialog visibility
- `onClose: () => void` - Close handler
- `onConfirm: () => void | Promise<void>` - Confirm handler (can be async)
- `title: string` - Dialog title
- `message: string` - Dialog message
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `variant?: 'default' | 'danger' | 'warning'` - Dialog variant
- `children: (props) => ReactNode` - Render function

**Features:**

- Async confirmation support
- Loading state management
- Escape key to close
- Auto-close after confirmation
- Error handling in confirm action

---

## Design Patterns

### Render Props Pattern

All headless components use the **render props pattern**:

```tsx
<HeadlessComponent {...props}>
  {(renderProps) => (
    // Your UI implementation
  )}
</HeadlessComponent>
```

**Why Render Props?**

- Maximum flexibility
- Type-safe with TypeScript
- Clear data flow
- No prop drilling
- Easy to compose

---

## Testing Strategy

### Unit Testing Headless Components

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { HeadlessTagInput } from "./HeadlessTagInput";

test("adds tag on Enter key", () => {
    const handleChange = jest.fn();

    render(
        <HeadlessTagInput value={[]} onChange={handleChange}>
            {({ inputValue, handleInputChange, handleKeyDown }) => (
                <input
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            )}
        </HeadlessTagInput>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "React" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(["React"]);
});
```

### Integration Testing

```tsx
test("complete job post form workflow", () => {
    // Test entire form including headless components
    // Verify data flow from input to submission
});
```

---

## Best Practices

### 1. Keep Logic in Headless Component

```tsx
// ✅ Good - Logic in headless component
<HeadlessTagInput maxTags={10}>
  {({ canAddMore }) => (
    <input disabled={!canAddMore} />
  )}
</HeadlessTagInput>

// ❌ Bad - Logic in consumer
<HeadlessTagInput>
  {({ tags }) => (
    <input disabled={tags.length >= 10} />
  )}
</HeadlessTagInput>
```

### 2. Use TypeScript

```tsx
// Always type render props
import { HeadlessTagInputProps, TagInputRenderProps } from './HeadlessTagInput';

const MyComponent: React.FC = () => {
  return (
    <HeadlessTagInput {...props}>
      {(renderProps: TagInputRenderProps) => (
        // TypeScript autocomplete works here
      )}
    </HeadlessTagInput>
  );
};
```

### 3. Handle Edge Cases

```tsx
// Handle empty states, loading states, error states
<HeadlessTagInput>
    {({ tags, showSuggestions, filteredSuggestions }) => (
        <>
            {tags.length === 0 && <p>No tags yet</p>}
            {showSuggestions && filteredSuggestions.length === 0 && <p>No suggestions</p>}
        </>
    )}
</HeadlessTagInput>
```

### 4. Compose Components

```tsx
// Headless components can be composed
<HeadlessForm>
  {({ values, handleChange }) => (
    <HeadlessTagInput
      value={values.skills}
      onChange={(skills) => handleChange('skills', skills)}
    >
      {({ tags, inputValue }) => (
        // Your UI
      )}
    </HeadlessTagInput>
  )}
</HeadlessForm>
```

---

## Performance Considerations

### Memoization

```tsx
import React, { useMemo, useCallback } from "react";

// Memoize expensive calculations
const filteredSuggestions = useMemo(
    () => suggestions.filter((s) => s.includes(inputValue)),
    [suggestions, inputValue]
);

// Memoize callbacks
const handleAddTag = useCallback(
    (tag: string) => {
        onChange([...value, tag]);
    },
    [value, onChange]
);
```

### React.memo for Consumers

```tsx
const TagList = React.memo(({ tags, onRemove }) => (
    <div>
        {tags.map((tag) => (
            <Tag key={tag.id} onRemove={() => onRemove(tag.id)} />
        ))}
    </div>
));
```

---

## Future Enhancements

### Planned Features

1. **Accessibility**
    - ARIA attributes
    - Keyboard navigation
    - Screen reader support

2. **Advanced TagInput**
    - Drag-and-drop reordering
    - Tag grouping
    - Tag validation rules

3. **HeadlessDatePicker**
    - Date range selection
    - Calendar view
    - Timezone support

4. **HeadlessMultiSelect**
    - Checkbox groups
    - Search filtering
    - Select all/none

---

## Contributing

### Adding a New Headless Component

1. **Create Component Directory**

```
src/components/headless/YourComponent/
├── HeadlessYourComponent.tsx
├── index.ts
└── README.md (optional)
```

2. **Implement Component**

```tsx
import React, { useState } from "react";

export interface HeadlessYourComponentProps {
    // Props
    children: (props: YourComponentRenderProps) => React.ReactNode;
}

export interface YourComponentRenderProps {
    // Render props
}

export const HeadlessYourComponent: React.FC<HeadlessYourComponentProps> = ({
    children,
    ...props
}) => {
    // State and logic
    return <>{children(renderProps)}</>;
};
```

3. **Export from Index**

```tsx
// src/components/headless/index.ts
export { HeadlessYourComponent } from "./YourComponent";
export type { HeadlessYourComponentProps, YourComponentRenderProps } from "./YourComponent";
```

4. **Document Usage**
   Add examples to this README.

---

## Notification Components

### HeadlessNotificationBadge

**Purpose:** Manages notification count badge logic.

```tsx
import { HeadlessNotificationBadge } from "@/components/headless";

<HeadlessNotificationBadge count={5} maxCount={99}>
    {({ displayCount, hasNotifications }) => (
        <button className="relative">
            <BellIcon />
            {hasNotifications && <span className="badge">{displayCount}</span>}
        </button>
    )}
</HeadlessNotificationBadge>;
```

### HeadlessNotificationItem

**Purpose:** Manages individual notification item logic with auto-formatting.

```tsx
import { HeadlessNotificationItem } from "@/components/headless";

<HeadlessNotificationItem
    notification={notification}
    onMarkAsRead={handleMarkAsRead}
    onClick={handleClick}
>
    {({ isUnread, typeIcon, relativeTime, contextSummary }) => (
        <div className={isUnread ? "bg-blue-50" : ""}>
            <span>{typeIcon}</span>
            <p>{contextSummary}</p>
            <span>{relativeTime}</span>
        </div>
    )}
</HeadlessNotificationItem>;
```

### HeadlessNotificationList

**Purpose:** Manages notification list state with filtering and grouping.

### HeadlessNotificationPanel

**Purpose:** Manages notification dropdown panel behavior (outside click, escape key).

### HeadlessNotificationTabs

**Purpose:** Manages tab navigation for notification center.

---

## Resources

- [Render Props Pattern](https://reactjs.org/docs/render-props.html)
- [Headless UI Philosophy](https://www.merrickchristensen.com/articles/headless-user-interface-components/)
- [TypeScript + React](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Remember:** Headless components are about **separation of concerns**. Keep business logic in the component, let consumers control the UI.
