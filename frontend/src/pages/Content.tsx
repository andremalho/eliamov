import React, { useEffect, useState, useCallback } from 'react';
import { contentApi, Article, Video, ContentCategory, SavedContent, ContentQueryParams } from '../services/content.api';
import Layout from '../components/Layout';
import Markdown from '../components/Markdown';
import { formatBR } from '../utils/format';

type Tab = 'articles' | 'videos' | 'saved';

const PHASE_COLORS: Record<string, string> = {
  follicular: '#16a34a',
  ovulatory: '#f59e0b',
  luteal: '#7c3aed',
  menstrual: '#dc2626',
  all: '#6b7280',
};

const PHASE_LABELS: Record<string, string> = {
  follicular: 'Folicular',
  ovulatory: 'Ovulatoria',
  luteal: 'Lutea',
  menstrual: 'Menstrual',
  all: 'Todas',
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
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

  // Filters
  const [phase, setPhase] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  // Track saved content ids for bookmark state
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

  // Initial load
  useEffect(() => {
    loadCategories();
    loadSaved();
  }, [loadCategories, loadSaved]);

  // Load data when tab or filters change
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

  const renderPhaseBadge = (phase: string) => (
    <span
      className="content-badge phase"
      style={{ background: PHASE_COLORS[phase] || PHASE_COLORS.all }}
    >
      {PHASE_LABELS[phase] || phase}
    </span>
  );

  const renderCategoryBadge = (cat?: ContentCategory | null) => {
    if (!cat) return null;
    return <span className="content-badge cat">{cat.name}</span>;
  };

  const renderArticleCard = (article: Article) => {
    const expanded = expandedId === article.id;
    return (
      <section key={article.id} className="card content-card" onClick={() => toggle(article.id)}>
        {article.coverImageUrl && (
          <img src={article.coverImageUrl} alt={article.title} className="content-cover" />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0, flex: 1 }}>{article.title}</h3>
          <button
            className={`content-bookmark ${isSaved('article', article.id) ? 'saved' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleBookmark('article', article.id); }}
            aria-label="Salvar"
          >
            {isSaved('article', article.id) ? '\u2665' : '\u2661'}
          </button>
        </div>
        <div className="content-badges">
          {renderCategoryBadge(article.category)}
          {renderPhaseBadge(article.cyclePhase)}
        </div>
        {expanded ? (
          <div style={{ marginTop: 8 }}>
            <Markdown>{article.body}</Markdown>
          </div>
        ) : (
          <p className="content-summary">
            {article.summary || (article.body ? article.body.slice(0, 150) + (article.body.length > 150 ? '...' : '') : 'Sem descricao.')}
          </p>
        )}
        <span className="content-date">{formatBR(article.publishedAt)}</span>
      </section>
    );
  };

  const renderVideoCard = (video: Video) => (
    <section
      key={video.id}
      className="card content-card"
      onClick={() => window.open(video.videoUrl, '_blank')}
    >
      <div className="content-video-thumb">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} />
        ) : (
          <div style={{ width: '100%', height: 160, background: '#e5e7eb', borderRadius: 10 }} />
        )}
        <span className="content-video-duration">{formatDuration(video.durationSeconds)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, flex: 1 }}>{video.title}</h3>
        <button
          className={`content-bookmark ${isSaved('video', video.id) ? 'saved' : ''}`}
          onClick={(e) => { e.stopPropagation(); handleBookmark('video', video.id); }}
          aria-label="Salvar"
        >
          {isSaved('video', video.id) ? '\u2665' : '\u2661'}
        </button>
      </div>
      <div className="content-badges">
        {renderCategoryBadge(video.category)}
        {renderPhaseBadge(video.cyclePhase)}
      </div>
      {video.description && (
        <p className="content-summary">
          {video.description.slice(0, 120)}{video.description.length > 120 ? '...' : ''}
        </p>
      )}
      <span className="content-date">{formatBR(video.publishedAt)}</span>
    </section>
  );

  const renderSavedItem = (item: SavedContent) => {
    const content = item.content;
    if (!content) return null;

    const isArticle = item.contentType === 'article';
    const title = content.title;

    return (
      <section key={item.id} className="card content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="content-badge cat" style={{ marginRight: 6 }}>
              {isArticle ? 'Artigo' : 'Video'}
            </span>
            <strong>{title}</strong>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '4px 10px' }}
            onClick={() => handleRemoveSaved(item.id)}
          >
            Remover
          </button>
        </div>
        <span className="content-date" style={{ marginTop: 6, display: 'block' }}>
          Salvo em {formatBR(item.savedAt)}
        </span>
      </section>
    );
  };

  return (
    <Layout title="Conteudo" subtitle="Artigos, videos e biblioteca.">
      {/* Tabs */}
      <div className="content-tabs">
        <button className={`content-tab ${tab === 'articles' ? 'active' : ''}`} onClick={() => setTab('articles')}>
          Artigos
        </button>
        <button className={`content-tab ${tab === 'videos' ? 'active' : ''}`} onClick={() => setTab('videos')}>
          Videos
        </button>
        <button className={`content-tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>
          Biblioteca
        </button>
      </div>

      {/* Filters (not shown on saved tab) */}
      {tab !== 'saved' && (
        <div className="content-filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="">Todas fases</option>
            <option value="follicular">Folicular</option>
            <option value="ovulatory">Ovulatoria</option>
            <option value="luteal">Lutea</option>
            <option value="menstrual">Menstrual</option>
          </select>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}

          {tab === 'articles' && (
            articles.length === 0
              ? <p className="muted small">Nenhum artigo encontrado.</p>
              : <div className="card-grid">{articles.map(renderArticleCard)}</div>
          )}

          {tab === 'videos' && (
            videos.length === 0
              ? <p className="muted small">Nenhum video encontrado.</p>
              : <div className="card-grid">{videos.map(renderVideoCard)}</div>
          )}

          {tab === 'saved' && (
            saved.length === 0
              ? <p className="muted small">Nenhum item salvo.</p>
              : <div className="card-grid">{saved.map(renderSavedItem)}</div>
          )}
        </>
      )}
    </Layout>
  );
}
