import React, { useEffect, useState } from 'react';
import { FileText, Plus, X, Video } from 'lucide-react';
import { contentApi, Article, Video as VideoType, ContentListResponse } from '../../services/content.api';
import api from '../../services/api';

type Tab = 'articles' | 'videos';

const CATEGORIES = [
  { value: 'ciclo', label: 'Ciclo' },
  { value: 'treino', label: 'Treino' },
  { value: 'nutricao', label: 'Nutricao' },
  { value: 'saude-mental', label: 'Saude mental' },
  { value: 'geral', label: 'Geral' },
];

const CYCLE_PHASES = [
  { value: 'all', label: 'Todas as fases' },
  { value: 'follicular', label: 'Folicular' },
  { value: 'ovulatory', label: 'Ovulatoria' },
  { value: 'luteal', label: 'Lutea' },
  { value: 'menstrual', label: 'Menstrual' },
];

const Content: React.FC = () => {
  const [tab, setTab] = useState<Tab>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [articleForm, setArticleForm] = useState({
    title: '',
    body: '',
    category: 'geral',
    cyclePhase: 'all',
    coverImageUrl: '',
  });

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'geral',
    cyclePhase: 'all',
  });

  const loadArticles = () => {
    contentApi
      .listArticles()
      .then((res: ContentListResponse<Article>) => setArticles(res.data))
      .catch(() => {});
  };

  const loadVideos = () => {
    contentApi
      .listVideos()
      .then((res: ContentListResponse<VideoType>) => setVideos(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([contentApi.listArticles(), contentApi.listVideos()])
      .then(([a, v]) => {
        setArticles(a.data);
        setVideos(v.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/content/articles', {
        title: articleForm.title,
        body: articleForm.body,
        category: articleForm.category,
        cyclePhase: articleForm.cyclePhase,
        coverImageUrl: articleForm.coverImageUrl || undefined,
      });
      setShowForm(false);
      setArticleForm({ title: '', body: '', category: 'geral', cyclePhase: 'all', coverImageUrl: '' });
      loadArticles();
    } catch {
      alert('Erro ao criar artigo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/content/videos', {
        title: videoForm.title,
        description: videoForm.description || undefined,
        videoUrl: videoForm.videoUrl,
        thumbnailUrl: videoForm.thumbnailUrl || undefined,
        category: videoForm.category,
        cyclePhase: videoForm.cyclePhase,
      });
      setShowForm(false);
      setVideoForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '', category: 'geral', cyclePhase: 'all' });
      loadVideos();
    } catch {
      alert('Erro ao criar video.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) return <p className="adm-loading">Carregando...</p>;

  return (
    <div className="adm-content">
      <div className="adm-section-card">
        <div className="adm-section-header">
          <FileText size={20} className="adm-stat-icon" />
          <h3 className="adm-section-title">Conteudo</h3>
          <button
            className="adm-btn-primary adm-btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : tab === 'articles' ? 'Novo artigo' : 'Novo video'}
          </button>
        </div>

        <div className="adm-tabs">
          <button
            className={`adm-tab ${tab === 'articles' ? 'adm-tab-active' : ''}`}
            onClick={() => { setTab('articles'); setShowForm(false); }}
          >
            <FileText size={14} /> Artigos
          </button>
          <button
            className={`adm-tab ${tab === 'videos' ? 'adm-tab-active' : ''}`}
            onClick={() => { setTab('videos'); setShowForm(false); }}
          >
            <Video size={14} /> Videos
          </button>
        </div>

        {showForm && tab === 'articles' && (
          <form className="adm-form" onSubmit={handleArticleSubmit}>
            <div className="adm-form-group">
              <label>Titulo</label>
              <input
                type="text"
                value={articleForm.title}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                required
                placeholder="Titulo do artigo"
              />
            </div>
            <div className="adm-form-group">
              <label>Conteudo</label>
              <textarea
                value={articleForm.body}
                onChange={(e) => setArticleForm({ ...articleForm, body: e.target.value })}
                rows={6}
                required
                placeholder="Corpo do artigo..."
              />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Categoria</label>
                <select
                  value={articleForm.category}
                  onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="adm-form-group">
                <label>Fase do ciclo</label>
                <select
                  value={articleForm.cyclePhase}
                  onChange={(e) => setArticleForm({ ...articleForm, cyclePhase: e.target.value })}
                >
                  {CYCLE_PHASES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="adm-form-group">
              <label>URL da imagem de capa (opcional)</label>
              <input
                type="url"
                value={articleForm.coverImageUrl}
                onChange={(e) => setArticleForm({ ...articleForm, coverImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="adm-btn-primary" disabled={submitting}>
              {submitting ? 'Publicando...' : 'Publicar artigo'}
            </button>
          </form>
        )}

        {showForm && tab === 'videos' && (
          <form className="adm-form" onSubmit={handleVideoSubmit}>
            <div className="adm-form-group">
              <label>Titulo</label>
              <input
                type="text"
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                required
                placeholder="Titulo do video"
              />
            </div>
            <div className="adm-form-group">
              <label>Descricao</label>
              <textarea
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                rows={3}
                placeholder="Descricao opcional..."
              />
            </div>
            <div className="adm-form-group">
              <label>URL do video</label>
              <input
                type="url"
                value={videoForm.videoUrl}
                onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                required
                placeholder="https://..."
              />
            </div>
            <div className="adm-form-group">
              <label>URL do thumbnail (opcional)</label>
              <input
                type="url"
                value={videoForm.thumbnailUrl}
                onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Categoria</label>
                <select
                  value={videoForm.category}
                  onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="adm-form-group">
                <label>Fase do ciclo</label>
                <select
                  value={videoForm.cyclePhase}
                  onChange={(e) => setVideoForm({ ...videoForm, cyclePhase: e.target.value })}
                >
                  {CYCLE_PHASES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="adm-btn-primary" disabled={submitting}>
              {submitting ? 'Publicando...' : 'Publicar video'}
            </button>
          </form>
        )}

        {tab === 'articles' && (
          <div className="adm-content-list">
            {articles.length === 0 ? (
              <p className="adm-empty">Nenhum artigo publicado.</p>
            ) : (
              articles.map((a) => (
                <div key={a.id} className="adm-content-item">
                  <div className="adm-content-item-info">
                    <span className="adm-content-item-title">{a.title}</span>
                    <span className="adm-content-item-meta">
                      {a.category?.name || a.cyclePhase} &middot; {formatDate(a.publishedAt || a.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'videos' && (
          <div className="adm-content-list">
            {videos.length === 0 ? (
              <p className="adm-empty">Nenhum video publicado.</p>
            ) : (
              videos.map((v) => (
                <div key={v.id} className="adm-content-item">
                  <div className="adm-content-item-info">
                    <span className="adm-content-item-title">{v.title}</span>
                    <span className="adm-content-item-meta">
                      {v.category?.name || v.cyclePhase} &middot; {formatDate(v.publishedAt || v.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;
