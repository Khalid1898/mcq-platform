export {
  EXAM_TYPES,
  TASK_TYPES,
  ACADEMIC_TASK1_SUBTYPES,
  GENERAL_TASK1_SUBTYPES,
  TASK2_SUBTYPES,
  WRITING_SCREEN_TYPES,
  isAcademicTask1,
  isGeneralTask1,
  isTask2,
} from "./types";
export type {
  ExamType,
  TaskType,
  WritingSubtype,
  AcademicTask1Subtype,
  GeneralTask1Subtype,
  Task2Subtype,
  WritingScreenType,
  BaseWritingQuestion,
  AcademicTask1Question,
  GeneralTask1Question,
  Task2Question,
  WritingQuestion,
} from "./types";
export { getScreenType, SUBTYPE_LABELS } from "./renderConfig";
export { SAMPLE_WRITING_QUESTIONS } from "./sampleQuestions";
export {
  ACADEMIC_TASK1_TEMPLATE,
  GENERAL_TASK1_TEMPLATE,
  TASK2_TEMPLATE,
} from "./template";
export {
  academicTask1LineGraphQuestions,
  academicTask1ProcessDiagramQuestions,
  generalTask1FormalLetterQuestions,
  academicTask2OpinionQuestions,
  academicTask2DiscussionQuestions,
  ALL_WRITING_QUESTIONS,
  getQuestionById,
  getQuestionsBySubtype,
  getQuestionsByExamType,
  getQuestionsByTaskType,
} from "./collections";
