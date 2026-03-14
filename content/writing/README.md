# Writing content

TypeScript collection files live here. Each file exports one array of questions for a subtype.

## Adding more questions

**To an existing type**  
Edit the right file and add new question objects to the array. No other changes needed — the app will pick them up automatically.

| Want to add… | Edit this file |
|--------------|----------------|
| More Academic Task 1 line graphs | `academic-task1-line-graph.ts` |
| More Academic Task 1 process diagrams | `academic-task1-process-diagram.ts` |
| More General Task 1 formal letters | `general-task1-formal-letter.ts` |
| More Academic Task 2 opinion | `academic-task2-opinion.ts` |
| More Academic Task 2 discussion | `academic-task2-discussion.ts` |

**A new subtype** (e.g. first time adding bar_chart or informal_letter)  
1. Add a new file, e.g. `academic-task1-bar-chart.ts`, with the same shape as the existing files (export an array of question objects).  
2. In `lib/writing/collections.ts`: import that array and add it to `ALL_WRITING_QUESTIONS`, and re-export the new array if you want it named.

Schema and field reference: **`docs/WRITING-MATERIAL-TEMPLATE.md`**.
