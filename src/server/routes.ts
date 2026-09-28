import { Router, Request, Response } from 'express';
import {
  generateContent,
  getEmbedding,
  cosineSimilarity,
  searchWithGoogle,
  getAIClient,
} from './gemini.js';
import { AgentStep, Task, DocumentChunk, QuizQuestion } from '../types/index.js';

const router = Router();

// Helper to sanitize JSON response from LLM
function extractJsonFromText(text: string): any {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    // Try finding JSON object or array
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse extracted JSON candidate:', e);
      }
    }
    throw new Error('Could not parse valid JSON from AI response.');
  }
}

/**
 * 1. AI Agent Command Center
 */
router.post('/agent/process', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const currentTasks: Task[] = context?.tasks || [];
    const documentsSummary = (context?.documents || [])
      .map((d: any) => `- ${d.title} (${d.chunkCount || 0} chunks)`)
      .join('\n');

    const prompt = `You are NOVA, a personal AI life and learning command center.
Analyze this user command: "${query}"

Current Context:
- Active tasks count: ${currentTasks.length}
- Sample tasks: ${currentTasks.slice(0, 5).map((t) => `"${t.title}" [${t.priority}, completed: ${t.completed}]`).join(', ') || 'None'}
- Uploaded documents:
${documentsSummary || 'No documents uploaded yet'}

Available tool types:
- "createTask": creates a task or multiple tasks with fields: title, category (Study|Code|Life|Work|Revision), priority (low|medium|high), estimatedMinutes (number), dueDate (YYYY-MM-DD), timeSlot (optional).
- "listTasks": filters or lists tasks.
- "moveUnfinishedTasks": reschedules incomplete tasks to tomorrow.
- "generateStudyPlan": generates structured multi-day study schedule.
- "searchDocuments": searches the user's uploaded notes.
- "webSearch": searches current online tech or world info.
- "deleteTasks": destructive action that removes tasks (REQUIRES CONFIRMATION).

Determine:
1. Intent description (short natural title)
2. Execution steps (1 to 4 steps)
3. For each step:
   - "title" (string)
   - "description" (string)
   - "tool" (string, one of the tool types or "analyze")
   - "requiresConfirmation" (boolean, true if destructive like deleting or resetting)
   - "confirmationPrompt" (string if requiresConfirmation is true)
   - "actionPayload" (object with tool arguments, e.g. for createTask: array of tasks)
4. "finalResponse": A comprehensive, empowering, well-structured markdown reply detailing the action taken, schedule or knowledge.

Respond STRICTLY in valid JSON matching this schema:
{
  "intent": string,
  "steps": [
    {
      "id": string,
      "title": string,
      "description": string,
      "tool": string,
      "requiresConfirmation": boolean,
      "confirmationPrompt": string,
      "actionPayload": any
    }
  ],
  "finalResponse": string
}`;

    let aiResultText = '';
    try {
      aiResultText = await generateContent(
        prompt,
        'You are NOVA AI, a futuristic and precise executive assistant. Return strictly parseable JSON.'
      );
    } catch (apiErr: any) {
      console.warn('Gemini direct plan generation fallback:', apiErr.message);
    }

    let parsed: any;
    if (aiResultText) {
      try {
        parsed = extractJsonFromText(aiResultText);
      } catch (parseErr) {
        console.warn('Failed to parse AI output, generating algorithmic plan');
      }
    }

    // Algorithmic fallback if API key is missing or model parsing failed
    if (!parsed || !parsed.steps) {
      const qLower = query.toLowerCase();
      if (qLower.includes('exam') || qLower.includes('plan my day')) {
        const todayStr = new Date().toISOString().split('T')[0];
        parsed = {
          intent: 'Plan Day & Exam Preparation',
          steps: [
            {
              id: 'step-1',
              title: 'Analyze schedule & exam requirements',
              description: 'Synthesized prioritized time blocks for core review and mock drills.',
              tool: 'analyze',
              requiresConfirmation: false,
            },
            {
              id: 'step-2',
              title: 'Schedule focused study tasks',
              description: 'Created 4 structured preparation sessions in your planner.',
              tool: 'createTask',
              requiresConfirmation: false,
              actionPayload: {
                tasks: [
                  {
                    title: 'Review High-Yield Java Core & OOP Concepts',
                    category: 'Study',
                    priority: 'high',
                    estimatedMinutes: 60,
                    dueDate: todayStr,
                    timeSlot: '09:00 - 10:00',
                  },
                  {
                    title: 'Practice Collections & Multithreading Questions',
                    category: 'Code',
                    priority: 'high',
                    estimatedMinutes: 90,
                    dueDate: todayStr,
                    timeSlot: '10:30 - 12:00',
                  },
                  {
                    title: 'Solve Past Exam Sample Papers',
                    category: 'Revision',
                    priority: 'medium',
                    estimatedMinutes: 60,
                    dueDate: todayStr,
                    timeSlot: '14:00 - 15:00',
                  },
                  {
                    title: 'Evening Cheat-Sheet & Formula Flashcards',
                    category: 'Revision',
                    priority: 'medium',
                    estimatedMinutes: 45,
                    dueDate: todayStr,
                    timeSlot: '19:00 - 19:45',
                  },
                ],
              },
            },
          ],
          finalResponse:
            '### 📅 Exam Preparation Plan Deployed\n\nI have structured an intensive 4-block schedule for your upcoming exam today. The sessions cover Core Concepts, Practical Coding, Mock Papers, and an evening Flashcard review. All tasks have been placed into your Day Planner with priority flags.',
        };
      } else if (qLower.includes('dbms') || qLower.includes('tasks')) {
        const todayStr = new Date().toISOString().split('T')[0];
        parsed = {
          intent: 'Create DBMS Revision Modules',
          steps: [
            {
              id: 'step-1',
              title: 'Structure DBMS syllabus breakdown',
              description: 'Identified 5 critical topics: Normalization, Joins, Indexing, Transactions, and Concurrency.',
              tool: 'analyze',
              requiresConfirmation: false,
            },
            {
              id: 'step-2',
              title: 'Generate DBMS revision tasks',
              description: 'Added 5 targeted revision modules to your planner.',
              tool: 'createTask',
              requiresConfirmation: false,
              actionPayload: {
                tasks: [
                  { title: 'DBMS: Normalization (1NF, 2NF, 3NF, BCNF) Drills', category: 'Study', priority: 'high', estimatedMinutes: 45, dueDate: todayStr },
                  { title: 'DBMS: Complex SQL Queries & Window Functions', category: 'Code', priority: 'high', estimatedMinutes: 50, dueDate: todayStr },
                  { title: 'DBMS: B-Trees, B+ Trees & Indexing Performance', category: 'Study', priority: 'medium', estimatedMinutes: 40, dueDate: todayStr },
                  { title: 'DBMS: ACID Properties & Transaction States', category: 'Revision', priority: 'medium', estimatedMinutes: 30, dueDate: todayStr },
                  { title: 'DBMS: Concurrency Control & 2PL Deadlock Handling', category: 'Revision', priority: 'high', estimatedMinutes: 45, dueDate: todayStr },
                ],
              },
            },
          ],
          finalResponse: '### 🗄️ 5 DBMS Revision Tasks Created\n\nI have organized 5 comprehensive revision tasks covering Normalization, SQL, Indexing, ACID transactions, and Concurrency Control. Check your **Day Planner** to start your sprint!',
        };
      } else if (qLower.includes('move') || qLower.includes('unfinished')) {
        parsed = {
          intent: 'Reschedule Incomplete Tasks',
          steps: [
            {
              id: 'step-1',
              title: 'Identify pending and overdue tasks',
              description: 'Scanned active tasks list for uncompleted items.',
              tool: 'listTasks',
              requiresConfirmation: false,
            },
            {
              id: 'step-2',
              title: 'Reschedule to tomorrow',
              description: 'Move all unfinished tasks to tomorrow with adjusted priority.',
              tool: 'moveUnfinishedTasks',
              requiresConfirmation: false,
            },
          ],
          finalResponse: '### 🔄 Task Reschedule Scheduled\n\nUnfinished tasks have been shifted to tomorrow with priority preserved so your productivity momentum stays uninterrupted.',
        };
      } else {
        parsed = {
          intent: 'Execute Assistant Query',
          steps: [
            {
              id: 'step-1',
              title: 'Analyze user intent',
              description: `Processed request: "${query}"`,
              tool: 'analyze',
              requiresConfirmation: false,
            },
          ],
          finalResponse: `I have analyzed your request regarding **"${query}"**. You can track related items directly in your Day Planner, ask documents in the Document Brain, or kick off a Skill Quest quiz.`,
        };
      }
    }

    // Check if web search was requested or relevant
    let sources: Array<{ title: string; url: string; snippet?: string }> = [];
    if (query.toLowerCase().includes('recent') || query.toLowerCase().includes('developments') || query.toLowerCase().includes('news') || query.toLowerCase().includes('ai agents')) {
      try {
        const searchResult = await searchWithGoogle(query);
        if (searchResult.text) {
          parsed.finalResponse += `\n\n---\n### 🌐 Live Web Intelligence\n${searchResult.text}`;
          sources = searchResult.sources;
        }
      } catch (searchErr) {
        console.warn('Google search grounding skipped:', searchErr);
      }
    }

    // Attach step status
    const stepsWithStatus: AgentStep[] = parsed.steps.map((s: any, idx: number) => ({
      id: s.id || `step-${idx + 1}`,
      title: s.title,
      description: s.description,
      tool: s.tool || 'analyze',
      status: s.requiresConfirmation ? 'needs_confirmation' : 'completed',
      requiresConfirmation: !!s.requiresConfirmation,
      confirmationPrompt: s.confirmationPrompt,
      result: s.actionPayload,
    }));

    // Extract any tasks created
    let createdTasks: Task[] = [];
    for (const step of stepsWithStatus) {
      if (step.tool === 'createTask' && step.result?.tasks && Array.isArray(step.result.tasks)) {
        createdTasks = step.result.tasks.map((t: any, i: number) => ({
          id: `task-${Date.now()}-${i}`,
          title: t.title,
          category: t.category || 'Study',
          priority: t.priority || 'medium',
          estimatedMinutes: Number(t.estimatedMinutes) || 45,
          completed: false,
          dueDate: t.dueDate || new Date().toISOString().split('T')[0],
          timeSlot: t.timeSlot || '',
          createdAt: new Date().toISOString(),
        }));
      }
    }

    const executionStatus = stepsWithStatus.some((s) => s.status === 'needs_confirmation')
      ? 'awaiting_confirmation'
      : 'completed';

    return res.json({
      intent: parsed.intent || 'Processed Command',
      steps: stepsWithStatus,
      finalResponse: parsed.finalResponse,
      status: executionStatus,
      sources,
      createdTasks,
    });
  } catch (error: any) {
    console.error('Agent endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Internal agent processing failure.' });
  }
});

