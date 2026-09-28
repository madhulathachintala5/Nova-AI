import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Loader2,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { DocumentItem, DocumentChunk } from '../types/index.js';

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteDocument, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<{
    answer: string;
    citations: Array<{ docTitle: string; pageNumber?: number; snippet: string; confidence: number }>;
    matched: boolean;
  } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);

  // Material generation state (summary, flashcards, quiz)
  const [generatedMaterial, setGeneratedMaterial] = useState<{ type: string; content: string } | null>(null);
  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collect all chunks across all ready documents for RAG search
  const allChunks: DocumentChunk[] = documents.flatMap((d) => d.chunks || []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const docId = `doc-${Date.now()}`;

      // Call server to chunk and embed
      const res = await fetch('/api/rag/embed-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId,
          title: file.name,
          content: text,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to embed document');
      }

      const data = await res.json();

      const newDoc: DocumentItem = {
        id: docId,
        title: file.name,
        fileSize: file.size,
        fileType: file.type || 'text/plain',
        uploadedAt: new Date().toISOString(),
        chunkCount: data.chunkCount || 1,
        preview: text.slice(0, 180) + '...',
        status: 'ready',
        chunks: data.chunks || [],
      };

      addDocument(newDoc);
      setSelectedDoc(newDoc);
    } catch (err: any) {
      console.error(err);
      addToast('Error uploading document: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim() || isQuerying) return;

    setIsQuerying(true);
    setRagResult(null);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ragQuery.trim(),
          chunks: allChunks,
        }),
      });

      if (!res.ok) {
        throw new Error('RAG search failed');
      }

      const data = await res.json();
      setRagResult({
        answer: data.answer,
        citations: data.citations || [],
        matched: !!data.matched,
      });
    } catch (err: any) {
      console.error(err);
      setRagResult({
        answer: 'Failed to retrieve information from document library: ' + err.message,
        citations: [],
        matched: false,
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleGenerateMaterial = async (type: 'summary' | 'flashcards' | 'quiz') => {
    if (!selectedDoc) return;
    setIsGeneratingMaterial(true);
    setGeneratedMaterial(null);

    const docFullText = selectedDoc.chunks.map((c) => c.text).join('\n\n');

    try {
      const res = await fetch('/api/rag/generate-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: selectedDoc.title,
          content: docFullText,
          type,
        }),
      });

      if (!res.ok) throw new Error('Material generation error');
      const data = await res.json();
      setGeneratedMaterial({ type, content: data.result });
      addToast(`Generated ${type} from ${selectedDoc.title}!`, 'success');
    } catch (e: any) {
      addToast('Error generating material: ' + e.message, 'error');
    } finally {
      setIsGeneratingMaterial(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Neural RAG Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Smart Document Brain
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Upload course notes, syllabus PDFs, or technical manuals. NOVA extracts text, generates vector embeddings, and answers queries grounded exclusively in your documents with verified page citations.
          </p>
        </div>

        {/* Upload Action */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.pdf,.md,.csv,.json,.java,.py"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chunking & Embedding...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RAG Ask Bar */}
      <div className="rounded-2xl glass-panel-elevated p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Ask Your Document Library</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {allChunks.length} vector chunks indexed across {documents.length} documents
          </span>
        </div>

        <form onSubmit={handleRagSearch} className="flex gap-2">
          <input
            type="text"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            placeholder="Ask a question from your notes (e.g., 'What are ACID properties and isolation levels?' or 'How does HashMap handle collisions?')"
            className="flex-1 glass-input rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
          />
          <button
            type="submit"
            disabled={!ragQuery.trim() || isQuerying}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
          >
            {isQuerying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Query Brain</span>
            )}
          </button>
        </form>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500">Suggested queries:</span>
          {[
            'Explain Java Happens-Before and memory barriers',
            'What is the difference between B+ Tree and B-Tree indexing?',
            'What does BCNF require in database normalization?',
            'When does HashMap transform a bucket into a TreeNode?',
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setRagQuery(q);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/[0.06] hover:border-cyan-400/40 text-slate-300 text-[11px] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* RAG Answer & Citations Box */}
        {ragResult && (
          <div className="mt-4 p-5 rounded-xl bg-slate-900/60 border border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                {ragResult.matched ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Grounded Retrieval Response</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Retrieval Notice</span>
                  </>
                )}
              </span>

              {ragResult.matched && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {ragResult.citations.length} sources matched
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {ragResult.answer}
            </div>

            {/* Citations List */}
            {ragResult.citations && ragResult.citations.length > 0 && (
              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Verified In-Document Citations:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ragResult.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-300 font-medium">
                        <span className="truncate">{cite.docTitle}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Page {cite.pageNumber || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        "{cite.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Split: Document Library (Left) & Document Inspection / Generator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Library */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Document Library</h3>
              <span className="text-xs text-slate-500 font-mono">{documents.length} files</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter documents..."
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No documents found. Upload a file above.
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setGeneratedMaterial(null);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-white'
                          : 'bg-slate-900/40 border-white/[0.06] text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="truncate">
                          <div className="text-xs font-medium truncate">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {doc.chunkCount} chunks · {(doc.fileSize / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                          if (selectedDoc?.id === doc.id) {
                            setSelectedDoc(documents.find((d) => d.id !== doc.id) || null);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Document Details & AI Synthesis Generator */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedDoc.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                    <span>Uploaded {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Status Ready
                    </span>
                  </div>
                </div>

                {/* Synthesis Tools Bar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateMaterial('summary')}
                    disabled={isGeneratingMaterial}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/50 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Summarize</span>
                  </button>
                  <button
                    onClick={() => handleGenerateMaterial('flashcards')}
                    disabled={isGeneratingMaterial}
                    className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/50 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Flashcards</span>
                  </button>
                  <button
                    onClick={() => handleGenerateMaterial('quiz')}
                    disabled={isGeneratingMaterial}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/50 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Generate Quiz</span>
                  </button>
                </div>
              </div>

              {/* Display Generated Synthesis if present */}
              {isGeneratingMaterial && (
                <div className="p-8 rounded-xl bg-slate-900/40 border border-white/[0.06] text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Generating synthesis using Gemini 3.8 Flash...
                  </p>
                </div>
              )}

              {generatedMaterial && (
                <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    <span>Generated {generatedMaterial.type}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedMaterial.content);
                        addToast('Copied to clipboard!', 'success');
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-mono bg-slate-950/60 p-4 rounded-lg overflow-x-auto max-h-72 overflow-y-auto">
                    {generatedMaterial.content}
                  </div>
                </div>
              )}

              {/* Indexed Chunks inspection */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Indexed Neural Chunks ({selectedDoc.chunks.length})
                </h4>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedDoc.chunks.map((chunk, index) => (
                    <div
                      key={chunk.id}
                      className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.05] space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Chunk #{index + 1}</span>
                        <span className="text-cyan-400">Page {chunk.pageNumber || 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl glass-panel border border-white/[0.08] text-center text-xs text-slate-500">
              Select a document to inspect chunks or generate summaries.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
