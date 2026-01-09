'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import AssetGrid from '@/components/assets/AssetGrid';
import AssetDetailPanel from '@/components/assets/AssetDetailPanel';
import SemanticSearchResults from '@/components/search/SemanticSearchResults';
import {
  Asset as ApiAsset,
  getStoredToken,
  getStoredUser,
  searchAssets,
  semanticSearch,
  getAvailableFilters,
  aiSearch,
  SearchParams,
  SemanticSearchResult,
  HybridSearchFilters,
  AvailableFilters,
  AISearchResult,
} from '@/lib/api';
import { Asset } from '@/components/assets/AssetCard';
import { Search, Sparkles, Clock, X, SlidersHorizontal, Video, Image, Music, FileText, Loader2, Zap, Filter, Tag, Shield, Eye, Users, MessageSquare, ChevronDown, ChevronUp, Layers, Box } from 'lucide-react';

function transformAsset(apiAsset: ApiAsset): Asset {
  return {
    id: apiAsset.id,
    title: apiAsset.title || apiAsset.filename,
    filename: apiAsset.filename,
    assetType: apiAsset.assetType as Asset['assetType'],
    mimeType: apiAsset.mimeType,
    fileSize: apiAsset.fileSize,
    status: apiAsset.status as Asset['status'],
    cdnUrl: apiAsset.cdnUrl,
    thumbnailUrl: apiAsset.thumbnailUrl,
    duration: apiAsset.duration,
    width: apiAsset.width,
    height: apiAsset.height,
    aiTags: apiAsset.aiTags || [],
    aiObjects: apiAsset.aiObjects,
    aiFaces: apiAsset.aiFaces,
    aiTranscript: apiAsset.aiTranscript,
    aiSentiment: apiAsset.aiSentiment,
    aiSafetyScore: apiAsset.aiSafetyScore,
    aiFeatures: apiAsset.aiFeatures,
    processingProgress: apiAsset.processingProgress,
    createdAt: apiAsset.createdAt || new Date().toISOString(),
  };
}

const recentSearchesKey = 'mediax_recent_searches';

const suggestedSearches = [
  { query: 'king', type: 'semantic', hint: 'Find mentions in speech' },
  { query: 'British empire', type: 'semantic', hint: 'Search entities & topics' },
  { query: 'drama', type: 'semantic', hint: 'Discover by topic' },
  { query: 'speech', type: 'semantic', hint: 'Audio content type' },
  { query: 'positive sentiment', type: 'semantic', hint: 'Filter by mood' },
  { query: 'Baldwin', type: 'semantic', hint: 'Find named people' },
];