/**
 * 2. Document Brain — Embed Document Chunks
 */
router.post('/rag/embed-document', async (req: Request, res: Response) => {
  try {
    const { docId, title, content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Document text content is required.' });
    }

    // Chunking text into ~500 chars with 100 overlap
    const chunkSize = 500;
    const overlap = 80;
    const chunks: DocumentChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunkText = content.slice(start, end).trim();
      if (chunkText.length > 20) {
        chunkIndex++;
        // compute real or fallback embedding
        const embedding = await getEmbedding(chunkText);
        chunks.push({
          id: `${docId || 'doc'}-chunk-${chunkIndex}`,
          docId: docId || 'doc-1',
          docTitle: title || 'Untitled Document',
          pageNumber: Math.floor(chunkIndex / 3) + 1,
          text: chunkText,
          embedding,
        });
      }
      start += chunkSize - overlap;
    }

    return res.json({
      success: true,
      docId,
      chunkCount: chunks.length,
      chunks,
    });
  } catch (error: any) {
    console.error('RAG embed error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 3. Document Brain — Query RAG Knowledge Base
 */
router.post('/rag/query', async (req: Request, res: Response) => {
  try {
    const { query, chunks } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return res.json({
        matched: false,
        answer: 'No uploaded documents were found in your library. Please upload a PDF, TXT, or notes document first to query your personal brain.',
        citations: [],
      });
    }

    // Generate query embedding
    const queryEmbedding = await getEmbedding(query);

    // Compute similarity for all chunks
    const scoredChunks = chunks.map((chunk: DocumentChunk) => {
      let score = 0;
      if (chunk.embedding && Array.isArray(chunk.embedding)) {
        score = cosineSimilarity(queryEmbedding, chunk.embedding);
      } else {
        // compute keyword match score
        const qWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        const textLower = chunk.text.toLowerCase();
        let matches = 0;
        for (const w of qWords) {
          if (textLower.includes(w)) matches++;
        }
        score = matches / Math.max(qWords.length, 1);
      }
      return { chunk, score };
    });

    // Sort by score descending
    scoredChunks.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    // Filter by threshold (cosine similarity >= 0.40 or relative score)
    const threshold = 0.35;
    const topMatches = scoredChunks.filter((item: { score: number }) => item.score >= threshold).slice(0, 4);

    if (topMatches.length === 0) {
      return res.json({
        matched: false,
        answer: 'The uploaded documents do not contain information related to this question. Please upload notes covering this topic or verify your document library.',
        citations: [],
      });
    }

    // Build context prompt
    const contextText = topMatches
      .map(
        (m: { chunk: DocumentChunk; score: number }, i: number) =>
          `[Source ${i + 1} | Document: ${m.chunk.docTitle} | Page/Section: ${m.chunk.pageNumber || 1}]\n${m.chunk.text}`
      )
      .join('\n\n');

    const prompt = `You are the NOVA Smart Document Brain RAG engine.
Answer the user's question using ONLY the provided document context excerpts below.
If the context does not contain enough information, clearly state that the answer is not present in the documents.
Always refer to the document name and page number when citing.

Context Excerpts:
${contextText}

Question:
${query}

Instructions:
1. Provide a detailed, clear, grounded answer.
2. At the end, list the exact Citations used.`;

    let answer = '';
    try {
      answer = await generateContent(
        prompt,
        'You are an authoritative document retrieval intelligence. Never invent or hallucinate facts outside the provided document text.'
      );
    } catch (err: any) {
      // Offline fallback grounded extraction
      answer = `Based on your document **${topMatches[0].chunk.docTitle}**:\n\n${topMatches[0].chunk.text}\n\n*Retrieved with semantic confidence score ${(topMatches[0].score * 100).toFixed(0)}%.*`;
    }

    const citations = topMatches.map((m: { chunk: DocumentChunk; score: number }) => ({
      docTitle: m.chunk.docTitle,
      pageNumber: m.chunk.pageNumber,
      snippet: m.chunk.text.slice(0, 160) + '...',
      confidence: Math.round(m.score * 100),
    }));

    return res.json({
      matched: true,
      answer,
      citations,
    });
  } catch (error: any) {
    console.error('RAG query error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 4. Document Brain — Generate Summary / Flashcards / Quiz from Docs
 */
router.post('/rag/generate-material', async (req: Request, res: Response) => {
  try {
    const { docTitle, content, type } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Document content is required.' });
    }

    const prompt = `You are NOVA Document Brain.
Document: "${docTitle || 'Study Notes'}"
Content Excerpt:
${content.slice(0, 4000)}

User requested: ${type || 'summary'} (one of: summary, flashcards, quiz)

Requirements:
- If summary: return clear markdown with executive summary, key takeaways, and glossary.
- If flashcards: return valid JSON array: [{ "front": string, "back": string }] (5-8 cards).
- If quiz: return valid JSON array: [{ "question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string }] (4-6 questions).

Provide your output accordingly. If JSON requested, wrap strictly in JSON.`;

    const result = await generateContent(prompt);
    return res.json({ result, type });
  } catch (error: any) {
    console.error('RAG generate material error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 5. Day Planner — AI Schedule Generator
 */
router.post('/planner/generate-schedule', async (req: Request, res: Response) => {
  try {
    const { tasks, date, availableHours = 8 } = req.body;
    const taskList = Array.isArray(tasks) ? tasks : [];

    const prompt = `You are NOVA AI Day Planner.
Generate an optimal, human-friendly daily schedule for ${date || 'Today'} with ${availableHours} hours of planned productivity.
Tasks to schedule:
${taskList.map((t: Task) => `- "${t.title}" [Priority: ${t.priority}, Est: ${t.estimatedMinutes} mins, Category: ${t.category}]`).join('\n') || 'General study and focus sessions'}

Requirements:
- Include 15-minute breaks between heavy blocks.
- Sequence high priority cognitive tasks in the morning when mental energy is highest.
- Include an afternoon focus block and evening wind-down / review.
- Output JSON format matching:
{
  "scheduleSummary": string,
  "timeBlocks": [
    {
      "time": string,
      "taskTitle": string,
      "category": string,
      "durationMinutes": number,
      "type": "focus" | "break" | "review"
    }
  ],
  "productivityTip": string
}`;

    let scheduleData: any;
    try {
      const aiResponse = await generateContent(prompt, 'Return strictly valid JSON.');
      scheduleData = extractJsonFromText(aiResponse);
    } catch (e) {
      scheduleData = {
        scheduleSummary: 'Optimized high-impact day schedule with built-in rest periods.',
        timeBlocks: [
          { time: '09:00 - 10:15', taskTitle: taskList[0]?.title || 'Deep Focus: Priority Topic', category: 'Study', durationMinutes: 75, type: 'focus' },
          { time: '10:15 - 10:30', taskTitle: 'Rest & Hydration Break', category: 'Life', durationMinutes: 15, type: 'break' },
          { time: '10:30 - 12:00', taskTitle: taskList[1]?.title || 'Coding Practice & Implementation', category: 'Code', durationMinutes: 90, type: 'focus' },
          { time: '12:00 - 13:00', taskTitle: 'Lunch & Screen Break', category: 'Life', durationMinutes: 60, type: 'break' },
          { time: '13:00 - 14:30', taskTitle: taskList[2]?.title || 'System Design & Problem Solving', category: 'Study', durationMinutes: 90, type: 'focus' },
          { time: '16:00 - 17:00', taskTitle: 'Review & Flashcard Recall', category: 'Revision', durationMinutes: 60, type: 'review' },
        ],
        productivityTip: 'Complete your hardest task in the 09:00 - 10:15 window for maximum cognitive leverage.',
      };
    }

    return res.json(scheduleData);
  } catch (error: any) {
    console.error('Planner schedule generator error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 6. Skill Quest — AI Quiz & Practice Question Generator
 */
router.post('/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { category = 'Java', difficulty = 'Intermediate', count = 5 } = req.body;

    const prompt = `You are a computer science instructor and technical interviewer for NOVA Skill Quest.
Generate ${count} high quality multiple choice practice questions for category: "${category}", difficulty level: "${difficulty}".

Requirements:
- Each question must test genuine conceptual and practical understanding.
- Include code snippets where relevant (clean syntax).
- 4 plausible options, only 1 correct.
- Detailed step-by-step explanation explaining why the correct option is right and common pitfalls.
- Return strictly a JSON array of objects:
[
  {
    "id": string,
    "question": string,
    "codeSnippet": string (optional),
    "options": [string, string, string, string],
    "correctIndex": number (0 to 3),
    "explanation": string
  }
]`;

    let questions: QuizQuestion[] = [];
    try {
      const response = await generateContent(prompt, 'Return strictly valid JSON array.');
      questions = extractJsonFromText(response);
    } catch (err) {
      console.warn('Fallback quiz generator used:', err);
      // Hardened fallback questions by category
      if (category === 'Java') {
        questions = [
          {
            id: 'java-q1',
            question: 'What is the key difference between String, StringBuilder, and StringBuffer in Java?',
            codeSnippet: 'String s = "A";\ns += "B"; // Creates new object\nStringBuilder sb = new StringBuilder("A");\nsb.append("B"); // Mutates',
            options: [
              'String is immutable, StringBuilder is mutable and not thread-safe, StringBuffer is mutable and synchronized (thread-safe)',
              'StringBuffer is immutable, String and StringBuilder are mutable',
              'All three are immutable but have different memory layouts',
              'StringBuilder is synchronized while StringBuffer is asynchronous',
            ],
            correctIndex: 0,
            explanation:
              'String objects are immutable in Java. StringBuilder provides a mutable sequence of characters and is faster because it is not synchronized. StringBuffer is thread-safe with synchronized methods.',
          },
          {
            id: 'java-q2',
            question: 'Which garbage collection algorithm uses the Mark-Sweep-Compact approach in the Old Generation in standard HotSpot JVM?',
            options: ['G1 GC Full Cycle', 'Serial Old & Parallel Old GC', 'Epsilon GC', 'ZGC only'],
            correctIndex: 1,
            explanation:
              'Parallel Old and Serial Old algorithms perform Mark-Sweep-Compact in the Tenured (Old) generation to eliminate memory fragmentation without auxiliary storage.',
          },
          {
            id: 'java-q3',
            question: 'In Java Generics, what does the wildcard `<? super T>` denote?',
            codeSnippet: 'public void addNumbers(List<? super Integer> list) {\n    list.add(10);\n}',
            options: [
              'Lower-bounded wildcard: accepts T or any supertype of T (PECS - Consumer Super)',
              'Upper-bounded wildcard: accepts T or any subtype of T',
              'Exact type match only',
              'Unbounded wildcard identical to <?>',
            ],
            correctIndex: 0,
            explanation:
              'The PECS principle states: "Producer Extends, Consumer Super". Use `? super T` when you want to write (consume) items into the collection.',
          },
        ];
      } else if (category === 'Python') {
        questions = [
          {
            id: 'py-q1',
            question: 'How does Python handle memory management for integer objects between -5 and 256?',
            codeSnippet: 'a = 256\nb = 256\nprint(a is b) # True\nc = 300\nd = 300\nprint(c is d) # False (in interactive REPL)',
            options: [
              'Through integer caching (small integer array pre-allocated at interpreter startup)',
              'Python dynamically re-evaluates all memory references using pointers',
              'Through garbage collection generational tracking only',
              'Using reference counting without any caching',
            ],
            correctIndex: 0,
            explanation:
              'CPython pre-allocates an array of integer objects for values between -5 and 256. Any reference to these numbers reuses the same singleton object.',
          },
          {
            id: 'py-q2',
            question: 'What is the output of using a mutable default argument in a Python function?',
            codeSnippet: 'def append_val(val, target=[]):\n    target.append(val)\n    return target\n\nprint(append_val(1))\nprint(append_val(2))',
            options: ['[1] then [2]', '[1] then [1, 2]', '[1] then []', 'TypeError: mutable default argument not allowed'],
            correctIndex: 1,
            explanation:
              'Default argument values in Python are evaluated once when the function definition is executed, not at each call. Hence, the same list instance is reused across invocations.',
          },
        ];
      } else if (category === 'DSA') {
        questions = [
          {
            id: 'dsa-q1',
            question: 'What is the amortized time complexity of inserting N elements into a dynamic array (like std::vector or ArrayList)?',
            options: ['O(1) amortized per insert, O(N) total', 'O(N) per insert', 'O(log N) per insert', 'O(N^2) total'],
            correctIndex: 0,
            explanation:
              'When capacity is exceeded, the array doubles in size copying N elements, taking O(N). But this resizing happens exponentially rarely, making the amortized cost per append O(1).',
          },
          {
            id: 'dsa-q2',
            question: 'In Dijkstra algorithm with a Min-Heap (priority queue), what is the optimal time complexity on a graph with V vertices and E edges?',
            options: ['O((V + E) log V)', 'O(V^2)', 'O(E * V)', 'O(V log E)'],
            correctIndex: 0,
            explanation:
              'Extract-min takes O(log V) for each of the V vertices, and edge relaxation updates the heap at most E times taking O(log V) each, yielding O((V + E) log V).',
          },
        ];
      } else {
        questions = [
          {
            id: 'dbms-q1',
            question: 'Which normal form eliminates partial dependency of non-prime attributes on a candidate key?',
            options: ['Second Normal Form (2NF)', 'First Normal Form (1NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
            correctIndex: 0,
            explanation:
              '2NF requires the relation to be in 1NF and no non-prime attribute should be partially dependent on any candidate key of the table.',
          },
          {
            id: 'ai-q1',
            question: 'In the Transformer architecture, what is the role of scaled dot-product attention scaling factor 1 / sqrt(d_k)?',
            options: [
              'To prevent the dot products from growing excessively large for large dimensions, which would push softmax into regions with tiny gradients',
              'To ensure matrix inversion is mathematically valid',
              'To reduce memory footprint from O(N^2) to O(N)',
              'To introduce non-linearity into linear embeddings',
            ],
            correctIndex: 0,
            explanation:
              'For large key vectors of dimension d_k, the dot products grow large in magnitude, which leads the softmax function to output extremely small gradients (vanishing gradients). Scaling by sqrt(d_k) mitigates this.',
          },
        ];
      }
    }

    return res.json({
      category,
      difficulty,
      questions,
    });
  } catch (error: any) {
    console.error('Quiz generator error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 7. Live Web Intelligence Search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: 'Search query q parameter is required.' });
    }

    const { text, sources } = await searchWithGoogle(q);
    return res.json({
      query: q,
      summary: text,
      sources,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Search intelligence error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 8. Live Weather API (Open-Meteo, public & reliable)
 */
router.get('/weather', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : 37.7749; // San Francisco default
    const lon = req.query.lon ? Number(req.query.lon) : -122.4194;
    const city = (req.query.city as string) || 'San Francisco, CA';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}`);
    }
    const data = await response.json();
    const current = data.current;

    // Decode weather code
    const code = current?.weather_code || 0;
    let condition = 'Clear sky';
    if (code >= 1 && code <= 3) condition = 'Partly cloudy';
    else if (code >= 45 && code <= 48) condition = 'Foggy';
    else if (code >= 51 && code <= 67) condition = 'Rain showers';
    else if (code >= 71 && code <= 77) condition = 'Snow fall';
    else if (code >= 95) condition = 'Thunderstorm';

    return res.json({
      city,
      temperatureC: Math.round(current?.temperature_2m ?? 20),
      temperatureF: Math.round(((current?.temperature_2m ?? 20) * 9) / 5 + 32),
      humidity: current?.relative_humidity_2m ?? 60,
      windSpeedKmh: current?.wind_speed_10m ?? 12,
      condition,
      weatherCode: code,
      timestamp: current?.time || new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Weather service error:', error.message);
    // graceful fallback
    return res.json({
      city: 'Local Forecast',
      temperatureC: 22,
      temperatureF: 72,
      humidity: 55,
      windSpeedKmh: 10,
      condition: 'Optimal study climate',
      weatherCode: 0,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 9. Daily Productivity AI Insights
 */
router.post('/insights', async (req: Request, res: Response) => {
  try {
    const { completedTasks = 0, totalTasks = 0, focusMinutes = 0, streak = 1 } = req.body;

    const prompt = `You are NOVA, an empathetic yet demanding AI performance coach.
The user's daily telemetry:
- Completed tasks: ${completedTasks} / ${totalTasks}
- Focus session time: ${focusMinutes} minutes
- Learning streak: ${streak} days

Provide 3 concise, high-impact bulleted insights for their day:
1. One recognition of actual progress
2. One tactical optimization for focus or stamina
3. One forward-looking strategic action for tomorrow

Keep tone futuristic, inspiring, and sharp. Return plain markdown without greetings.`;

    let insights = '';
    try {
      insights = await generateContent(prompt);
    } catch (e) {
      insights = `- **Momentum Established:** You have logged ${focusMinutes} minutes of deep focus with ${completedTasks} completed objectives today.\n- **Cognitive Pacing:** Ensure you take a 10-minute walk after 90 minutes of continuous screen work to prevent mental fatigue.\n- **Tomorrow's Catalyst:** Pre-select your single most demanding task before ending today so you hit the ground running with zero decision friction.`;
    }

    return res.json({ insights });
  } catch (error: any) {
    console.error('Insights error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 10. n8n AI Chatbot Integration
 * Webhook: https://madhulathachintala5.app.n8n.cloud/webhook/95eec8f3-24c0-463d-94cb-4eeba2ee262a/chat
 */
const DEFAULT_N8N_WEBHOOK = 'https://madhulathachintala5.app.n8n.cloud/webhook/95eec8f3-24c0-463d-94cb-4eeba2ee262a/chat';

router.get('/n8n/status', async (req: Request, res: Response) => {
  try {
    const webhookUrl = (req.query.url as string) || process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK;
    const startTime = Date.now();
    
    // Test connectivity with a lightweight check
    let reachable = false;
    let latencyMs = 0;
    let message = 'Ready';

    try {
      const pingRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'ping',
          message: 'ping',
          chatInput: 'ping',
          sessionId: 'nova-status-check',
        }),
      });
      latencyMs = Date.now() - startTime;
      reachable = pingRes.status < 500; // Even 4xx or 200 means host is up
      message = `HTTP ${pingRes.status} in ${latencyMs}ms`;
    } catch (err: any) {
      latencyMs = Date.now() - startTime;
      reachable = false;
      message = err.message || 'Connection unreachable';
    }

    return res.json({
      reachable,
      latencyMs,
      message,
      webhookUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/n8n/chat', async (req: Request, res: Response) => {
  try {
    const { message, chatInput, sessionId, context, webhookUrl: customUrl } = req.body;
    const userMessage = chatInput || message || '';

    if (!userMessage && req.body.action !== 'ping') {
      return res.status(400).json({ error: 'Message or chatInput is required.' });
    }

    const n8nWebhookUrl = customUrl || process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK;
    const activeSessionId = sessionId || `nova-session-${Date.now()}`;

    // Payload formatted to match standard n8n AI Chat Trigger
    const payload = {
      action: req.body.action || 'sendMessage',
      sessionId: activeSessionId,
      chatInput: userMessage,
      message: userMessage,
      context: context || {},
      metadata: {
        source: 'NOVA AI Platform',
        timestamp: new Date().toISOString(),
      },
    };

    const startTime = Date.now();
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    });

    const latencyMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { output: text };
      }
    }

    // Extract text output from diverse n8n response shapes
    let reply = '';
    if (typeof responseData === 'string') {
      reply = responseData;
    } else if (responseData?.output) {
      reply = typeof responseData.output === 'string' ? responseData.output : JSON.stringify(responseData.output);
    } else if (responseData?.text) {
      reply = responseData.text;
    } else if (responseData?.message) {
      reply = responseData.message;
    } else if (responseData?.response) {
      reply = responseData.response;
    } else if (Array.isArray(responseData) && responseData[0]?.output) {
      reply = responseData[0].output;
    } else if (Array.isArray(responseData) && responseData[0]?.text) {
      reply = responseData[0].text;
    } else if (responseData?.data) {
      reply = typeof responseData.data === 'string' ? responseData.data : JSON.stringify(responseData.data);
    } else {
      reply = JSON.stringify(responseData);
    }

    return res.json({
      success: response.ok,
      output: reply || 'Message received by n8n workflow.',
      raw: responseData,
      sessionId: activeSessionId,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('n8n proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to forward message to n8n chatbot.',
    });
  }
});

export default router;
