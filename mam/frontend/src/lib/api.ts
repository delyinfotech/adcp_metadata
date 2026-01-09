const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const ACCESS_TOKEN_KEY = 'mediax_access_token';
const USER_KEY = 'mediax_user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  tenantId: string;
  roleId?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface Asset {
  id: string;
  title: string;
  filename: string;
  description?: string;
  assetType: string;
  mimeType: string;
  fileSize: number | string;  // API returns string, needs parsing
  status: string;
  cdnUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  aiTags?: string[];
  aiObjects?: Record<string, any> | null;
  aiFaces?: Record<string, any> | null;
  aiTranscript?: string | null;
  aiSentiment?: string | null;
  aiSafetyScore?: number | null;
  aiFeatures?: Record<string, any> | null;
  customMetadata?: Record<string, any> | null;
  processingProgress?: number;
  version?: number;
  bucket?: string;
  assetKey?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.tokens.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  isFormData = false,
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    // Handle authentication errors - clear auth and redirect to login
    if (response.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  tenantSlug: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  searchMode?: 'keyword' | 'semantic';
  assetType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  folderId?: string;
}

export async function listAssets(params: SearchParams = {}): Promise<{ data: Asset[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.search) query.set('search', params.search);
  if (params.searchMode) query.set('searchMode', params.searchMode);
  if (params.assetType) query.set('assetType', params.assetType);
  if (params.status) query.set('status', params.status);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.folderId) query.set('folderId', params.folderId);

  const queryString = query.toString();
  return apiFetch<{ data: Asset[]; total: number }>(
    `/assets${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' },
  );
}

export async function searchAssets(params: SearchParams): Promise<{ data: Asset[]; total: number }> {
  return listAssets(params);
}

// ============== AI-Powered Search ==============

export interface AISearchMatch {
  type: 'transcript' | 'tag' | 'entity' | 'keyword' | 'title';
  text: string;
  startTime?: number;
  endTime?: number;
  confidence?: number;
}

export interface AISearchResult {
  asset: Asset;
  score: number;
  matches: AISearchMatch[];
}

export interface AISearchResponse {
  results: AISearchResult[];
  totalResults: number;
  processingTimeMs: number;
}

export async function aiSearch(params: {
  query: string;
  limit?: number;
  assetType?: string;
  minScore?: number;
}): Promise<AISearchResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('q', params.query);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.assetType) queryParams.set('assetType', params.assetType);
  if (params.minScore) queryParams.set('minScore', params.minScore.toString());

  return apiFetch<AISearchResponse>(
    `/assets/ai-search?${queryParams.toString()}`,
    { method: 'GET' },
  );
}

export async function uploadAsset(file: File, title?: string, description?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title || file.name);
  if (description) {
    formData.append('description', description);
  }

  return apiFetch<Asset>(
    '/assets/upload',
    {
      method: 'POST',
      body: formData,
    },
    true,
  );
}

export async function triggerExtraction(
  assetId: string,
  params?: { services?: string[]; priority?: 'high' | 'normal' | 'low'; force?: boolean },
) {
  return apiFetch<{ jobId: string; status: string }>('/assets/' + assetId + '/extract', {
    method: 'POST',
    body: JSON.stringify(params || {}),
  });
}

export async function getDownloadUrl(assetId: string) {
  return apiFetch<{ url: string }>('/assets/' + assetId + '/download', {
    method: 'GET',
  });
}

export async function deleteAsset(assetId: string) {
  return apiFetch<{ success: boolean }>('/assets/' + assetId, {
    method: 'DELETE',
  });
}

// ============== Semantic Search API ==============

const METADATA_API_URL =
  process.env.NEXT_PUBLIC_METADATA_API_URL || 'http://localhost:3005';

export interface SemanticSearchResult {
  contentId: string;
  embeddingId: string;
  similarity: number;
  timestamp?: number;
  frameNumber?: number;
  sceneIndex?: number;
  metadata?: Record<string, any>;
}

export interface SemanticSearchResponse {
  query: string;
  totalResults: number;
  results: SemanticSearchResult[];
  processingTimeMs: number;
}

export interface VideoMoment {
  timestamp: number;
  frameNumber: number;
  similarity: number;
  sceneIndex?: number;
  sceneStart?: number;
  sceneEnd?: number;
}

export interface VideoMomentsResponse {
  contentId: string;
  query: string;
  moments: VideoMoment[];
  processingTimeMs: number;
}

export async function semanticSearch(params: {
  query: string;
  tenantId: string;
  embeddingTypes?: string[];
  limit?: number;
  minSimilarity?: number;
  contentIds?: string[];
}): Promise<SemanticSearchResponse> {
  const token = getStoredToken();
  const response = await fetch(`${METADATA_API_URL}/api/v1/search/semantic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Semantic search failed');
  }

  return response.json();
}