const filterOptions = {
  types: [
    { value: '', label: 'All Types' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Document' },
  ],
  dates: [
    { value: '', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
  ],
  status: [
    { value: '', label: 'Any status' },
    { value: 'ready', label: 'Ready' },
    { value: 'processing', label: 'Processing' },
    { value: 'failed', label: 'Failed' },
  ],
};

function getDateRange(dateFilter: string): { from?: string; to?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (dateFilter) {
    case 'today':
      return { from: today.toISOString() };
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { from: weekAgo.toISOString() };
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { from: monthAgo.toISOString() };
    case 'year':
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { from: yearAgo.toISOString() };
    default:
      return {};
  }
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    date: '',
    status: '',
  });
  const [advancedFilters, setAdvancedFilters] = useState<HybridSearchFilters>({});
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null);
  const [results, setResults] = useState<Asset[]>([]);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [aiSearchResults, setAiSearchResults] = useState<AISearchResult[]>([]);
  const [rawAssets, setRawAssets] = useState<ApiAsset[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [seekToTimestamp, setSeekToTimestamp] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [assetCounts, setAssetCounts] = useState({ video: 0, image: 0, audio: 0, document: 0 });
  const [isAuthed, setIsAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tenantId, setTenantId] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [semanticWeight, setSemanticWeight] = useState(0.6);
  const [isKeywordFallback, setIsKeywordFallback] = useState(false);
  const [expandedMoments, setExpandedMoments] = useState<Set<string>>(new Set());

  // Handle client-side only auth check
  useEffect(() => {
    setMounted(true);
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
    const user = getStoredUser();
    if (user?.tenantId) {
      setTenantId(user.tenantId);
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(recentSearchesKey);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Fetch asset counts for browse by type
  useEffect(() => {
    if (isAuthed) {
      fetchAssetCounts();
    }
  }, [isAuthed]);

  // Fetch available filters when tenant is set
  useEffect(() => {
    if (isAuthed && tenantId) {
      fetchAvailableFilters();
    }
  }, [isAuthed, tenantId]);

  const fetchAvailableFilters = async () => {
    try {
      const filters = await getAvailableFilters(tenantId);
      setAvailableFilters(filters);
    } catch (error) {
      console.warn('Failed to fetch available filters:', error);
    }
  };

  const fetchAssetCounts = async () => {
    try {
      const [videos, images, audio, docs] = await Promise.all([
        searchAssets({ assetType: 'video', limit: 1 }),
        searchAssets({ assetType: 'image', limit: 1 }),
        searchAssets({ assetType: 'audio', limit: 1 }),
        searchAssets({ assetType: 'document', limit: 1 }),
      ]);
      setAssetCounts({
        video: videos.total,
        image: images.total,
        audio: audio.total,
        document: docs.total,
      });
    } catch (error) {
      console.error('Failed to fetch asset counts:', error);
    }
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(recentSearchesKey, JSON.stringify(updated));
  };

  const performSearch = useCallback(async (query: string, currentFilters = filters) => {
    if (!isAuthed) return;

    setLoading(true);
    setHasSearched(true);
    setSemanticResults([]);
    setAiSearchResults([]);
    setProcessingTime(null);
    setResults([]);
    setIsKeywordFallback(false);
    setExpandedMoments(new Set());

    try {
      const dateRange = getDateRange(currentFilters.date);

      // Hybrid/AI search mode - uses AI-powered search with transcript timestamps
      if (searchMode === 'hybrid' && query) {
        try {
          // Use the new AI search endpoint that searches transcripts, tags, entities with timestamps
          const aiResponse = await aiSearch({
            query,
            limit: 30,
            assetType: currentFilters.type || undefined,
            minScore: 0.1,
          });

          if (aiResponse.results.length > 0) {
            setAiSearchResults(aiResponse.results);
            setTotalResults(aiResponse.totalResults);
            setProcessingTime(aiResponse.processingTimeMs);
          } else {
            // AI search returned empty, fall back to keyword search
            console.log('AI search returned no results, falling back to keyword search');
            setIsKeywordFallback(true);
            const params: SearchParams = {
              search: query || undefined,
              assetType: currentFilters.type || undefined,
              status: currentFilters.status || undefined,
              dateFrom: dateRange.from,
              dateTo: dateRange.to,
              limit: 50,
            };
            const response = await searchAssets(params);
            setResults(response.data.map(transformAsset));
            setRawAssets(response.data);
            setTotalResults(response.total);
          }
        } catch (e) {
          console.warn('AI search not available, falling back to keyword:', e);
          setIsKeywordFallback(true);
          // Fallback to regular search
          const params: SearchParams = {
            search: query || undefined,
            assetType: currentFilters.type || undefined,
            status: currentFilters.status || undefined,
            dateFrom: dateRange.from,
            dateTo: dateRange.to,
            limit: 50,
          };
          const response = await searchAssets(params);
          setResults(response.data.map(transformAsset));
          setRawAssets(response.data);
          setTotalResults(response.total);
        }
      } else {
        // Regular keyword or semantic search
        const params: SearchParams = {
          search: query || undefined,
          searchMode: searchMode === 'semantic' ? 'semantic' : 'keyword',
          assetType: currentFilters.type || undefined,
          status: currentFilters.status || undefined,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          limit: 50,
        };

        const response = await searchAssets(params);
        setResults(response.data.map(transformAsset));
        setRawAssets(response.data);
        setTotalResults(response.total);

        // If semantic mode and we have a query, also do semantic search
        if (searchMode === 'semantic' && query && tenantId) {
          try {
            const semanticResponse = await semanticSearch({
              query,
              tenantId,
              limit: 30,
              minSimilarity: 0.25,
            });
            setSemanticResults(semanticResponse.results);
            setProcessingTime(semanticResponse.processingTimeMs);
          } catch (e) {
            console.warn('Semantic search not available:', e);
          }
        }
      }

      if (query) {
        saveRecentSearch(query);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthed, filters, searchMode, tenantId, semanticWeight, advancedFilters]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    performSearch(searchQuery);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleTypeFilter = (type: string) => {
    const newFilters = { ...filters, type };
    setFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (hasSearched) {
      performSearch(searchQuery, newFilters);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSemanticResults([]);
    setAiSearchResults([]);
    setTotalResults(0);
    setHasSearched(false);
    setProcessingTime(null);
    setIsKeywordFallback(false);
  };

  const handleAssetClickFromSemantic = (apiAsset: ApiAsset) => {
    setSelectedAsset(transformAsset(apiAsset));
  };

  const handleSeekToMoment = (apiAsset: ApiAsset, timestamp: number) => {
    setSelectedAsset(transformAsset(apiAsset));
    setSeekToTimestamp(timestamp);
  };

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to search assets.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium"
          >
            Go to Login
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Search Assets</h1>
          <p className="text-text-muted">Search across all metadata including AI-extracted tags, transcripts, and features</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center gap-2 bg-background-medium border border-background-light rounded-xl p-2">
            <div className="flex bg-background-light rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSearchMode('hybrid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'hybrid' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
                }`}
                title="Combines semantic AI + keyword search"
              >
                <Zap className="w-4 h-4" />
                Hybrid
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('keyword')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'keyword' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                Keyword
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('semantic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'semantic' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Semantic
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchMode === 'semantic' ? 'Describe what you\'re looking for...' : 'Search by title, tags, transcript, keywords...'}
              className="flex-1 h-10 px-4 bg-transparent text-white placeholder-text-muted focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="p-2 text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary text-white' : 'text-text-muted hover:text-white hover:bg-background-light'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-background-medium border border-background-light rounded-xl z-10">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-text-muted mb-2">Asset Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full h-10 px-3 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  >
                    {filterOptions.types.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Date Added</label>
                  <select
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full h-10 px-3 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  >
                    {filterOptions.dates.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full h-10 px-3 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  >
                    {filterOptions.status.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced AI Filters */}
              <div className="border-t border-background-hover pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
                >
                  <Filter className="w-4 h-4" />
                  Advanced AI Filters
                  {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedFilters && (
                  <div className="mt-4 space-y-4">
                    {/* Semantic Weight Slider */}
                    {searchMode === 'hybrid' && (
                      <div>
                        <label className="flex items-center justify-between text-sm text-text-muted mb-2">
                          <span>Semantic vs Keyword Balance</span>
                          <span className="text-primary">{Math.round(semanticWeight * 100)}% AI / {Math.round((1 - semanticWeight) * 100)}% Keyword</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={semanticWeight}
                          onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>
                    )}

                    {/* Sentiment Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-text-muted mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Sentiment
                      </label>
                      <div className="flex gap-2">
                        {['positive', 'neutral', 'negative'].map((sent) => (
                          <button
                            key={sent}
                            type="button"
                            onClick={() => setAdvancedFilters(f => ({
                              ...f,
                              sentiment: f.sentiment === sent ? undefined : sent
                            }))}
                            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                              advancedFilters.sentiment === sent
                                ? 'bg-primary text-white'
                                : 'bg-background-light text-text-muted hover:text-white'
                            }`}
                          >
                            {sent}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Safety Score Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-text-muted mb-2">
                        <Shield className="w-4 h-4" />
                        Minimum Safety Score: {advancedFilters.minSafetyScore ? `${Math.round(advancedFilters.minSafetyScore * 100)}%` : 'Any'}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={advancedFilters.minSafetyScore || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setAdvancedFilters(f => ({
                            ...f,
                            minSafetyScore: val > 0 ? val : undefined
                          }));
                        }}
                        className="w-full accent-primary"
                      />
                    </div>

                    {/* AI Tags Filter */}
                    {availableFilters?.tags && availableFilters.tags.length > 0 && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-text-muted mb-2">
                          <Tag className="w-4 h-4" />
                          AI Tags
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {availableFilters.tags.slice(0, 20).map((t) => (
                            <button
                              key={t.tag}
                              type="button"
                              onClick={() => {
                                setAdvancedFilters(f => ({
                                  ...f,
                                  aiTags: f.aiTags?.includes(t.tag)
                                    ? f.aiTags.filter(x => x !== t.tag)
                                    : [...(f.aiTags || []), t.tag]
                                }));
                              }}
                              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                advancedFilters.aiTags?.includes(t.tag)
                                  ? 'bg-primary text-white'
                                  : 'bg-background-light text-text-muted hover:text-white'
                              }`}
                            >
                              {t.tag} ({t.count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detected Objects Filter */}
                    {availableFilters?.objects && availableFilters.objects.length > 0 && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-text-muted mb-2">
                          <Eye className="w-4 h-4" />
                          Detected Objects
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {availableFilters.objects.slice(0, 15).map((o) => (
                            <button
                              key={o.object}
                              type="button"
                              onClick={() => {
                                setAdvancedFilters(f => ({
                                  ...f,
                                  objects: f.objects?.includes(o.object)
                                    ? f.objects.filter(x => x !== o.object)
                                    : [...(f.objects || []), o.object]
                                }));
                              }}
                              className={`px-2 py-1 text-xs rounded-full capitalize transition-colors ${
                                advancedFilters.objects?.includes(o.object)
                                  ? 'bg-status-processing text-white'
                                  : 'bg-background-light text-text-muted hover:text-white'
                              }`}
                            >
                              {o.object} ({o.count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Named Entities Filter */}
                    {availableFilters?.entities && availableFilters.entities.length > 0 && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-text-muted mb-2">
                          <Users className="w-4 h-4" />
                          Named Entities
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {availableFilters.entities.slice(0, 15).map((e) => (
                            <button
                              key={e.entity}
                              type="button"
                              onClick={() => {
                                setAdvancedFilters(f => ({
                                  ...f,
                                  entities: f.entities?.includes(e.entity)
                                    ? f.entities.filter(x => x !== e.entity)
                                    : [...(f.entities || []), e.entity]
                                }));
                              }}
                              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                advancedFilters.entities?.includes(e.entity)
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-background-light text-text-muted hover:text-white'
                              }`}
                            >
                              {e.entity} ({e.count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clear Filters */}
                    {Object.keys(advancedFilters).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAdvancedFilters({})}
                        className="text-sm text-error hover:text-red-400"
                      >
                        Clear Advanced Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-text-muted">
                {loading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
                {searchQuery && <span className="text-white"> for "{searchQuery}"</span>}
                {aiSearchResults.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary">
                    <Zap className="w-3 h-3" />
                    with {aiSearchResults.reduce((acc, r) => acc + r.matches.length, 0)} matched moments
                  </span>
                )}
                {searchMode === 'semantic' && semanticResults.length > 0 && aiSearchResults.length === 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary">
                    <Zap className="w-3 h-3" />
                    with {semanticResults.length} AI-matched moments
                  </span>
                )}
                {isKeywordFallback && results.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-text-muted">
                    <Search className="w-3 h-3" />
                    (keyword match - no spoken moments found)
                  </span>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : aiSearchResults.length > 0 ? (
              /* Show AI search results with matched moments */
              <div className="space-y-4">
                {processingTime && (
                  <p className="text-xs text-text-muted">
                    Search completed in {processingTime}ms
                  </p>
                )}
                {/* Show info when no transcript moments exist but other matches do */}
                {aiSearchResults.length > 0 &&
                 !aiSearchResults.some(r => r.matches.some(m => m.type === 'transcript' && m.startTime !== undefined)) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-background-light/50 border border-background-hover rounded-lg text-sm text-text-muted">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>No spoken moments found for "{searchQuery}". Showing matches from tags, keywords, and entities.</span>
                  </div>
                )}
                {aiSearchResults.map((result) => (
                  <div
                    key={result.asset.id}
                    className="bg-background-medium border border-background-light rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <button
                        onClick={() => setSelectedAsset(transformAsset(result.asset))}
                        className="relative flex-shrink-0 w-40 h-24 bg-background-light rounded-lg overflow-hidden group"
                      >
                        {result.asset.thumbnailUrl ? (
                          <img
                            src={result.asset.thumbnailUrl}
                            alt={result.asset.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            {result.asset.assetType === 'video' && <Video className="w-8 h-8" />}
                            {result.asset.assetType === 'image' && <Image className="w-8 h-8" />}
                            {result.asset.assetType === 'audio' && <Music className="w-8 h-8" />}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs text-white font-medium">View Details</span>
                        </div>
                        {result.asset.duration && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                            {Math.floor(result.asset.duration / 60)}:{String(Math.floor(result.asset.duration % 60)).padStart(2, '0')}
                          </span>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-medium text-white truncate">{result.asset.title}</h3>
                            <p className="text-sm text-text-muted">{result.asset.filename}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                              {Math.round(result.score * 100)}% match
                            </span>
                            <span className="px-2 py-0.5 bg-background-light text-text-muted text-xs rounded capitalize">
                              {result.asset.assetType}
                            </span>
                          </div>
                        </div>

                        {/* Transcript Moments - Timeline Style */}
                        {result.matches.some(m => m.type === 'transcript' && m.startTime !== undefined) && (
                          <div className="mb-3">
                            <p className="text-xs text-text-muted font-medium mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Moments found ({result.matches.filter(m => m.type === 'transcript').length})
                            </p>
                            <div className="space-y-1">
                              {result.matches
                                .filter(m => m.type === 'transcript' && m.startTime !== undefined)
                                .slice(0, expandedMoments.has(result.asset.id) ? undefined : 4)
                                .map((match, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSelectedAsset(transformAsset(result.asset));
                                      setSeekToTimestamp(match.startTime!);
                                    }}
                                    className="w-full flex items-start gap-3 p-2 bg-background-light hover:bg-primary/20 rounded-lg text-left transition-colors group border border-transparent hover:border-primary/30"
                                  >
                                    <div className="flex-shrink-0 w-14 h-8 bg-primary/20 rounded flex items-center justify-center">
                                      <span className="text-primary font-mono text-sm font-medium">
                                        {Math.floor(match.startTime! / 60)}:{String(Math.floor(match.startTime! % 60)).padStart(2, '0')}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-text-secondary group-hover:text-white line-clamp-2">
                                        {match.text}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs text-primary">Play</span>
                                    </div>
                                  </button>
                                ))}
                              {result.matches.filter(m => m.type === 'transcript').length > 4 && (
                                <button
                                  onClick={() => {
                                    setExpandedMoments(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(result.asset.id)) {
                                        newSet.delete(result.asset.id);
                                      } else {
                                        newSet.add(result.asset.id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  className="w-full text-center py-1.5 text-xs text-primary hover:text-primary-hover"
                                >
                                  {expandedMoments.has(result.asset.id)
                                    ? 'Show less'
                                    : `+${result.matches.filter(m => m.type === 'transcript').length - 4} more moments`}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Other Matches (tags, entities, keywords, objects, scenes) */}
                        {result.matches.some(m => m.type !== 'transcript') && (
                          <div className="space-y-1.5">
                            <p className="text-xs text-text-muted font-medium">Also matched:</p>
                            <div className="flex flex-wrap gap-2">
                              {result.matches
                                .filter(m => m.type !== 'transcript')
                                .slice(0, 8)
                                .map((match, idx) => {
                                  // Determine icon and color based on match text prefix
                                  const isObject = match.text?.startsWith('Object:');
                                  const isScene = match.text?.startsWith('Scene:');
                                  const isTopic = match.text?.startsWith('Topic:');
                                  const isSummary = match.text?.startsWith('Summary:');
                                  const displayText = match.text?.replace(/^(Object|Scene|Topic|Summary):\s*/, '') || match.text;

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedAsset(transformAsset(result.asset))}
                                      className="flex items-center gap-1.5 px-2 py-1 bg-background-light hover:bg-background-hover rounded-lg text-xs transition-colors group"
                                    >
                                      {match.type === 'tag' && (
                                        <>
                                          <Tag className="w-3 h-3 text-primary" />
                                          <span className="text-text-secondary group-hover:text-white">{match.text}</span>
                                        </>
                                      )}
                                      {match.type === 'entity' && !isObject && (
                                        <>
                                          <Users className="w-3 h-3 text-purple-400" />
                                          <span className="text-text-secondary group-hover:text-white">{match.text}</span>
                                        </>
                                      )}
                                      {match.type === 'entity' && isObject && (
                                        <>
                                          <Box className="w-3 h-3 text-orange-400" />
                                          <span className="text-text-secondary group-hover:text-white">{displayText}</span>
                                        </>
                                      )}
                                      {match.type === 'keyword' && !isScene && !isTopic && !isSummary && (
                                        <>
                                          <Sparkles className="w-3 h-3 text-yellow-400" />
                                          <span className="text-text-secondary group-hover:text-white">{match.text}</span>
                                        </>
                                      )}
                                      {match.type === 'keyword' && isScene && (
                                        <>
                                          <Layers className="w-3 h-3 text-cyan-400" />
                                          <span className="text-text-secondary group-hover:text-white">{displayText}</span>
                                        </>
                                      )}
                                      {match.type === 'keyword' && isTopic && (
                                        <>
                                          <MessageSquare className="w-3 h-3 text-blue-400" />
                                          <span className="text-text-secondary group-hover:text-white">{displayText}</span>
                                        </>
                                      )}
                                      {match.type === 'keyword' && isSummary && (
                                        <>
                                          <FileText className="w-3 h-3 text-gray-400" />
                                          <span className="text-text-secondary group-hover:text-white line-clamp-1 max-w-[200px]">{displayText}</span>
                                        </>
                                      )}
                                      {match.type === 'title' && (
                                        <>
                                          <FileText className="w-3 h-3 text-green-400" />
                                          <span className="text-text-secondary group-hover:text-white">Title</span>
                                        </>
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchMode === 'semantic' && semanticResults.length > 0 ? (
              /* Show semantic results with timeline for videos */
              <SemanticSearchResults
                results={semanticResults}
                assets={rawAssets}
                query={searchQuery}
                onAssetClick={handleAssetClickFromSemantic}
                onSeekToMoment={handleSeekToMoment}
              />
            ) : results.length > 0 ? (
              <AssetGrid assets={results} onAssetClick={setSelectedAsset} />
            ) : (
              <div className="text-center py-16 bg-background-medium rounded-xl border border-background-light">
                <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                <p className="text-text-muted">Try different keywords or adjust your filters</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State - Before Search */}
        {!hasSearched && (
          <>
            {/* Search Tips */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-white mb-1">AI-Powered Search</h3>
                  <p className="text-sm text-text-muted mb-2">
                    Search across <span className="text-primary font-medium">transcripts, topics, entities, objects, and scenes</span>.
                    Find exact moments with timestamps in your media.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-text-muted">
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-primary" />
                        Search spoken content
                      </li>
                      <li className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-primary" />
                        Find by keywords & topics
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-primary" />
                        Locate named people & places
                      </li>
                    </ul>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Box className="w-3 h-3 text-primary" />
                        Detected objects in video
                      </li>
                      <li className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-primary" />
                        Scene descriptions
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="w-3 h-3 text-primary" />
                        Filter by sentiment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent & Suggested Searches */}
            <div className="grid grid-cols-2 gap-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="bg-background-medium rounded-xl border border-background-light p-4">
                  <h3 className="flex items-center gap-2 font-medium text-white mb-4">
                    <Clock className="w-5 h-5 text-text-muted" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSearch(search)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-background-light hover:text-white transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Searches */}
              <div className="bg-background-medium rounded-xl border border-background-light p-4">
                <h3 className="flex items-center gap-2 font-medium text-white mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Try These Searches
                </h3>
                <div className="space-y-2">
                  {suggestedSearches.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickSearch(item.query)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-background-light transition-colors group"
                    >
                      <span className="text-white group-hover:text-primary">"{item.query}"</span>
                      {item.hint && (
                        <span className="ml-2 text-xs text-text-muted">{item.hint}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Browse by Type */}
            <div className="bg-background-medium rounded-xl border border-background-light p-6">
              <h3 className="font-medium text-white mb-4">Browse by Type</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Video, label: 'Videos', type: 'video', count: assetCounts.video },
                  { icon: Image, label: 'Images', type: 'image', count: assetCounts.image },
                  { icon: Music, label: 'Audio', type: 'audio', count: assetCounts.audio },
                  { icon: FileText, label: 'Documents', type: 'document', count: assetCounts.document },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleTypeFilter(item.type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background-light hover:bg-background-hover transition-colors"
                  >
                    <item.icon className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-white">{item.label}</span>
                    <span className="text-xs text-text-muted">{item.count} assets</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Asset Detail Panel */}
      {selectedAsset && (
        <AssetDetailPanel
          asset={selectedAsset}
          onClose={() => {
            setSelectedAsset(null);
            setSeekToTimestamp(null);
          }}
          onRefresh={() => performSearch(searchQuery)}
          seekToTimestamp={seekToTimestamp}
        />
      )}
    </AppLayout>
  );
}
