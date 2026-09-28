import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Task,
  DocumentItem,
  AgentExecution,
  AgentStep,
  LearningProgress,
  Badge,
  FocusSessionRecord,
  UserProfile,
  NotificationItem,
  N8nChatMessage,
} from '../types/index.js';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveUnfinishedTasksToTomorrow: () => number;
  documents: DocumentItem[];
  addDocument: (doc: DocumentItem) => void;
  deleteDocument: (id: string) => void;
  agentHistory: AgentExecution[];
  currentExecution: AgentExecution | null;
  runAgentCommand: (query: string) => Promise<AgentExecution>;
  confirmStepExecution: (executionId: string, stepId: string) => void;
  learningProgress: Record<string, LearningProgress>;
  addXP: (category: 'Java' | 'Python' | 'DSA' | 'DBMS' | 'AI', amount: number, correct?: boolean) => void;
  badges: Badge[];
  focusRecords: FocusSessionRecord[];
  addFocusRecord: (record: Omit<FocusSessionRecord, 'id'>) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  productivityScore: number;
  // n8n Chatbot integration
  n8nMessages: N8nChatMessage[];
  sendN8nMessage: (text: string) => Promise<void>;
  isN8nLoading: boolean;
  clearN8nChat: () => void;
  isN8nWidgetOpen: boolean;
  setIsN8nWidgetOpen: (open: boolean) => void;
  n8nWebhookUrl: string;
  setN8nWebhookUrl: (url: string) => void;
  n8nStatus: { reachable: boolean; latencyMs: number; message: string } | null;
  checkN8nStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial sample preloaded documents for instant RAG testing
