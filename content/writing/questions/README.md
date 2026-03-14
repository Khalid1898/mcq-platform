# Writing questions

Put your IELTS Writing question JSON files here.

**Template and field reference:** see **`docs/WRITING-MATERIAL-TEMPLATE.md`** in this project (full field list and examples).

**Blank files to copy and fill:**
- `blank-academic-task1.json` – Academic Task 1 (chart/diagram/map)
- `blank-general-task1.json` – General Training Task 1 (letter)
- `blank-task2.json` – Task 2 essay

Duplicate a blank file, rename it (e.g. `my-question-001.json`), then fill in the values.

**Use in the app:** import the JSON and pass it to the renderer:

```tsx
import myQuestion from "@/content/writing/questions/my-question-001.json";
import { WritingQuestionRenderer } from "@/components/writing";

<WritingQuestionRenderer question={myQuestion} />
```

Or add your question to the demo: in `app/writing-demo/page.tsx`, import your JSON and add it to the list of questions.