export async function searchVideoMoments(params: {
  query: string;
  contentId: string;
  tenantId: string;
  limit?: number;
}): Promise<VideoMomentsResponse> {
  const token = getStoredToken();
  const response = await fetch(`${METADATA_API_URL}/api/v1/search/video/moments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Video moment search failed');
  }

  return response.json();
}

// ============== Hybrid Search ==============

export interface HybridSearchFilters {
  aiTags?: string[];
  sentiment?: string;
  minSafetyScore?: number;
  objects?: string[];
  entities?: string[];
  assetType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface HybridSearchResult {
  contentId: string;
  score: number;
  semanticScore: number;
  keywordScore: number;
  transcriptMatches?: {
    text: string;
    start: number;
    end: number;
    similarity: number;
  }[];
  moments?: VideoMoment[];
  asset?: Asset;
}

export interface HybridSearchResponse {
  query: string;
  totalResults: number;
  results: HybridSearchResult[];
  filtersApplied: HybridSearchFilters;
  processingTimeMs: number;
}

export async function hybridSearch(params: {
  query: string;
  tenantId: string;
  semanticWeight?: number;
  filters?: HybridSearchFilters;
  limit?: number;
  minScore?: number;
}): Promise<HybridSearchResponse> {
  const token = getStoredToken();
  const response = await fetch(`${METADATA_API_URL}/api/v1/search/hybrid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Hybrid search failed');
  }

  return response.json();
}

// ============== Transcript Search ==============

export interface TranscriptMatch {
  contentId: string;
  text: string;
  startTime: number;
  endTime: number;
  score: number;
  contextBefore?: string;
  contextAfter?: string;
}

export interface TranscriptSearchResponse {
  query: string;
  totalMatches: number;
  matches: TranscriptMatch[];
  processingTimeMs: number;
}

export async function searchTranscript(params: {
  query: string;
  tenantId: string;
  contentId?: string;
  limit?: number;
  contextWindow?: number;
}): Promise<TranscriptSearchResponse> {
  const token = getStoredToken();
  const response = await fetch(`${METADATA_API_URL}/api/v1/search/transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Transcript search failed');
  }

  return response.json();
}

// ============== Similar Asset Search ==============

export interface SimilarAssetResult {
  contentId: string;
  similarity: number;
  asset?: Asset;
  sharedTags?: string[];
  similarityBreakdown?: {
    visual?: number;
    audio?: number;
    text?: number;
  };
}

export interface SimilarAssetResponse {
  sourceContentId: string;
  totalResults: number;
  results: SimilarAssetResult[];
  processingTimeMs: number;
}

export async function findSimilarAssets(params: {
  contentId: string;
  tenantId: string;
  limit?: number;
  minSimilarity?: number;
  sameTypeOnly?: boolean;
}): Promise<SimilarAssetResponse> {
  const token = getStoredToken();
  const response = await fetch(`${METADATA_API_URL}/api/v1/search/similar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Similar asset search failed');
  }

  return response.json();
}

// ============== Available Filters ==============

export interface AvailableFilters {
  tags: { tag: string; count: number }[];
  objects: { object: string; count: number }[];
  entities: { entity: string; type: string; count: number }[];
  sentiments: { sentiment: string; count: number }[];
  assetTypes: { type: string; count: number }[];
}

export async function getAvailableFilters(tenantId: string): Promise<AvailableFilters> {
  const token = getStoredToken();
  const response = await fetch(`${METADATA_API_URL}/api/v1/search/filters?tenantId=${tenantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get available filters');
  }

  return response.json();
}
