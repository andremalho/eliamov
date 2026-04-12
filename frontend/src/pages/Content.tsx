import React, { useEffect, useState, useCallback } from 'react';
import { contentApi, Article, Video, ContentCategory, SavedContent, ContentQueryParams } from '../services/content.api';
import Layout from '../components/Layout';
import Markdown from '../components/Markdown';
import { formatBR } from '../utils/format';

type Tab = 'articles' | 'videos' | 'saved';

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#DB2777',
  follicular: '#16A34A',
  ovulatory: '#D97706',
  luteal: '#7C3AED',
  all: '#6B7280',
};

const PHASE_BG: Record<string, string> = {
  menstrual: '#FDF2F8',
  follicular: '#F0FDF4',
  ovulatory: '#FFFBEB',
  luteal: '#F5F3FF',
  all: '#F9FAFB',
};

const PHASE_LABELS: Record<string, string> = {
  follicular: 'Folicular',
  ovulatory: 'Ovulatoria',
  luteal: 'Lutea',
  menstrual: 'Menstrual',
  all: 'Todas',
};

const CATEGORY_COLORS = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#DB2777'];

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/* ---- Icons ---- */
const ArticleIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h4" />
  </svg>
);
const VideoIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="15" height="16" rx="2" /><path d="M17 8l5-3v14l-5-3" />
  </svg>
);
const BookmarkIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3h14v18l-7-5-7 5V3z" />
  </svg>
);
const PlayIcon = () => (
  <svg width={32} height={32} viewBox="0 0 24 24" fill="#fff" stroke="none">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const EmptyIcon = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
    {children}
  </div>
);

/* ---- Styles ---- */
const st = {
  container: { fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' as const, gap: 16 },
  tabRow: {
    display: 'flex',
    background: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: '9px 0',
    border: 'none',
    borderRadius: 10,
    background: active ? '#fff' : 'transparent',
    color: active ? '#7C3AED' : '#6B7280',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  }),
  filterRow: {
    display: 'flex',
    gap: 8,
  },
  select: {
    flex: 1,
    padding: '9px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 12,
    color: '#374151',
    background: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 28,
  },
  searchInput: {
    flex: 1,
    padding: '9px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 12,
    color: '#374151',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    background: '#fff',
  },
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: 0,
    overflow: 'hidden' as const,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    marginBottom: 12,
  },
  cardBody: {
    padding: '14px 16px 16px',
  },
  coverImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover' as const,
    display: 'block',
  },
  coverPlaceholder: (color: string) => ({
    width: '100%',
    height: 100,
    background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    flex: 1,
    lineHeight: '1.35',
  },
  bookmarkBtn: (saved: boolean) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    color: saved ? '#7C3AED' : '#D1D5DB',
    padding: '2px 4px',
    flexShrink: 0,
    transition: 'color 0.2s',
  }),
  badgeRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap' as const,
  },
  categoryBadge: (idx: number) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 20,
    background: `${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}12`,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }),
  phaseBadge: (phase: string) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 20,
    background: PHASE_BG[phase] || PHASE_BG.all,
    color: PHASE_COLORS[phase] || PHASE_COLORS.all,
  }),
  summary: {
    fontSize: 12,
    color: '#6B7280',
    margin: '0 0 8px',
    lineHeight: '1.5',
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  videoThumbWrap: {
    position: 'relative' as const,
    width: '100%',
    height: 160,
    overflow: 'hidden' as const,
    background: '#F3F4F6',
  },
  videoThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  playOverlay: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(124,58,237,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute' as const,
    bottom: 8,
    right: 8,
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 6,
  },
  savedCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center',
    gap: 12,
  },
  removeBtn: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 8,
    color: '#DC2626',
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap' as const,
  },
  typeBadge: (isArticle: boolean) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 20,
    background: isArticle ? '#EDE9FE' : '#DBEAFE',
    color: isArticle ? '#7C3AED' : '#2563EB',
    marginRight: 8,
  }),
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 4px',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    margin: 0,
  },
  error: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#DC2626',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '32px 0',
    fontSize: 13,
    color: '#9CA3AF',
  },
  expandedBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid #F3F4F6',
  },
};

