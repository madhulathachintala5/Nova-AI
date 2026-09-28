import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  CloudSun,
  Wind,
  Droplets,
  Calendar,
  Loader2,
  RefreshCw,
  Cpu,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const LiveIntelView: React.FC = () => {
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('recent developments in AI agents and reasoning models');
  const [searchResults, setSearchResults] = useState<{
    query: string;
    summary: string;
    sources: Array<{ title: string; url: string; snippet?: string }>;
    timestamp: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Weather state
  const [weather, setWeather] = useState<{
    city: string;
    temperatureC: number;
    temperatureF: number;
    humidity: number;
    windSpeedKmh: number;
    condition: string;
  } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch weather on mount
  useEffect(() => {
    fetchLiveWeather();
    handleSearch('recent developments in AI agents and reasoning models');
  }, []);

  const fetchLiveWeather = async () => {
    setLoadingWeather(true);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim() || isSearching) return;
    setIsSearching(true);
    setSearchResults(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryText.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error(err);
      addToast('Search error: ' + err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Live Grounded Web Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Live Intelligence Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live web search powered by Google Search tool grounding and real-time environmental telemetry.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Google Search Grounding Online</span>
        </div>
      </div>

      {/* Weather & Environmental Telemetry Card */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 border border-cyan-400/20 text-cyan-300">
              <CloudSun className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 uppercase">Live Environmental Telemetry</span>
                <button
                  onClick={fetchLiveWeather}
                  disabled={loadingWeather}
                  className="text-slate-400 hover:text-white"
                  title="Refresh weather"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingWeather ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {weather?.city || 'Regional Study Forecast'}
              </h3>
              <p className="text-xs text-slate-400">
                {weather?.condition || 'Optimal conditions for cognitive focus'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <div className="text-3xl font-extrabold text-white font-mono">
                {weather?.temperatureC ?? 22}°C
              </div>
              <div className="text-[11px] text-slate-400">
                {weather?.temperatureF ?? 72}°F Ambient
              </div>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Humidity: {weather?.humidity ?? 55}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-indigo-400" />
                <span>Wind: {weather?.windSpeedKmh ?? 12} km/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Web Search Console */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Real-time Technical & AI News Grounding</span>
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search current AI breakthroughs, tech updates, frameworks..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search Live Web</span>}
          </button>
        </form>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-[11px] text-slate-500">Popular queries:</span>
          {[
            'recent developments in AI agents and reasoning models',
            'latest Java LTS features and Project Loom updates',
            'PostgreSQL performance optimization trends',
            'State-of-the-art vector databases for RAG',
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchQuery(q);
                handleSearch(q);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/[0.06] hover:border-cyan-400/40 text-slate-300 text-[11px] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Display */}
      {isSearching && (
        <div className="p-12 rounded-2xl glass-panel border border-white/[0.08] text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-slate-400">
            Querying Google Search grounding engine with Gemini 3.8 Flash...
          </p>
        </div>
      )}

      {searchResults && !isSearching && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Box */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Live Grounded Synthesis</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(searchResults.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
              {searchResults.summary}
            </div>
          </div>

          {/* Sources list */}
          {searchResults.sources && searchResults.sources.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Grounding Sources ({searchResults.sources.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl glass-panel border border-white/[0.06] hover:border-cyan-400/40 text-left transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="overflow-hidden space-y-1">
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {src.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {src.snippet || src.url}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono truncate">
                        {src.url}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
