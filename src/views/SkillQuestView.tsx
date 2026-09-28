import React, { useState } from 'react';
import {
  Sword,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Code2,
  BookOpen,
  Award,
  Flame,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { QuizQuestion } from '../types/index.js';

export const SkillQuestView: React.FC = () => {
  const { learningProgress, addXP, badges, addToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'Java' | 'Python' | 'DSA' | 'DBMS' | 'AI'>('Java');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // Active quiz session state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const currentProgress = learningProgress[selectedCategory];

  const roadmaps: Record<string, string[]> = {
    Java: ['OOP Basics & Memory', 'Collections Framework', 'Generics & Wildcards', 'Concurrency & JMM', 'JVM Internals & Garbage Collection'],
    Python: ['Data Structures & Comprehensions', 'Decorators & Generators', 'Metaclasses & Dunder Methods', 'AsyncIO & Concurrency', 'GIL & CPython Internals'],
    DSA: ['Arrays & Hash Maps', 'Two Pointers & Sliding Window', 'Trees & Heaps', 'Dynamic Programming', 'Graph Algorithms & Topo Sort'],
    DBMS: ['Relational Algebra', 'SQL Joins & Indexing', 'Normalization (1NF to BCNF)', 'ACID Transactions & 2PL', 'Distributed Consensus & Sharding'],
    AI: ['Linear Algebra & Gradients', 'Loss Functions & Optimizers', 'Attention & Transformers', 'RAG & Vector Embeddings', 'Model Fine-tuning & Evaluation'],
  };

  const handleStartQuiz = async () => {
    setIsLoadingQuiz(true);
    setIsQuizCompleted(false);
    setCurrentQIndex(0);
    setSessionScore(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: 4,
        }),
      });

      if (!res.ok) throw new Error('Quiz generation failed');
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuizQuestions(data.questions);
      } else {
        throw new Error('No questions received');
      }
    } catch (err: any) {
      console.error(err);
      addToast('Error generating quiz: ' + err.message, 'error');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const q = quizQuestions[currentQIndex];
    const isCorrect = selectedAnswer === q.correctIndex;

    if (isCorrect) {
      setSessionScore((prev) => prev + 1);
      const earnedXP = selectedDifficulty === 'Advanced' ? 50 : selectedDifficulty === 'Intermediate' ? 35 : 20;
      addXP(selectedCategory, earnedXP, true);
    } else {
      addXP(selectedCategory, 5, false); // small participation XP
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      addToast(`Quest Completed! Final Score: ${sessionScore + (selectedAnswer === quizQuestions[currentQIndex]?.correctIndex ? 1 : 0)} / ${quizQuestions.length}`, 'success');
    }
  };

  const currentQ = quizQuestions[currentQIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider">
            <Sword className="w-4 h-4" />
            <span>Gamified Engineering Mastery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Skill Quest
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Test and level up your mastery in Java, Python, Data Structures, DBMS, and AI with Gemini-evaluated drills and earn XP badges.
          </p>
        </div>

        {/* Global Level Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl glass-panel border border-white/[0.08]">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Domain Level</div>
            <div className="text-base font-bold text-white font-mono flex items-center gap-1.5">
              <span>Lvl {currentProgress?.level || 1}</span>
              <span className="text-cyan-400 text-xs">({currentProgress?.xp || 0} XP)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Category Selector & Difficulty */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
          {(['Java', 'Python', 'DSA', 'DBMS', 'AI'] as const).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setQuizQuestions([]);
                  setIsQuizCompleted(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty & Launch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/[0.08]">
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isLoadingQuiz}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoadingQuiz ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summoning Quest...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Start Practice Drill</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Quiz Interactive Arena (Center) & Roadmap / Badges (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Quiz or Launch Screen */}
        <div className="lg:col-span-2 space-y-6">
          {quizQuestions.length > 0 && !isQuizCompleted && currentQ ? (
            <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6 animate-in fade-in duration-200">
              {/* Question Header & Progress */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400">
                    Question {currentQIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedDifficulty}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Session Score: {sessionScore}
                </div>
              </div>

              {/* Question Statement */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                {currentQ.codeSnippet && (
                  <pre className="p-4 rounded-xl bg-[#050711] border border-white/[0.08] text-xs text-slate-300 font-mono overflow-x-auto">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = currentQ.correctIndex === idx;

                  let borderClass = 'border-white/[0.08] bg-slate-900/40 hover:border-indigo-500/40 text-slate-200';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
                    } else {
                      borderClass = 'border-white/[0.04] bg-slate-900/20 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-cyan-400 bg-cyan-950/30 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 text-xs sm:text-sm font-medium ${borderClass}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation card after submit */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {selectedAnswer === currentQ.correctIndex ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3 border-t border-white/[0.06]">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{currentQIndex + 1 === quizQuestions.length ? 'Finish Quest' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : isQuizCompleted ? (
            /* Quiz Completed Summary */
            <div className="p-8 rounded-2xl glass-panel-elevated border border-white/10 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Quest Milestone Reached!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You scored {sessionScore} out of {quizQuestions.length} in {selectedCategory} ({selectedDifficulty}).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] max-w-sm mx-auto flex justify-around text-center">
                <div>
                  <div className="text-xs text-slate-400">XP Gained</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">+{sessionScore * 35}</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-xs text-slate-400">Accuracy</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {Math.round((sessionScore / quizQuestions.length) * 100)}%
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Another Drill</span>
              </button>
            </div>
          ) : (
            /* Empty / Idle State */
            <div className="p-10 rounded-2xl glass-panel border border-white/[0.08] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Sword className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Ready for your {selectedCategory} Drill?</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Practice conceptual, syntax, and architectural interview questions generated by Gemini. Click "Start Practice Drill" to begin.
                </p>
              </div>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch {selectedCategory} Drill</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Learning Roadmap & Badges */}
        <div className="space-y-6">
          {/* Roadmap */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">{selectedCategory} Roadmap</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentProgress?.completedRoadmapTopics?.length || 0} / {roadmaps[selectedCategory]?.length || 5} Done
              </span>
            </div>

            <div className="space-y-3">
              {(roadmaps[selectedCategory] || []).map((topic, i) => {
                const isDone = currentProgress?.completedRoadmapTopics?.includes(topic);
                return (
                  <div
                    key={topic}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-900/30 border-white/[0.04] text-slate-400'
                        : 'bg-slate-900/60 border-white/[0.07] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500">0{i + 1}</span>
                      <span className="font-medium">{topic}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400">Upcoming</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Mastery Badges</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {badges.filter((b) => b.unlockedAt).length}/{badges.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {badges.map((b) => {
                const isUnlocked = !!b.unlockedAt;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                      isUnlocked
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900/30 border-white/[0.04] text-slate-600 opacity-60'
                    }`}
                  >
                    <div className="text-sm font-bold truncate">{b.title}</div>
                    <div className="text-[10px] leading-tight line-clamp-2 text-slate-400">
                      {b.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
