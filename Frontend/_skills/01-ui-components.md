# Skill: UI Components

## Rule
Always use shadcn/ui components. Never use raw HTML elements when a shadcn equivalent exists.

## Always Use
`Button` `Input` `Card` `CardHeader` `CardContent` `CardTitle` `Badge` `Avatar`
`DropdownMenu` `Skeleton` `Separator` `Label` `Table` `TableRow` `TableCell`
`Select` `Textarea` `Checkbox` `Dialog` `Sheet` `Tabs` `Alert` `Form`

## Always Add
- `cursor-pointer` on every interactive element (buttons, links, clickable cards)
- `animate-fade-in` on every **page-level wrapper div** (the outermost div of a page component)

## Pattern

```tsx
// page-level wrapper — always animate-fade-in
export default function CandidatesPage() {
  return (
    <div className="animate-fade-in p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="cursor-pointer">Add Candidate</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Never Do
```tsx
// WRONG — raw HTML elements
<button onClick={...}>Submit</button>
<input type="text" />
<select>...</select>

// RIGHT — shadcn/ui
<Button className="cursor-pointer" onClick={...}>Submit</Button>
<Input />
<Select>...</Select>
```

## Badge Usage (status colours)
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Rejected</Badge>
<Badge variant="outline">Draft</Badge>
```
