import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { academyApi, AdminDashboard, SearchResult, AuditLogEntry, AuditLogResponse } from '../../services/academy.api';
import { contentApi, Article, Video as VideoType, ContentListResponse, ContentCategory } from '../../services/content.api';
import { recipesApi, Recipe } from '../../services/recipes.api';
import { trainingApi, CustomWorkout, WorkoutTemplate, FullLibrary } from '../../services/training.api';
import { useAuth, getHomeRoute } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  LayoutDashboard,
  FileText,
  Search,
  Settings,
  Users,
  UserPlus,
  Activity,
  TrendingUp,
  Award,
  UserCheck,
  Plus,
  X,
  Video,
  Trash2,
  Sprout,
  Info,
  UtensilsCrossed,
  Dumbbell,
  Download,
  ClipboardList,
} from 'lucide-react';

type Tab = 'dashboard' | 'conteudo' | 'treinos' | 'pesquisa' | 'logs' | 'config';

const ALLOWED_ROLES = ['academy_admin', 'academy_manager', 'admin', 'super_admin', 'tenant_admin'];

const WORKOUT_TYPES = ['strength', 'hiit', 'cardio', 'yoga', 'pilates', 'mobility', 'functional', 'recovery'];
const INTENSITIES = [
  { value: 'low', label: 'Baixa' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'high', label: 'Alta' },
  { value: 'max', label: 'Maxima' },
];
const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatoria', luteal: 'Lutea',
};
const PHASE_COLORS: Record<string, string> = {
  menstrual: '#ef4444', follicular: '#10b981', ovulatory: '#f59e0b', luteal: '#8b5cf6',
};
const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  CREATE: { bg: '#dcfce7', color: '#166534' },
  UPDATE: { bg: '#dbeafe', color: '#1e40af' },
  DELETE: { bg: '#fef2f2', color: '#dc2626' },
};

const CYCLE_PHASES = [
  { value: 'all', label: 'Todas as fases' },
  { value: 'follicular', label: 'Folicular' },
  { value: 'ovulatory', label: 'Ovulatoria' },
  { value: 'luteal', label: 'Lutea' },
  { value: 'menstrual', label: 'Menstrual' },
];

/* ------------------------------------------------------------------ */
/*  Inline styles                                                      */
/* ------------------------------------------------------------------ */

const S = {
  wrapper: {
    display: 'flex',
    minHeight: 'calc(100vh - 120px)',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  sidebar: {
    width: 220,
    background: '#fafafa',
    borderRight: '1px solid #e5e7eb',
    padding: '24px 0',
    flexShrink: 0,
  } as React.CSSProperties,

  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 20px 20px',
    fontWeight: 700,
    fontSize: 18,
    color: '#1e1e2f',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: 8,
  } as React.CSSProperties,

  navBtn: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 20px',
    border: 'none',
    background: active ? '#ede9fe' : 'transparent',
    color: active ? '#7c3aed' : '#64748b',
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
    transition: 'all 0.15s',
  }) as React.CSSProperties,

  userBox: {
    padding: '16px 20px',
    marginTop: 'auto',
    borderTop: '1px solid #e5e7eb',
    fontSize: 12,
    color: '#94a3b8',
  } as React.CSSProperties,

  main: {
    flex: 1,
    padding: '24px 32px',
    background: '#fff',
    overflowY: 'auto' as const,
  } as React.CSSProperties,

  mobileNav: {
    display: 'none',
    position: 'fixed' as const,
    bottom: 60,
    left: 0,
    right: 0,
    background: '#fff',
    borderTop: '1px solid #e5e7eb',
    zIndex: 40,
    justifyContent: 'space-around',
    padding: '6px 0',
  } as React.CSSProperties,

  mobileTab: (active: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
    border: 'none',
    background: 'transparent',
    color: active ? '#7c3aed' : '#94a3b8',
    fontSize: 10,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    padding: '4px 8px',
    fontFamily: "'DM Sans', sans-serif",
  }) as React.CSSProperties,

  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e1e2f',
    marginBottom: 24,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 28,
  } as React.CSSProperties,

  card: {
    background: '#f8f7ff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '20px 18px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as React.CSSProperties,

  cardIcon: {
    color: '#7c3aed',
    marginBottom: 4,
  } as React.CSSProperties,

  cardValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e1e2f',
  } as React.CSSProperties,

  cardLabel: {
    fontSize: 13,
    color: '#64748b',
  } as React.CSSProperties,

  section: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1e1e2f',
    marginBottom: 12,
  } as React.CSSProperties,

  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    fontSize: 13,
  } as React.CSSProperties,

  breakdownBar: (pct: number) => ({
    height: 8,
    width: 120,
    background: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden' as const,
  }) as React.CSSProperties,

  breakdownFill: (pct: number) => ({
    height: '100%',
    width: `${pct}%`,
    background: '#7c3aed',
    borderRadius: 4,
    transition: 'width 0.3s',
  }) as React.CSSProperties,

  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.15s',
  } as React.CSSProperties,

  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 8px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  select: {
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
    width: '100%',
  } as React.CSSProperties,

  formGroup: {
    marginBottom: 14,
  } as React.CSSProperties,

  formLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
    marginBottom: 4,
  } as React.CSSProperties,

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  } as React.CSSProperties,

  contentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  } as React.CSSProperties,

  contentTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: '#1e1e2f',
  } as React.CSSProperties,

  contentMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  } as React.CSSProperties,

  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 42px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  searchIcon: {
    position: 'absolute' as const,
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  } as React.CSSProperties,

  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    background: '#f8f7ff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    marginBottom: 10,
  } as React.CSSProperties,

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7c3aed',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: '#ede9fe',
    color: '#7c3aed',
    marginLeft: 8,
  } as React.CSSProperties,

  empty: {
    textAlign: 'center' as const,
    color: '#94a3b8',
    padding: '32px 0',
    fontSize: 14,
  } as React.CSSProperties,

  loading: {
    textAlign: 'center' as const,
    color: '#94a3b8',
    padding: '40px 0',
    fontSize: 14,
  } as React.CSSProperties,

  tabRow: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
  } as React.CSSProperties,

  tab: (active: boolean) => ({
    padding: '8px 16px',
    border: 'none',
    borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
    background: 'transparent',
    color: active ? '#7c3aed' : '#64748b',
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }) as React.CSSProperties,

  configRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
  } as React.CSSProperties,

  configLabel: {
    fontWeight: 500,
    color: '#475569',
    minWidth: 160,
  } as React.CSSProperties,

  configValue: {
    color: '#1e1e2f',
  } as React.CSSProperties,

  successMsg: {
    padding: '10px 14px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    color: '#166534',
    fontSize: 13,
    marginTop: 12,
  } as React.CSSProperties,

  errorMsg: {
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 13,
    marginTop: 12,
  } as React.CSSProperties,

  responsiveStyle: `
    @media (max-width: 768px) {
      .cms-sidebar { display: none !important; }
      .cms-mobile-nav { display: flex !important; }
      .cms-main { padding: 16px !important; }
    }
    @media (min-width: 769px) {
      .cms-mobile-nav { display: none !important; }
    }
  `,
};

