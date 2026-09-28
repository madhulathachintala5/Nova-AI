export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'Study' | 'Code' | 'Life' | 'Work' | 'Revision';
  priority: Priority;
  estimatedMinutes: number;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  timeSlot?: string; // e.g. "09:00 - 10:00"
  createdAt: string;
  completedAt?: string;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  pageNumber?: number;
  text: string;
  embedding?: number[];
}

export interface DocumentItem {
  id: string;
  title: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  chunkCount: number;
  preview: string;
  status: 'ready' | 'processing' | 'error';
  chunks: DocumentChunk[];
}

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'needs_confirmation';
  tool?: string;
  result?: any;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
}

export interface AgentExecution {
  id: string;
  query: string;
  timestamp: string;
  intent: string;
  status: 'planning' | 'running' | 'completed' | 'failed' | 'awaiting_confirmation';
  steps: AgentStep[];
  finalResponse?: string;
  sources?: Array<{ title: string; url?: string; snippet?: string }>;
  createdTasks?: Task[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface QuizSession {
  id: string;
  category: 'Java' | 'Python' | 'DSA' | 'DBMS' | 'AI';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: number[];
  score: number;
  completed: boolean;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: string;
}

export interface LearningProgress {
  category: 'Java' | 'Python' | 'DSA' | 'DBMS' | 'AI';
  level: number;
  xp: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  completedRoadmapTopics: string[];
}

export interface FocusSessionRecord {
  id: string;
  durationMinutes: number;
  mode: 'focus' | 'short_break' | 'long_break';
  completedAt: string;
  associatedTaskTitle?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarSeed: string;
  dailyFocusTargetMinutes: number;
  dailyTaskTarget: number;
  joinedDate: string;
  isGuest: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

export interface N8nChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  latencyMs?: number;
  status?: 'sending' | 'sent' | 'error';
  rawResponse?: any;
}