const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-java-notes',
    title: 'Java_Concurrency_and_Collections_Mastery.pdf',
    fileSize: 142000,
    fileType: 'application/pdf',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    chunkCount: 3,
    status: 'ready',
    preview: 'Java Virtual Machine memory model, HashMap internals, ConcurrentHashMap locks, and ExecutorService thread pools.',
    chunks: [
      {
        id: 'chunk-j-1',
        docId: 'doc-java-notes',
        docTitle: 'Java_Concurrency_and_Collections_Mastery.pdf',
        pageNumber: 1,
        text: 'Java Memory Model (JMM) defines how threads interact through memory. Volatile keyword guarantees visibility across CPU caches and prevents instruction reordering via memory barriers (Happens-Before guarantee). However, volatile does not guarantee compound atomicity (like count++). For atomic compound operations, use AtomicInteger or LongAdder.',
      },
      {
        id: 'chunk-j-2',
        docId: 'doc-java-notes',
        docTitle: 'Java_Concurrency_and_Collections_Mastery.pdf',
        pageNumber: 2,
        text: 'HashMap internal structure in Java 8+: uses an array of Node buckets. When hash collisions exceed 8 nodes in a bucket and the table capacity is >= 64, the linked list transforms into a Red-Black balanced tree (TreeNode), reducing worst-case lookup from O(n) to O(log n). ConcurrentHashMap replaces Java 7 Segment locks with CAS (Compare-And-Swap) and synchronized node heads for lock striping.',
      },
      {
        id: 'chunk-j-3',
        docId: 'doc-java-notes',
        docTitle: 'Java_Concurrency_and_Collections_Mastery.pdf',
        pageNumber: 3,
        text: 'ExecutorService thread pool patterns: FixedThreadPool maintains fixed threads with an unbounded LinkedBlockingQueue, which can risk OutOfMemoryError under extreme traffic. WorkStealingPool utilizes ForkJoinPool for divide-and-conquer parallelism. Always invoke shutdown() and awaitTermination() gracefully in finally blocks.',
      },
    ],
  },
  {
    id: 'doc-dbms-notes',
    title: 'DBMS_ACID_Transactions_and_Indexing.txt',
    fileSize: 89000,
    fileType: 'text/plain',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    chunkCount: 3,
    status: 'ready',
    preview: 'Database normalization rules (1NF to BCNF), B+ Tree indexing mechanisms, and ACID transaction guarantees.',
    chunks: [
      {
        id: 'chunk-db-1',
        docId: 'doc-dbms-notes',
        docTitle: 'DBMS_ACID_Transactions_and_Indexing.txt',
        pageNumber: 1,
        text: 'Database Normalization Hierarchy: 1NF requires atomic values in columns (no repeating sets). 2NF eliminates partial dependencies (all non-key attributes fully dependent on candidate keys). 3NF eliminates transitive dependencies (A -> B -> C). BCNF requires that for every functional dependency X -> Y, X must be a superkey.',
      },
      {
        id: 'chunk-db-2',
        docId: 'doc-dbms-notes',
        docTitle: 'DBMS_ACID_Transactions_and_Indexing.txt',
        pageNumber: 2,
        text: 'B+ Tree Indexing vs B-Tree: In a B+ Tree, data pointers and full records reside exclusively in leaf nodes. Internal nodes contain only routing keys. Leaf nodes are linked sequentially with doubly linked pointers, enabling exceptionally fast range queries and sequential scans with consistent disk block reads.',
      },
      {
        id: 'chunk-db-3',
        docId: 'doc-dbms-notes',
        docTitle: 'DBMS_ACID_Transactions_and_Indexing.txt',
        pageNumber: 3,
        text: 'ACID Guarantees: Atomicity (All or Nothing via Write-Ahead Logging / Undo logs), Consistency (State invariants preserved), Isolation (Controlled concurrent execution using 2-Phase Locking or MVCC), Durability (Committed updates persist permanently via Redo logs). Isolation levels include Read Uncommitted, Read Committed, Repeatable Read, and Serializable.',
      },
    ],
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review Java Concurrency & JMM Memory Barriers',
    category: 'Study',
    priority: 'high',
    estimatedMinutes: 45,
    completed: true,
    dueDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 - 09:45',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Solve 3 B-Tree Indexing and SQL Join Optimization Problems',
    category: 'Code',
    priority: 'high',
    estimatedMinutes: 60,
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 - 11:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Deep Focus Session: LeetCode Graph Traversal (BFS/DFS)',
    category: 'Code',
    priority: 'medium',
    estimatedMinutes: 50,
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    timeSlot: '14:00 - 14:50',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Evening Flashcard Recall: DBMS Normalization Forms',
    category: 'Revision',
    priority: 'low',
    estimatedMinutes: 25,
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    timeSlot: '19:00 - 19:25',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_BADGES: Badge[] = [
  { id: 'b1', title: 'Pioneer Mind', description: 'Initiated first AI command sequence in NOVA', icon: 'Sparkles', category: 'General', unlockedAt: new Date().toISOString() },
  { id: 'b2', title: 'Focus Titan', description: 'Logged over 60 minutes of uninterrupted focus', icon: 'Clock', category: 'Focus', unlockedAt: new Date().toISOString() },
  { id: 'b3', title: 'Algorithm Architect', description: 'Answered 10 DSA questions with >80% accuracy', icon: 'Cpu', category: 'Skill' },
  { id: 'b4', title: 'Database Vanguard', description: 'Mastered SQL & Normalization quiz series', icon: 'Database', category: 'Skill' },
  { id: 'b5', title: 'Knowledge Librarian', description: 'Loaded & queried 25+ chunks in Smart Document Brain', icon: 'FileText', category: 'RAG' },
  { id: 'b6', title: '7-Day Luminary', description: 'Sustained a 7-day unbroken productivity streak', icon: 'Zap', category: 'General' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nova_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'usr_nova_01',
      email: 'alex.vance@nova.ai',
      displayName: 'Alex Vance',
      avatarSeed: 'nova-avatar-7',
      dailyFocusTargetMinutes: 120,
      dailyTaskTarget: 5,
      joinedDate: 'September 2026',
      isGuest: false,
    };
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('nova_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('nova_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DOCUMENTS;
  });

  const [agentHistory, setAgentHistory] = useState<AgentExecution[]>(() => {
    const saved = localStorage.getItem('nova_agent_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [currentExecution, setCurrentExecution] = useState<AgentExecution | null>(null);

  const [learningProgress, setLearningProgress] = useState<Record<string, LearningProgress>>(() => {
    const saved = localStorage.getItem('nova_learning');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      Java: { category: 'Java', level: 3, xp: 480, totalQuestionsAnswered: 18, correctAnswers: 15, completedRoadmapTopics: ['OOP Basics', 'Exceptions', 'Collections Framework'] },
      Python: { category: 'Python', level: 2, xp: 260, totalQuestionsAnswered: 10, correctAnswers: 8, completedRoadmapTopics: ['Data Types', 'Decorators'] },
      DSA: { category: 'DSA', level: 4, xp: 750, totalQuestionsAnswered: 24, correctAnswers: 20, completedRoadmapTopics: ['Arrays', 'Linked Lists', 'Binary Trees', 'Heaps'] },
      DBMS: { category: 'DBMS', level: 3, xp: 520, totalQuestionsAnswered: 16, correctAnswers: 14, completedRoadmapTopics: ['Relational Model', 'SQL Joins', 'Normalization'] },
      AI: { category: 'AI', level: 2, xp: 340, totalQuestionsAnswered: 12, correctAnswers: 10, completedRoadmapTopics: ['Linear Algebra', 'Attention Mechanisms'] },
    };
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('nova_badges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_BADGES;
  });

  const [focusRecords, setFocusRecords] = useState<FocusSessionRecord[]>(() => {
    const saved = localStorage.getItem('nova_focus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'f-1', durationMinutes: 25, mode: 'focus', completedAt: new Date(Date.now() - 3600000 * 3).toISOString(), associatedTaskTitle: 'Review Java Concurrency' },
      { id: 'f-2', durationMinutes: 25, mode: 'focus', completedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), associatedTaskTitle: 'Java Practice Drills' },
      { id: 'f-3', durationMinutes: 5, mode: 'short_break', completedAt: new Date(Date.now() - 3600000 * 1.4).toISOString() },
    ];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', title: 'System Optimized', message: 'NOVA Agent model connected with high-speed inference.', timestamp: 'Just now', read: false, type: 'info' },
    { id: 'n2', title: 'Learning Streak Active', message: 'You are on a 5-day continuous study streak!', timestamp: '2 hours ago', read: false, type: 'success' },
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // n8n Chatbot Integration State
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('nova_n8n_url') || 'https://madhulathachintala5.app.n8n.cloud/webhook/95eec8f3-24c0-463d-94cb-4eeba2ee262a/chat';
  });

  const [n8nSessionId] = useState<string>(() => {
    let sid = localStorage.getItem('nova_n8n_sid');
    if (!sid) {
      sid = `nova_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('nova_n8n_sid', sid);
    }
    return sid;
  });

  const [n8nMessages, setN8nMessages] = useState<N8nChatMessage[]>(() => {
    const saved = localStorage.getItem('nova_n8n_msgs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: "👋 Hello! I am your **n8n AI Chatbot**, connected directly to your cloud webhook workflow.\n\nI can execute custom automation sequences, search specialized knowledge bases, answer queries, or coordinate tasks with your NOVA workspace. How can I assist you right now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const [isN8nWidgetOpen, setIsN8nWidgetOpen] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<{ reachable: boolean; latencyMs: number; message: string } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('nova_n8n_url', n8nWebhookUrl);
  }, [n8nWebhookUrl]);

  useEffect(() => {
    localStorage.setItem('nova_n8n_msgs', JSON.stringify(n8nMessages));
  }, [n8nMessages]);

  const checkN8nStatus = async () => {
    try {
      const res = await fetch(`/api/n8n/status?url=${encodeURIComponent(n8nWebhookUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setN8nStatus({
          reachable: data.reachable,
          latencyMs: data.latencyMs,
          message: data.message,
        });
      }
    } catch (err: any) {
      setN8nStatus({
        reachable: false,
        latencyMs: 0,
        message: err.message || 'Offline',
      });
    }
  };

  const clearN8nChat = () => {
    const welcomeMsg: N8nChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Chat cleared. Ready for your next command or automation prompt!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setN8nMessages([welcomeMsg]);
    addToast('n8n conversation cleared', 'info');
  };

  const sendN8nMessage = async (text: string) => {
    if (!text.trim() || isN8nLoading) return;

    const userMsg: N8nChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setN8nMessages((prev) => [...prev, userMsg]);
    setIsN8nLoading(true);

    try {
      const res = await fetch('/api/n8n/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: text.trim(),
          message: text.trim(),
          sessionId: n8nSessionId,
          webhookUrl: n8nWebhookUrl,
          context: {
            user: user.displayName,
            tasksCount: tasks.length,
            completedTasks: tasks.filter((t) => t.completed).length,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();

      const botReply: N8nChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.output || 'Received response from n8n workflow.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: data.latencyMs,
        status: data.success ? 'sent' : 'error',
        rawResponse: data.raw,
      };

      setN8nMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('n8n sending error:', err);
      const errorReply: N8nChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failed to reach n8n webhook: ${err.message}. Please verify that your n8n workflow is active and listening at \`${n8nWebhookUrl}\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };
      setN8nMessages((prev) => [...prev, errorReply]);
      addToast('n8n chatbot error: ' + err.message, 'error');
    } finally {
      setIsN8nLoading(false);
    }
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('nova_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nova_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nova_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('nova_learning', JSON.stringify(learningProgress));
  }, [learningProgress]);

  useEffect(() => {
    localStorage.setItem('nova_focus', JSON.stringify(focusRecords));
  }, [focusRecords]);

  useEffect(() => {
    localStorage.setItem('nova_agent_history', JSON.stringify(agentHistory));
  }, [agentHistory]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast(`Task "${newTask.title}" added to planner`, 'success');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.completed !== undefined) {
            updated.completedAt = updates.completed ? new Date().toISOString() : undefined;
            if (updates.completed) {
              addXP('DSA', 25);
              addToast(`Task completed! +25 XP`, 'success');
            }
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast('Task removed from planner', 'info');
  };

  const moveUnfinishedTasksToTomorrow = (): number => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let count = 0;
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed) {
          count++;
          return { ...t, dueDate: tomorrowStr };
        }
        return t;
      })
    );
    if (count > 0) {
      addToast(`Rescheduled ${count} unfinished tasks to tomorrow`, 'success');
    } else {
      addToast('All tasks are already completed!', 'info');
    }
    return count;
  };

  const addDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
    addToast(`"${doc.title}" indexed with ${doc.chunkCount} neural chunks!`, 'success');
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    addToast('Document removed from knowledge base', 'info');
  };

  const addXP = (category: 'Java' | 'Python' | 'DSA' | 'DBMS' | 'AI', amount: number, correct = true) => {
    setLearningProgress((prev) => {
      const current = prev[category] || {
        category,
        level: 1,
        xp: 0,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        completedRoadmapTopics: [],
      };
      const newXP = current.xp + amount;
      const newLevel = Math.floor(newXP / 250) + 1;
      const newTotal = current.totalQuestionsAnswered + 1;
      const newCorrect = correct ? current.correctAnswers + 1 : current.correctAnswers;

      if (newLevel > current.level) {
        addToast(`🎉 Level Up! You reached Level ${newLevel} in ${category}!`, 'success');
      }

      return {
        ...prev,
        [category]: {
          ...current,
          xp: newXP,
          level: newLevel,
          totalQuestionsAnswered: newTotal,
          correctAnswers: newCorrect,
        },
      };
    });
  };

  const addFocusRecord = (recordData: Omit<FocusSessionRecord, 'id'>) => {
    const newRecord: FocusSessionRecord = {
      ...recordData,
      id: `f-${Date.now()}`,
    };
    setFocusRecords((prev) => [newRecord, ...prev]);
    if (recordData.mode === 'focus') {
      const xpGained = recordData.durationMinutes * 2;
      addXP('AI', xpGained);
      addToast(`Focus session recorded! +${xpGained} XP awarded`, 'success');
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Agent execution runner
  const runAgentCommand = async (query: string): Promise<AgentExecution> => {
    const executionId = `exec-${Date.now()}`;
    const initialExecution: AgentExecution = {
      id: executionId,
      query,
      timestamp: new Date().toISOString(),
      intent: 'Analyzing intent...',
      status: 'planning',
      steps: [
        {
          id: 'step-plan',
          title: 'Deconstruct user intent and formulate tool sequence',
          description: `Parsing semantic structure for "${query}"`,
          status: 'running',
          tool: 'analyze',
        },
      ],
    };

    setCurrentExecution(initialExecution);

    try {
      const res = await fetch('/api/agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: {
            tasks,
            documents: documents.map((d) => ({ title: d.title, chunkCount: d.chunkCount })),
            learningProgress,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      // Check if tasks were created and add them to planner
      if (Array.isArray(data.createdTasks) && data.createdTasks.length > 0) {
        setTasks((prev) => [...data.createdTasks, ...prev]);
        addToast(`Agent added ${data.createdTasks.length} tasks to your planner!`, 'success');
      }

      // Check for moveUnfinishedTasks tool action
      const hasMoveTool = data.steps?.some((s: AgentStep) => s.tool === 'moveUnfinishedTasks');
      if (hasMoveTool) {
        moveUnfinishedTasksToTomorrow();
      }

      const finalExecution: AgentExecution = {
        id: executionId,
        query,
        timestamp: new Date().toISOString(),
        intent: data.intent || 'Command Execution',
        status: data.status || 'completed',
        steps: data.steps || [],
        finalResponse: data.finalResponse,
        sources: data.sources || [],
        createdTasks: data.createdTasks || [],
      };

      setCurrentExecution(finalExecution);
      setAgentHistory((prev) => [finalExecution, ...prev]);
      return finalExecution;
    } catch (err: any) {
      console.error('Agent execution error:', err);
      const failedExecution: AgentExecution = {
        id: executionId,
        query,
        timestamp: new Date().toISOString(),
        intent: 'Command Parsing',
        status: 'failed',
        steps: [
          {
            id: 'step-fail',
            title: 'Execution Interrupted',
            description: err.message || 'Could not complete agent command.',
            status: 'failed',
            error: err.message,
          },
        ],
        finalResponse: `I encountered an issue processing your command: ${err.message}. Please try again or rephrase your request.`,
      };
      setCurrentExecution(failedExecution);
      setAgentHistory((prev) => [failedExecution, ...prev]);
      addToast('Agent execution failed: ' + err.message, 'error');
      return failedExecution;
    }
  };

  const confirmStepExecution = (executionId: string, stepId: string) => {
    setCurrentExecution((prev) => {
      if (!prev || prev.id !== executionId) return prev;
      const updatedSteps = prev.steps.map((s) => (s.id === stepId ? { ...s, status: 'completed' as const } : s));
      const allDone = updatedSteps.every((s) => s.status === 'completed');
      return {
        ...prev,
        status: allDone ? ('completed' as const) : prev.status,
        steps: updatedSteps,
      };
    });
    addToast('Action confirmed and executed successfully', 'success');
  };

  // Productivity Score Calculation based on transparent user activity:
  // (Tasks completed / total tasks) * 40 + (Focus minutes / target minutes) * 40 + (Study actions) * 20
  const completedCount = tasks.filter((t) => t.completed).length;
  const taskComponent = tasks.length > 0 ? (completedCount / tasks.length) * 40 : 20;
  const totalFocusMinutesToday = focusRecords
    .filter((f) => f.mode === 'focus')
    .reduce((sum, f) => sum + f.durationMinutes, 0);
  const focusComponent = Math.min((totalFocusMinutesToday / user.dailyFocusTargetMinutes) * 40, 40);
  const learningComponent = 15; // active learning baseline
  const productivityScore = Math.min(Math.round(taskComponent + focusComponent + learningComponent), 100);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        moveUnfinishedTasksToTomorrow,
        documents,
        addDocument,
        deleteDocument,
        agentHistory,
        currentExecution,
        runAgentCommand,
        confirmStepExecution,
        learningProgress,
        addXP,
        badges,
        focusRecords,
        addFocusRecord,
        notifications,
        markNotificationRead,
        clearNotifications,
        toasts,
        addToast,
        removeToast,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        productivityScore,
        n8nMessages,
        sendN8nMessage,
        isN8nLoading,
        clearN8nChat,
        isN8nWidgetOpen,
        setIsN8nWidgetOpen,
        n8nWebhookUrl,
        setN8nWebhookUrl,
        n8nStatus,
        checkN8nStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