export default function Content() {
  const [tab, setTab] = useState<Tab>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [saved, setSaved] = useState<SavedContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [phase, setPhase] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<Map<string, string>>(new Map());

  const buildParams = useCallback((): ContentQueryParams => {
    const p: ContentQueryParams = {};
    if (phase) p.phase = phase;
    if (category) p.category = category;
    if (search.trim()) p.search = search.trim();
    return p;
  }, [phase, category, search]);

  const loadCategories = useCallback(() => {
    contentApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  const loadSaved = useCallback(() => {
    contentApi.listSaved().then((items) => {
      setSaved(items);
      const map = new Map<string, string>();
      items.forEach((s) => map.set(`${s.contentType}:${s.contentId}`, s.id));
      setSavedIds(map);
    }).catch(() => {});
  }, []);

  const loadArticles = useCallback(() => {
    setLoading(true);
    setError(null);
    contentApi.listArticles(buildParams())
      .then((res) => setArticles(res.data))
      .catch(() => setError('Nao foi possivel carregar os artigos.'))
      .finally(() => setLoading(false));
  }, [buildParams]);

  const loadVideos = useCallback(() => {
    setLoading(true);
    setError(null);
    contentApi.listVideos(buildParams())
      .then((res) => setVideos(res.data))
      .catch(() => setError('Nao foi possivel carregar os videos.'))
      .finally(() => setLoading(false));
  }, [buildParams]);

  useEffect(() => {
    loadCategories();
    loadSaved();
  }, [loadCategories, loadSaved]);

  useEffect(() => {
    if (tab === 'articles') loadArticles();
    else if (tab === 'videos') loadVideos();
    else {
      loadSaved();
      setLoading(false);
    }
  }, [tab, phase, category, search, loadArticles, loadVideos, loadSaved]);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const isSaved = (contentType: 'article' | 'video', contentId: string) =>
    savedIds.has(`${contentType}:${contentId}`);

  const handleBookmark = async (contentType: 'article' | 'video', contentId: string) => {
    const key = `${contentType}:${contentId}`;
    if (savedIds.has(key)) {
      const savedId = savedIds.get(key)!;
      await contentApi.removeSaved(savedId);
    } else {
      await contentApi.save(contentType, contentId);
    }
    loadSaved();
  };

  const handleRemoveSaved = async (id: string) => {
    await contentApi.removeSaved(id);
    loadSaved();
  };

  const getCategoryIndex = (cat?: ContentCategory | null): number => {
    if (!cat) return 0;
    const idx = categories.findIndex((c) => c.id === cat.id);
    return idx >= 0 ? idx : 0;
  };

  /* ---- Render helpers ---- */

  const renderPhaseBadge = (phase: string) => (
    <span style={st.phaseBadge(phase)}>
      {PHASE_LABELS[phase] || phase}
    </span>
  );

  const renderCategoryBadge = (cat?: ContentCategory | null) => {
    if (!cat) return null;
    return <span style={st.categoryBadge(getCategoryIndex(cat))}>{cat.name}</span>;
  };

  const renderArticleCard = (article: Article) => {
    const expanded = expandedId === article.id;
    const phaseColor = PHASE_COLORS[article.cyclePhase] || '#7C3AED';

    return (
      <div key={article.id} style={st.card} onClick={() => toggle(article.id)}>
        {article.coverImageUrl ? (
          <img src={article.coverImageUrl} alt={article.title} style={st.coverImage} />
        ) : (
          <div style={st.coverPlaceholder(phaseColor)}>
            <ArticleIcon />
          </div>
        )}
        <div style={st.cardBody}>
          <div style={st.titleRow}>
            <h3 style={st.cardTitle}>{article.title}</h3>
            <button
              style={st.bookmarkBtn(isSaved('article', article.id))}
              onClick={(e) => { e.stopPropagation(); handleBookmark('article', article.id); }}
              aria-label="Salvar"
            >
              {isSaved('article', article.id) ? '\u2665' : '\u2661'}
            </button>
          </div>
          <div style={st.badgeRow}>
            {renderCategoryBadge(article.category)}
            {renderPhaseBadge(article.cyclePhase)}
          </div>
          {expanded ? (
            <div style={st.expandedBody}>
              <Markdown>{article.body}</Markdown>
            </div>
          ) : (
            <p style={st.summary}>
              {article.summary || (article.body ? article.body.slice(0, 150) + (article.body.length > 150 ? '...' : '') : 'Sem descricao.')}
            </p>
          )}
          <span style={st.date}>{formatBR(article.publishedAt)}</span>
        </div>
      </div>
    );
  };

  const renderVideoCard = (video: Video) => (
    <div
      key={video.id}
      style={st.card}
      onClick={() => window.open(video.videoUrl, '_blank')}
    >
      <div style={st.videoThumbWrap}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} style={st.videoThumbImg} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#E5E7EB' }} />
        )}
        <div style={st.playOverlay}>
          <div style={st.playCircle}>
            <PlayIcon />
          </div>
        </div>
        <span style={st.durationBadge}>{formatDuration(video.durationSeconds)}</span>
      </div>
      <div style={st.cardBody}>
        <div style={st.titleRow}>
          <h3 style={st.cardTitle}>{video.title}</h3>
          <button
            style={st.bookmarkBtn(isSaved('video', video.id))}
            onClick={(e) => { e.stopPropagation(); handleBookmark('video', video.id); }}
            aria-label="Salvar"
          >
            {isSaved('video', video.id) ? '\u2665' : '\u2661'}
          </button>
        </div>
        <div style={st.badgeRow}>
          {renderCategoryBadge(video.category)}
          {renderPhaseBadge(video.cyclePhase)}
        </div>
        {video.description && (
          <p style={st.summary}>
            {video.description.slice(0, 120)}{video.description.length > 120 ? '...' : ''}
          </p>
        )}
        <span style={st.date}>{formatBR(video.publishedAt)}</span>
      </div>
    </div>
  );

  const renderSavedItem = (item: SavedContent) => {
    const content = item.content;
    if (!content) return null;
    const isArticle = item.contentType === 'article';

    return (
      <div key={item.id} style={st.savedCard}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={st.typeBadge(isArticle)}>
              {isArticle ? 'Artigo' : 'Video'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {content.title}
            </span>
          </div>
          <span style={st.date}>Salvo em {formatBR(item.savedAt)}</span>
        </div>
        <button style={st.removeBtn} onClick={() => handleRemoveSaved(item.id)}>
          Remover
        </button>
      </div>
    );
  };

  const renderEmptyState = (icon: React.ReactNode, title: string, text: string) => (
    <div style={st.emptyState}>
      <EmptyIcon>{icon}</EmptyIcon>
      <p style={st.emptyTitle}>{title}</p>
      <p style={st.emptyText}>{text}</p>
    </div>
  );

  const tabConfig: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'articles', label: 'Artigos', icon: <ArticleIcon /> },
    { key: 'videos', label: 'Videos', icon: <VideoIcon /> },
    { key: 'saved', label: 'Salvos', icon: <BookmarkIcon /> },
  ];

  return (
    <Layout title="" subtitle="">
      <div style={st.container}>
        {/* Pill Tabs */}
        <div style={st.tabRow}>
          {tabConfig.map((t) => (
            <button
              key={t.key}
              style={st.tab(tab === t.key)}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {tab !== 'saved' && (
          <div style={st.filterRow}>
            <select style={st.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select style={st.select} value={phase} onChange={(e) => setPhase(e.target.value)}>
              <option value="">Fase</option>
              <option value="follicular">Folicular</option>
              <option value="ovulatory">Ovulatoria</option>
              <option value="luteal">Lutea</option>
              <option value="menstrual">Menstrual</option>
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={st.loading}>Carregando...</div>
        ) : (
          <>
            {error && <div style={st.error}>{error}</div>}

            {tab === 'articles' && (
              articles.length === 0
                ? renderEmptyState(<ArticleIcon />, 'Nenhum artigo encontrado', 'Tente ajustar os filtros ou volte mais tarde')
                : <div>{articles.map(renderArticleCard)}</div>
            )}

            {tab === 'videos' && (
              videos.length === 0
                ? renderEmptyState(<VideoIcon />, 'Nenhum video encontrado', 'Tente ajustar os filtros ou volte mais tarde')
                : <div>{videos.map(renderVideoCard)}</div>
            )}

            {tab === 'saved' && (
              saved.length === 0
                ? renderEmptyState(<BookmarkIcon />, 'Nenhum item salvo', 'Salve artigos e videos para acessar depois')
                : <div>{saved.map(renderSavedItem)}</div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