const NAV_ITEMS: { key: Tab; label: string; icon: React.ReactElement }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'conteudo', label: 'Conteudo', icon: <FileText size={18} /> },
  { key: 'treinos', label: 'Treinos', icon: <Dumbbell size={18} /> },
  { key: 'pesquisa', label: 'Pesquisa', icon: <Search size={18} /> },
  { key: 'logs', label: 'Logs', icon: <ClipboardList size={18} /> },
  { key: 'config', label: 'Config', icon: <Settings size={18} /> },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Dashboard state
  const [dashData, setDashData] = useState<AdminDashboard | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState('');

  // Content state
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentTab, setContentTab] = useState<'articles' | 'videos' | 'recipes'>('articles');
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '', summary: '', body: '', category: '', cyclePhase: 'all', coverImageUrl: '',
  });
  const [videoForm, setVideoForm] = useState({
    title: '', description: '', videoUrl: '', thumbnailUrl: '', category: '', cyclePhase: 'all',
  });
  const [recipeForm, setRecipeForm] = useState({
    title: '', summary: '', instructions: '', category: '', cyclePhase: 'all', coverImageUrl: '',
    prepTimeMinutes: '', cookTimeMinutes: '', servings: '1',
    ingredientsText: '', calories: '', protein: '', carbs: '', fat: '', fiber: '',
    dietaryRestrictions: '',
  });

  // Training state
  const [fullLibrary, setFullLibrary] = useState<FullLibrary | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    name: '', phase: 'follicular', type: 'strength', duration: '30',
    intensity: 'moderate', rpe: '5-7', description: '', reference: '',
    exercisesText: '',
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);

  // Seed state
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [seedError, setSeedError] = useState('');

  // Role check
  useEffect(() => {
    if (currentUser && !ALLOWED_ROLES.includes(currentUser.role)) {
      navigate(getHomeRoute(currentUser));
    }
  }, [currentUser, navigate]);

  // Load dashboard on mount
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setDashLoading(true);
      setDashError('');
      academyApi.dashboard()
        .then(setDashData)
        .catch(() => setDashError('Erro ao carregar dashboard.'))
        .finally(() => setDashLoading(false));
    }
  }, [activeTab]);

  // Load content
  useEffect(() => {
    if (activeTab === 'conteudo') {
      setContentLoading(true);
      Promise.all([
        contentApi.listArticles(),
        contentApi.listVideos(),
        contentApi.listCategories().catch(() => [] as ContentCategory[]),
        recipesApi.list().catch(() => ({ data: [] as Recipe[] })),
      ])
        .then(([a, v, c, r]) => {
          setArticles(a.data);
          setVideos(v.data);
          if (Array.isArray(c)) setCategories(c);
          setRecipes(r.data);
        })
        .catch(() => {})
        .finally(() => setContentLoading(false));
    }
  }, [activeTab]);

  // Load training
  useEffect(() => {
    if (activeTab === 'treinos') {
      setTrainingLoading(true);
      trainingApi.getFullLibrary()
        .then(setFullLibrary)
        .catch(() => {})
        .finally(() => setTrainingLoading(false));
    }
  }, [activeTab]);

  // Load audit logs
  useEffect(() => {
    if (activeTab === 'logs') {
      setAuditLoading(true);
      academyApi.auditLogs(auditPage)
        .then((res) => { setAuditLogs(res.data); setAuditTotal(res.total); })
        .catch(() => {})
        .finally(() => setAuditLoading(false));
    }
  }, [activeTab, auditPage]);

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    academyApi.search(q)
      .then(setSearchResults)
      .catch(() => setSearchResults(null))
      .finally(() => setSearchLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, doSearch]);

  // CSV export helper
  const downloadCsv = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportUsers = async () => {
    try {
      const blob = await academyApi.exportUsers();
      downloadCsv(blob, 'usuarios.csv');
    } catch {
      alert('Erro ao exportar usuarios.');
    }
  };

  const handleExportContent = async () => {
    try {
      const blob = await academyApi.exportContent();
      downloadCsv(blob, 'conteudo.csv');
    } catch {
      alert('Erro ao exportar conteudo.');
    }
  };

  // Seed content
  const handleSeed = async () => {
    setSeedLoading(true);
    setSeedMsg('');
    setSeedError('');
    try {
      const res = await academyApi.seedContent();
      setSeedMsg(res.message || 'Conteudo semeado com sucesso!');
    } catch {
      setSeedError('Erro ao semear conteudo.');
    } finally {
      setSeedLoading(false);
    }
  };

  // Article submit
  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/content/articles', {
        title: articleForm.title,
        summary: articleForm.summary || undefined,
        body: articleForm.body,
        category: articleForm.category || undefined,
        cyclePhase: articleForm.cyclePhase,
        coverImageUrl: articleForm.coverImageUrl || undefined,
      });
      setShowArticleForm(false);
      setArticleForm({ title: '', summary: '', body: '', category: '', cyclePhase: 'all', coverImageUrl: '' });
      contentApi.listArticles().then((r) => setArticles(r.data)).catch(() => {});
    } catch {
      alert('Erro ao criar artigo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Video submit
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/content/videos', {
        title: videoForm.title,
        description: videoForm.description || undefined,
        videoUrl: videoForm.videoUrl,
        thumbnailUrl: videoForm.thumbnailUrl || undefined,
        category: videoForm.category || undefined,
        cyclePhase: videoForm.cyclePhase,
      });
      setShowVideoForm(false);
      setVideoForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '', category: '', cyclePhase: 'all' });
      contentApi.listVideos().then((r) => setVideos(r.data)).catch(() => {});
    } catch {
      alert('Erro ao criar video.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete article
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Apagar este artigo?')) return;
    try {
      await api.delete(`/content/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Erro ao apagar artigo.');
    }
  };

  // Delete video
  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Apagar este video?')) return;
    try {
      await api.delete(`/content/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert('Erro ao apagar video.');
    }
  };

  // Workout submit
  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const exercises = workoutForm.exercisesText
        .split('\n')
        .filter((l) => l.trim())
        .map((line) => {
          const parts = line.trim().split('|').map((p) => p.trim());
          return {
            name: parts[0] || '',
            sets: parts[1] ? Number(parts[1]) : undefined,
            reps: parts[2] || undefined,
            duration: parts[3] || undefined,
            rest: parts[4] || undefined,
            notes: parts[5] || undefined,
          };
        });

      await trainingApi.createCustomWorkout({
        name: workoutForm.name,
        phase: workoutForm.phase,
        type: workoutForm.type,
        duration: Number(workoutForm.duration) || 30,
        intensity: workoutForm.intensity,
        rpe: workoutForm.rpe,
        exercises,
        description: workoutForm.description || undefined,
        reference: workoutForm.reference || undefined,
      });
      setShowWorkoutForm(false);
      setWorkoutForm({
        name: '', phase: 'follicular', type: 'strength', duration: '30',
        intensity: 'moderate', rpe: '5-7', description: '', reference: '',
        exercisesText: '',
      });
      trainingApi.getFullLibrary().then(setFullLibrary).catch(() => {});
    } catch {
      alert('Erro ao criar treino.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete custom workout
  const handleDeleteWorkout = async (id: string) => {
    if (!window.confirm('Apagar este treino personalizado?')) return;
    try {
      await trainingApi.removeCustomWorkout(id);
      trainingApi.getFullLibrary().then(setFullLibrary).catch(() => {});
    } catch {
      alert('Erro ao apagar treino.');
    }
  };

  // Recipe submit
  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ingredients = recipeForm.ingredientsText
        .split('\n')
        .filter((l) => l.trim())
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          const quantity = parts[0] || '';
          const unit = parts[1] || '';
          const name = parts.slice(2).join(' ') || parts.slice(1).join(' ');
          return { quantity, unit, name };
        });

      const macros = recipeForm.calories ? {
        calories: Number(recipeForm.calories) || 0,
        protein: Number(recipeForm.protein) || 0,
        carbs: Number(recipeForm.carbs) || 0,
        fat: Number(recipeForm.fat) || 0,
        fiber: recipeForm.fiber ? Number(recipeForm.fiber) : undefined,
      } : undefined;

      const restrictions = recipeForm.dietaryRestrictions
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      await recipesApi.create({
        title: recipeForm.title,
        summary: recipeForm.summary || undefined,
        instructions: recipeForm.instructions,
        ingredients,
        macros: macros as any,
        coverImageUrl: recipeForm.coverImageUrl || undefined,
        prepTimeMinutes: recipeForm.prepTimeMinutes ? Number(recipeForm.prepTimeMinutes) : 0,
        cookTimeMinutes: recipeForm.cookTimeMinutes ? Number(recipeForm.cookTimeMinutes) : 0,
        servings: Number(recipeForm.servings) || 1,
        dietaryRestrictions: restrictions,
        cyclePhase: recipeForm.cyclePhase as any,
      });
      setShowRecipeForm(false);
      setRecipeForm({
        title: '', summary: '', instructions: '', category: '', cyclePhase: 'all', coverImageUrl: '',
        prepTimeMinutes: '', cookTimeMinutes: '', servings: '1',
        ingredientsText: '', calories: '', protein: '', carbs: '', fat: '', fiber: '',
        dietaryRestrictions: '',
      });
      recipesApi.list().then((r) => setRecipes(r.data)).catch(() => {});
    } catch {
      alert('Erro ao criar receita.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete recipe
  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('Apagar esta receita?')) return;
    try {
      await recipesApi.remove(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Erro ao apagar receita.');
    }
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!currentUser) {
    return <Layout title="Admin"><p style={S.loading}>Carregando...</p></Layout>;
  }
  if (!ALLOWED_ROLES.includes(currentUser.role)) return null;

  /* ---- Dashboard Tab ---- */
  const renderDashboard = () => {
    if (dashLoading) return <p style={S.loading}>Carregando metricas...</p>;
    if (dashError) return <p style={S.errorMsg}>{dashError}</p>;
    if (!dashData) return <p style={S.loading}>Carregando...</p>;

    const maxRole = Math.max(...dashData.usersByRole.map((r) => Number(r.count)), 1);
    const maxGoal = Math.max(...dashData.usersByGoal.map((g) => Number(g.count)), 1);

    return (
      <>
        <h2 style={S.pageTitle}>Dashboard</h2>

        <div style={S.grid}>
          <div style={S.card}>
            <Users size={22} style={S.cardIcon} />
            <div style={S.cardValue}>{dashData.totalUsers}</div>
            <div style={S.cardLabel}>Usuarios totais</div>
          </div>
          <div style={S.card}>
            <UserPlus size={22} style={S.cardIcon} />
            <div style={S.cardValue}>{dashData.recentSignups}</div>
            <div style={S.cardLabel}>Registos recentes</div>
          </div>
          <div style={S.card}>
            <Activity size={22} style={S.cardIcon} />
            <div style={S.cardValue}>{dashData.workoutsThisWeek}</div>
            <div style={S.cardLabel}>Treinos esta semana</div>
          </div>
          <div style={S.card}>
            <TrendingUp size={22} style={S.cardIcon} />
            <div style={S.cardValue}>{(dashData.avgFrequency * 100).toFixed(0)}%</div>
            <div style={S.cardLabel}>Frequencia media</div>
          </div>
          <div style={S.card}>
            <Award size={22} style={S.cardIcon} />
            <div style={S.cardValue}>{dashData.activeChallenges}</div>
            <div style={S.cardLabel}>Desafios ativos</div>
          </div>
          <div style={S.card}>
            <UserCheck size={22} style={S.cardIcon} />
            <div style={S.cardValue}>{dashData.challengeParticipants}</div>
            <div style={S.cardLabel}>Participantes desafios</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Usuarios por papel</h3>
            {dashData.usersByRole.map((r) => (
              <div key={r.role} style={S.breakdownRow}>
                <span style={{ minWidth: 120, color: '#475569' }}>{r.role}</span>
                <div style={S.breakdownBar(0)}>
                  <div style={S.breakdownFill((Number(r.count) / maxRole) * 100)} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e1e2f' }}>{r.count}</span>
              </div>
            ))}
          </div>
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Usuarios por objetivo</h3>
            {dashData.usersByGoal.map((g) => (
              <div key={g.goal} style={S.breakdownRow}>
                <span style={{ minWidth: 120, color: '#475569' }}>{g.goal || 'Nenhum'}</span>
                <div style={S.breakdownBar(0)}>
                  <div style={S.breakdownFill((Number(g.count) / maxGoal) * 100)} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e1e2f' }}>{g.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={S.section}>
          <h3 style={S.sectionTitle}>Exportar dados</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={S.btnSecondary} onClick={handleExportUsers}>
              <Download size={14} /> Exportar usuarios (CSV)
            </button>
            <button style={S.btnSecondary} onClick={handleExportContent}>
              <Download size={14} /> Exportar conteudo (CSV)
            </button>
          </div>
        </div>

        <div style={S.section}>
          <button style={S.btnPrimary} onClick={handleSeed} disabled={seedLoading}>
            <Sprout size={16} />
            {seedLoading ? 'Semeando...' : 'Semear conteudo'}
          </button>
          {seedMsg && <div style={S.successMsg}>{seedMsg}</div>}
          {seedError && <div style={S.errorMsg}>{seedError}</div>}
        </div>
      </>
    );
  };

  /* ---- Conteudo Tab ---- */
  const renderConteudo = () => {
    if (contentLoading) return <p style={S.loading}>Carregando conteudo...</p>;

    return (
      <>
        <h2 style={S.pageTitle}>Conteudo</h2>

        <div style={S.tabRow}>
          <button style={S.tab(contentTab === 'articles')} onClick={() => { setContentTab('articles'); setShowVideoForm(false); setShowRecipeForm(false); }}>
            <FileText size={14} /> Artigos ({articles.length})
          </button>
          <button style={S.tab(contentTab === 'videos')} onClick={() => { setContentTab('videos'); setShowArticleForm(false); setShowRecipeForm(false); }}>
            <Video size={14} /> Videos ({videos.length})
          </button>
          <button style={S.tab(contentTab === 'recipes')} onClick={() => { setContentTab('recipes'); setShowArticleForm(false); setShowVideoForm(false); }}>
            <UtensilsCrossed size={14} /> Receitas ({recipes.length})
          </button>
        </div>

        {/* Article form toggle */}
        {contentTab === 'articles' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button
                style={showArticleForm ? S.btnSecondary : S.btnPrimary}
                onClick={() => setShowArticleForm(!showArticleForm)}
              >
                {showArticleForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Novo artigo</>}
              </button>
            </div>

            {showArticleForm && (
              <form style={{ ...S.section, marginBottom: 20 }} onSubmit={handleArticleSubmit}>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Titulo</label>
                  <input style={S.input} type="text" value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    required placeholder="Titulo do artigo" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Resumo</label>
                  <input style={S.input} type="text" value={articleForm.summary}
                    onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                    placeholder="Resumo breve (opcional)" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Corpo</label>
                  <textarea style={S.textarea} rows={8} value={articleForm.body}
                    onChange={(e) => setArticleForm({ ...articleForm, body: e.target.value })}
                    required placeholder="Corpo do artigo..." />
                </div>
                <div style={S.formRow}>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Categoria</label>
                    <select style={S.select} value={articleForm.category}
                      onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}>
                      <option value="">Selecionar...</option>
                      {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Fase do ciclo</label>
                    <select style={S.select} value={articleForm.cyclePhase}
                      onChange={(e) => setArticleForm({ ...articleForm, cyclePhase: e.target.value })}>
                      {CYCLE_PHASES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>URL da imagem de capa (opcional)</label>
                  <input style={S.input} type="url" value={articleForm.coverImageUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, coverImageUrl: e.target.value })}
                    placeholder="https://..." />
                </div>
                <button type="submit" style={S.btnPrimary} disabled={submitting}>
                  {submitting ? 'Publicando...' : 'Publicar artigo'}
                </button>
              </form>
            )}

            <div>
              {articles.length === 0 ? (
                <p style={S.empty}>Nenhum artigo publicado.</p>
              ) : (
                articles.map((a) => (
                  <div key={a.id} style={S.contentItem}>
                    <div>
                      <div style={S.contentTitle}>{a.title}</div>
                      <div style={S.contentMeta}>
                        {a.category?.name || '-'} &middot; {a.cyclePhase} &middot; {formatDate(a.publishedAt || a.createdAt)}
                      </div>
                    </div>
                    <button style={S.btnDanger} onClick={() => handleDeleteArticle(a.id)} title="Apagar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Video form toggle */}
        {contentTab === 'videos' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button
                style={showVideoForm ? S.btnSecondary : S.btnPrimary}
                onClick={() => setShowVideoForm(!showVideoForm)}
              >
                {showVideoForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Novo video</>}
              </button>
            </div>

            {showVideoForm && (
              <form style={{ ...S.section, marginBottom: 20 }} onSubmit={handleVideoSubmit}>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Titulo</label>
                  <input style={S.input} type="text" value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    required placeholder="Titulo do video" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Descricao</label>
                  <textarea style={S.textarea} rows={3} value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="Descricao opcional..." />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>URL do video</label>
                  <input style={S.input} type="url" value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    required placeholder="https://..." />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>URL do thumbnail (opcional)</label>
                  <input style={S.input} type="url" value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    placeholder="https://..." />
                </div>
                <div style={S.formRow}>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Categoria</label>
                    <select style={S.select} value={videoForm.category}
                      onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}>
                      <option value="">Selecionar...</option>
                      {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Fase do ciclo</label>
                    <select style={S.select} value={videoForm.cyclePhase}
                      onChange={(e) => setVideoForm({ ...videoForm, cyclePhase: e.target.value })}>
                      {CYCLE_PHASES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" style={S.btnPrimary} disabled={submitting}>
                  {submitting ? 'Publicando...' : 'Publicar video'}
                </button>
              </form>
            )}

            <div>
              {videos.length === 0 ? (
                <p style={S.empty}>Nenhum video publicado.</p>
              ) : (
                videos.map((v) => (
                  <div key={v.id} style={S.contentItem}>
                    <div>
                      <div style={S.contentTitle}>{v.title}</div>
                      <div style={S.contentMeta}>
                        {v.category?.name || '-'} &middot; {v.cyclePhase} &middot; {formatDate(v.publishedAt || v.createdAt)}
                      </div>
                    </div>
                    <button style={S.btnDanger} onClick={() => handleDeleteVideo(v.id)} title="Apagar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Recipe form toggle */}
        {contentTab === 'recipes' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button
                style={showRecipeForm ? S.btnSecondary : S.btnPrimary}
                onClick={() => setShowRecipeForm(!showRecipeForm)}
              >
                {showRecipeForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nova receita</>}
              </button>
            </div>

            {showRecipeForm && (
              <form style={{ ...S.section, marginBottom: 20 }} onSubmit={handleRecipeSubmit}>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Titulo</label>
                  <input style={S.input} type="text" value={recipeForm.title}
                    onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                    required placeholder="Nome da receita" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Resumo</label>
                  <input style={S.input} type="text" value={recipeForm.summary}
                    onChange={(e) => setRecipeForm({ ...recipeForm, summary: e.target.value })}
                    placeholder="Descricao breve (opcional)" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Ingredientes (um por linha: quantidade unidade nome)</label>
                  <textarea style={S.textarea} rows={6} value={recipeForm.ingredientsText}
                    onChange={(e) => setRecipeForm({ ...recipeForm, ingredientsText: e.target.value })}
                    required placeholder={"2 xic arroz integral\n1 un peito de frango\n200 g brocolis"} />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Modo de preparo</label>
                  <textarea style={S.textarea} rows={8} value={recipeForm.instructions}
                    onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                    required placeholder="Passo a passo do preparo..." />
                </div>

                <div style={{ ...S.section, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 10 }}>Macros por porcao</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    <div>
                      <label style={{ ...S.formLabel, fontSize: 11 }}>Calorias</label>
                      <input style={S.input} type="number" value={recipeForm.calories}
                        onChange={(e) => setRecipeForm({ ...recipeForm, calories: e.target.value })}
                        placeholder="kcal" />
                    </div>
                    <div>
                      <label style={{ ...S.formLabel, fontSize: 11 }}>Proteina (g)</label>
                      <input style={S.input} type="number" value={recipeForm.protein}
                        onChange={(e) => setRecipeForm({ ...recipeForm, protein: e.target.value })}
                        placeholder="g" />
                    </div>
                    <div>
                      <label style={{ ...S.formLabel, fontSize: 11 }}>Carbos (g)</label>
                      <input style={S.input} type="number" value={recipeForm.carbs}
                        onChange={(e) => setRecipeForm({ ...recipeForm, carbs: e.target.value })}
                        placeholder="g" />
                    </div>
                    <div>
                      <label style={{ ...S.formLabel, fontSize: 11 }}>Gordura (g)</label>
                      <input style={S.input} type="number" value={recipeForm.fat}
                        onChange={(e) => setRecipeForm({ ...recipeForm, fat: e.target.value })}
                        placeholder="g" />
                    </div>
                    <div>
                      <label style={{ ...S.formLabel, fontSize: 11 }}>Fibra (g)</label>
                      <input style={S.input} type="number" value={recipeForm.fiber}
                        onChange={(e) => setRecipeForm({ ...recipeForm, fiber: e.target.value })}
                        placeholder="g" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Preparo (min)</label>
                    <input style={S.input} type="number" value={recipeForm.prepTimeMinutes}
                      onChange={(e) => setRecipeForm({ ...recipeForm, prepTimeMinutes: e.target.value })}
                      placeholder="15" />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Cozimento (min)</label>
                    <input style={S.input} type="number" value={recipeForm.cookTimeMinutes}
                      onChange={(e) => setRecipeForm({ ...recipeForm, cookTimeMinutes: e.target.value })}
                      placeholder="30" />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Porcoes</label>
                    <input style={S.input} type="number" value={recipeForm.servings}
                      onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value })}
                      placeholder="1" />
                  </div>
                </div>

                <div style={S.formRow}>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Fase do ciclo</label>
                    <select style={S.select} value={recipeForm.cyclePhase}
                      onChange={(e) => setRecipeForm({ ...recipeForm, cyclePhase: e.target.value })}>
                      {CYCLE_PHASES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.formLabel}>Restricoes (separadas por virgula)</label>
                    <input style={S.input} type="text" value={recipeForm.dietaryRestrictions}
                      onChange={(e) => setRecipeForm({ ...recipeForm, dietaryRestrictions: e.target.value })}
                      placeholder="sem gluten, sem lactose, vegana" />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.formLabel}>URL da imagem de capa (opcional)</label>
                  <input style={S.input} type="url" value={recipeForm.coverImageUrl}
                    onChange={(e) => setRecipeForm({ ...recipeForm, coverImageUrl: e.target.value })}
                    placeholder="https://..." />
                </div>

                <button type="submit" style={S.btnPrimary} disabled={submitting}>
                  {submitting ? 'Publicando...' : 'Publicar receita'}
                </button>
              </form>
            )}

            <div>
              {recipes.length === 0 ? (
                <p style={S.empty}>Nenhuma receita publicada.</p>
              ) : (
                recipes.map((r) => (
                  <div key={r.id} style={S.contentItem}>
                    <div style={{ flex: 1 }}>
                      <div style={S.contentTitle}>{r.title}</div>
                      <div style={S.contentMeta}>
                        {r.cyclePhase} &middot; {r.macros ? `${r.macros.calories} kcal` : '-'} &middot;
                        {r.prepTimeMinutes + r.cookTimeMinutes > 0
                          ? ` ${r.prepTimeMinutes + r.cookTimeMinutes} min`
                          : ''} &middot; {r.servings} {r.servings === 1 ? 'porcao' : 'porcoes'} &middot;
                        {formatDate(r.publishedAt || r.createdAt)}
                      </div>
                      {r.dietaryRestrictions.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {r.dietaryRestrictions.map((dr) => (
                            <span key={dr} style={{ ...S.badge, fontSize: 10, marginLeft: 0, marginRight: 4, background: '#fef3c7', color: '#92400e' }}>
                              {dr}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button style={S.btnDanger} onClick={() => handleDeleteRecipe(r.id)} title="Apagar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </>
    );
  };

  /* ---- Treinos Tab ---- */
  const renderTreinos = () => {
    if (trainingLoading) return <p style={S.loading}>Carregando treinos...</p>;
    if (!fullLibrary) return <p style={S.loading}>Carregando...</p>;

    return (
      <>
        <h2 style={S.pageTitle}>Biblioteca de Treinos</h2>

        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <button
            style={showWorkoutForm ? S.btnSecondary : S.btnPrimary}
            onClick={() => setShowWorkoutForm(!showWorkoutForm)}
          >
            {showWorkoutForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Novo treino</>}
          </button>
        </div>

        {showWorkoutForm && (
          <form style={{ ...S.section, marginBottom: 20 }} onSubmit={handleWorkoutSubmit}>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Nome do treino</label>
              <input style={S.input} type="text" value={workoutForm.name}
                onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                required placeholder="Ex: Forca progressiva - membros inferiores" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Fase</label>
                <select style={S.select} value={workoutForm.phase}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, phase: e.target.value })}>
                  <option value="menstrual">Menstrual</option>
                  <option value="follicular">Folicular</option>
                  <option value="ovulatory">Ovulatoria</option>
                  <option value="luteal">Lutea</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Tipo</label>
                <select style={S.select} value={workoutForm.type}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, type: e.target.value })}>
                  {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Intensidade</label>
                <select style={S.select} value={workoutForm.intensity}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, intensity: e.target.value })}>
                  {INTENSITIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>RPE</label>
                <input style={S.input} type="text" value={workoutForm.rpe}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, rpe: e.target.value })}
                  placeholder="5-7" />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Duracao (min)</label>
              <input style={S.input} type="number" value={workoutForm.duration}
                onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                placeholder="30" />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Exercicios (um por linha: nome | series | reps | duracao | descanso | notas)</label>
              <textarea style={S.textarea} rows={6} value={workoutForm.exercisesText}
                onChange={(e) => setWorkoutForm({ ...workoutForm, exercisesText: e.target.value })}
                required placeholder={"Agachamento livre | 4 | 8-10 | | 90s |\nLeg press | 3 | 10-12 | | 60s |\nPrancha | 3 | | 30s | 30s |"} />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Descricao</label>
              <textarea style={S.textarea} rows={3} value={workoutForm.description}
                onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                placeholder="Descricao do treino e orientacoes..." />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Referencia cientifica (opcional)</label>
              <input style={S.input} type="text" value={workoutForm.reference}
                onChange={(e) => setWorkoutForm({ ...workoutForm, reference: e.target.value })}
                placeholder="McNulty et al. 2020, Sports Med" />
            </div>
            <button type="submit" style={S.btnPrimary} disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar treino'}
            </button>
          </form>
        )}

        {/* Custom workouts */}
        {fullLibrary.custom.length > 0 && (
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Treinos personalizados ({fullLibrary.custom.length})</h3>
            {fullLibrary.custom.map((w) => (
              <div key={w.id} style={S.contentItem}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={S.contentTitle}>{w.name}</div>
                    <span style={{ ...S.badge, background: PHASE_COLORS[w.phase] + '20', color: PHASE_COLORS[w.phase] }}>
                      {PHASE_LABELS[w.phase] || w.phase}
                    </span>
                  </div>
                  <div style={S.contentMeta}>
                    {w.type} &middot; {w.duration} min &middot; RPE {w.rpe} &middot; {w.exercises.length} exercicios
                  </div>
                </div>
                <button style={S.btnDanger} onClick={() => handleDeleteWorkout(w.id)} title="Apagar">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Built-in library */}
        <div style={S.section}>
          <h3 style={S.sectionTitle}>Biblioteca padrao ({fullLibrary.builtin.length} treinos)</h3>
          {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as const).map((phase) => {
            const phaseWorkouts = fullLibrary.builtin.filter((w) => w.phase === phase);
            if (phaseWorkouts.length === 0) return null;
            return (
              <div key={phase} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PHASE_COLORS[phase] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {PHASE_LABELS[phase]} ({phaseWorkouts.length})
                  </span>
                </div>
                {phaseWorkouts.map((w, i) => (
                  <div key={i} style={{ ...S.contentItem, opacity: 0.8 }}>
                    <div>
                      <div style={S.contentTitle}>{w.name}</div>
                      <div style={S.contentMeta}>
                        {w.type} &middot; {w.duration} min &middot; RPE {w.rpe} &middot; {w.intensity} &middot; {w.exercises.length} exercicios
                      </div>
                    </div>
                    <span style={{ ...S.badge, background: '#f1f5f9', color: '#64748b', fontSize: 10 }}>padrao</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  /* ---- Pesquisa Tab ---- */
  const renderPesquisa = () => (
    <>
      <h2 style={S.pageTitle}>Pesquisa</h2>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={18} style={S.searchIcon} />
        <input
          style={S.searchInput}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar usuarios por nome ou email..."
        />
      </div>

      {searchLoading && <p style={S.loading}>Pesquisando...</p>}

      {!searchLoading && searchResults && searchResults.users.length === 0 && searchQuery.trim() && (
        <p style={S.empty}>Nenhum resultado encontrado.</p>
      )}

      {!searchLoading && searchResults && searchResults.users.map((u) => (
        <div key={u.id} style={S.userCard}>
          <div style={S.userAvatar}>
            {u.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1e1e2f' }}>
              {u.name}
              <span style={S.badge}>{u.role}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{u.email}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Registado: {formatDate(u.createdAt)}
            </div>
          </div>
        </div>
      ))}

      {!searchQuery.trim() && !searchLoading && (
        <div style={S.empty}>
          <Search size={32} style={{ color: '#d4d4d8', marginBottom: 8 }} />
          <div>Digite um nome ou email para pesquisar</div>
        </div>
      )}
    </>
  );

  /* ---- Logs Tab ---- */

  const renderLogs = () => {
    if (auditLoading) return <p style={S.loading}>Carregando logs...</p>;

    return (
      <>
        <h2 style={S.pageTitle}>Logs de atividade</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Total: {auditTotal} registros
        </p>

        {auditLogs.length === 0 ? (
          <p style={S.empty}>Nenhum log de atividade registrado.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Data</th>
                    <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Usuario</th>
                    <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Acao</th>
                    <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Recurso</th>
                    <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>Caminho</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const actionStyle = ACTION_COLORS[log.action] || { bg: '#f1f5f9', color: '#64748b' };
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#1e1e2f' }}>{log.userName || '-'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                            fontSize: 11, fontWeight: 600, background: actionStyle.bg, color: actionStyle.color,
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{log.resource}</td>
                        <td style={{ padding: '8px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>
                          {log.method} {log.path}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {auditTotal > 30 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                <button style={S.btnSecondary} disabled={auditPage <= 1}
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}>
                  Anterior
                </button>
                <span style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>
                  Pagina {auditPage} de {Math.ceil(auditTotal / 30)}
                </span>
                <button style={S.btnSecondary} disabled={auditPage >= Math.ceil(auditTotal / 30)}
                  onClick={() => setAuditPage((p) => p + 1)}>
                  Proxima
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  /* ---- Config Tab ---- */
  const renderConfig = () => (
    <>
      <h2 style={S.pageTitle}>Configuracoes</h2>

      <div style={S.section}>
        <h3 style={S.sectionTitle}>Informacoes da conta</h3>
        <div style={S.configRow}>
          <span style={S.configLabel}>Nome</span>
          <span style={S.configValue}>{currentUser.name}</span>
        </div>
        <div style={S.configRow}>
          <span style={S.configLabel}>Email</span>
          <span style={S.configValue}>{currentUser.email}</span>
        </div>
        <div style={S.configRow}>
          <span style={S.configLabel}>Papel</span>
          <span style={S.configValue}>
            <span style={S.badge}>{currentUser.role}</span>
          </span>
        </div>
        <div style={S.configRow}>
          <span style={S.configLabel}>Tenant ID</span>
          <span style={{ ...S.configValue, fontFamily: 'monospace', fontSize: 12 }}>
            {currentUser.tenantId}
          </span>
        </div>
      </div>

      <div style={S.section}>
        <h3 style={S.sectionTitle}>White Label / Branding</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
          Configure cores e identidade visual da sua academia. As alteracoes sao aplicadas para todos os usuarios do tenant.
        </p>
        <div style={S.formRow}>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Cor primaria</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" defaultValue="#7C3AED" style={{ width: 40, height: 32, border: 'none', cursor: 'pointer' }}
                onChange={(e) => {
                  document.documentElement.style.setProperty('--color-primary', e.target.value);
                }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>Preview ao vivo</span>
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Cor accent (pingo do i)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" defaultValue="#E85D04" style={{ width: 40, height: 32, border: 'none', cursor: 'pointer' }}
                onChange={(e) => {
                  document.documentElement.style.setProperty('--color-accent', e.target.value);
                }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>Preview ao vivo</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          Para salvar permanentemente, use a API: PATCH /tenants/:id com primaryColor e accentColor.
        </p>
      </div>

      <div style={S.section}>
        <h3 style={S.sectionTitle}>Conteudo inicial</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
          Semeia 20 artigos, 8 receitas e 5 categorias de exemplo para popular o CMS.
        </p>
        <button style={S.btnPrimary} onClick={handleSeed} disabled={seedLoading}>
          <Sprout size={16} />
          {seedLoading ? 'Semeando...' : 'Semear conteudo inicial'}
        </button>
        {seedMsg && <div style={S.successMsg}>{seedMsg}</div>}
        {seedError && <div style={S.errorMsg}>{seedError}</div>}
      </div>

      <div style={{ ...S.section, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Info size={16} style={{ color: '#166534' }} />
          <h3 style={{ ...S.sectionTitle, marginBottom: 0, color: '#166534' }}>Versao</h3>
        </div>
        <p style={{ fontSize: 13, color: '#166534' }}>EliaMov CMS v1.0</p>
      </div>
    </>
  );

  /* ---- Render ---- */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'conteudo': return renderConteudo();
      case 'treinos': return renderTreinos();
      case 'pesquisa': return renderPesquisa();
      case 'logs': return renderLogs();
      case 'config': return renderConfig();
    }
  };

  return (
    <Layout title="Admin CMS">
      <style>{S.responsiveStyle}</style>
      <div style={S.wrapper}>
        {/* Desktop sidebar */}
        <aside className="cms-sidebar" style={S.sidebar}>
          <div style={S.sidebarBrand}>
            <LayoutDashboard size={20} />
            <span>CMS</span>
          </div>
          <nav style={{ marginTop: 8 }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                style={S.navBtn(activeTab === item.key)}
                onClick={() => setActiveTab(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={S.userBox}>
            <div style={{ fontWeight: 600, color: '#475569' }}>{currentUser.name}</div>
            <div>{currentUser.role}</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="cms-main" style={S.main}>
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="cms-mobile-nav" style={S.mobileNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            style={S.mobileTab(activeTab === item.key)}
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </Layout>
  );
};

export default AdminPanel;
