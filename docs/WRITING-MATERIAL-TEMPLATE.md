# Writing material template

How to provide IELTS Writing questions so the app can render the correct screen. Use this when storing questions in a CMS, API, or JSON files.

---

## Allowed values (enums)

| Field       | Allowed values |
|------------|----------------|
| `examType` | `"academic"` \| `"general_training"` |
| `taskType` | `"task1"` \| `"task2"` |
| **Academic Task 1** `subtype` | `"line_graph"` \| `"bar_chart"` \| `"pie_chart"` \| `"table"` \| `"process_diagram"` \| `"map"` \| `"mixed_visual"` |
| **General Task 1** `subtype` | `"formal_letter"` \| `"semi_formal_letter"` \| `"informal_letter"` |
| **Task 2** `subtype` | `"opinion"` \| `"discussion"` \| `"problem_solution"` \| `"advantage_disadvantage"` \| `"direct_question"` |
| `difficulty` (optional) | `"easy"` \| `"medium"` \| `"hard"` |

---

## Field reference

### Common fields (all question types)

| Field              | Type     | Required | Description |
|--------------------|----------|----------|-------------|
| `id`               | string   | Yes      | Unique identifier (e.g. from your DB). |
| `examType`         | string   | Yes      | `"academic"` or `"general_training"`. |
| `taskType`         | string   | Yes      | `"task1"` or `"task2"`. |
| `subtype`          | string   | Yes      | One of the subtypes for that task (see enums above). |
| `prompt`           | string   | Yes      | Main question text (can include multiple paragraphs; use `\n\n` for new paragraphs). |
| `instructions`     | string   | Yes      | Time/task instruction (e.g. "You should spend about 20 minutes on this task."). |
| `minimumWords`     | number   | Yes      | Minimum word count (e.g. 150 for Task 1, 250 for Task 2). |
| `suggestedMinutes` | number   | Yes      | Suggested time in minutes (e.g. 20 or 40). |
| `title`            | string   | No       | Short title for the question. |
| `difficulty`       | string   | No       | `"easy"` \| `"medium"` \| `"hard"`. |
| `topic`            | string   | No       | Topic label (e.g. "Technology", "Education"). |
| `tags`             | string[] | No       | Tags for filtering/search. |

### Academic Task 1 only

| Field                  | Type   | Required | Description |
|------------------------|--------|----------|-------------|
| `summariseInstruction` | string | Yes      | Instruction after the visual (e.g. "Summarise the information by selecting and reporting the main features, and make comparisons where relevant."). |
| `imageUrl`             | string | No       | URL of the chart/diagram/map image. If omitted, a placeholder is shown. |
| `imageAlt`             | string | No       | Alt text for the image. |

### General Training Task 1 only

| Field           | Type     | Required | Description |
|-----------------|----------|----------|-------------|
| `bulletPoints`  | string[] | No       | List of points the candidate must address in the letter. |

### Task 2 only

No extra required fields. Use the common fields; `prompt` is the full essay question.

---

## JSON templates

Copy the object that matches your question type and fill in the values.

### 1. Academic Task 1 (e.g. line graph, bar chart, process diagram)

```json
{
  "id": "ac-task1-line-001",
  "examType": "academic",
  "taskType": "task1",
  "subtype": "line_graph",
  "title": "Optional short title",
  "prompt": "The chart below shows …",
  "instructions": "You should spend about 20 minutes on this task.",
  "summariseInstruction": "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  "minimumWords": 150,
  "suggestedMinutes": 20,
  "difficulty": "medium",
  "topic": "Technology",
  "tags": ["line_graph", "trends"],
  "imageUrl": "https://example.com/chart.png",
  "imageAlt": "Line graph showing …"
}
```

- **`subtype`** can be: `line_graph`, `bar_chart`, `pie_chart`, `table`, `process_diagram`, `map`, `mixed_visual`.
- Omit `imageUrl` / `imageAlt` to show a “Chart / Diagram Preview” placeholder.

### 2. General Training Task 1 (letter)

```json
{
  "id": "gt-task1-formal-001",
  "examType": "general_training",
  "taskType": "task1",
  "subtype": "formal_letter",
  "title": "Optional title",
  "prompt": "You recently bought an item that did not work. Write a letter to the store manager. In your letter:\n\n",
  "instructions": "You should spend about 20 minutes on this task.",
  "minimumWords": 150,
  "suggestedMinutes": 20,
  "difficulty": "easy",
  "topic": "Consumer",
  "tags": ["formal_letter"],
  "bulletPoints": [
    "describe the item and the problem",
    "explain why you need it urgently",
    "say what you would like the manager to do"
  ]
}
```

- **`subtype`** can be: `formal_letter`, `semi_formal_letter`, `informal_letter`.
- **`bulletPoints`** is optional but recommended for letter tasks.

### 3. Task 2 (essay – Academic or General Training)

```json
{
  "id": "ac-task2-opinion-001",
  "examType": "academic",
  "taskType": "task2",
  "subtype": "opinion",
  "title": "Optional title",
  "prompt": "Some people believe that … Others think …\n\nDiscuss both views and give your own opinion.\n\nGive reasons and include relevant examples.",
  "instructions": "You should spend about 40 minutes on this task.",
  "minimumWords": 250,
  "suggestedMinutes": 40,
  "difficulty": "medium",
  "topic": "Work",
  "tags": ["opinion"]
}
```

- **`examType`**: use `"academic"` or `"general_training"`.
- **`subtype`** can be: `opinion`, `discussion`, `problem_solution`, `advantage_disadvantage`, `direct_question`.

---

## How the app uses this

1. **Source**: Load one question object (e.g. from API, CMS, or JSON file).
2. **Shape**: Ensure it matches one of the three templates above (and the enums).
3. **Render**: Pass it into the app:

   ```tsx
   <WritingQuestionRenderer question={question} />
   ```

4. **Layout choice** (automatic):
   - `academic` + `task1` → Academic Task 1 (visual/report) screen.
   - `general_training` + `task1` → General Task 1 (letter) screen.
   - Any `task2` → Task 2 (essay) screen.

No extra config is needed; `examType` and `taskType` drive the correct layout.

---

## File-based example

You can store questions as JSON files and import or fetch them:

```
content/
  writing/
    questions/
      ac-task1-line-001.json
      ac-task2-opinion-001.json
      gt-task1-formal-001.json
```

Then in code:

```ts
import question from "@/content/writing/questions/ac-task1-line-001.json";
// Validate or cast to WritingQuestion, then:
// <WritingQuestionRenderer question={question} />
```

Use the TypeScript type `WritingQuestion` from `@/lib/writing` to validate or type your loaded data.
