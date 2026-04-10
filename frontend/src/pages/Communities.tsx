import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTimeBR } from '../utils/format';
import {
  communityChatApi,
  CommunityItem,
  CommunityMessage,
} from '../services/community-chat.api';

const TYPE_LABELS: Record<string, string> = {
  public: 'Publico',
  private: 'Privado',
  cycle_auto: 'Ciclo',
};

export default function Communities() {
  const { currentUser } = useAuth();

  /* ── List state ─────────────────────────────────────── */
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Chat room state ────────────────────────────────── */
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch community list ───────────────────────────── */
  useEffect(() => {
    communityChatApi
      .list()
      .then(setCommunities)
      .catch(() => setError('Nao foi possivel carregar os grupos.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── WebSocket lifecycle ────────────────────────────── */
  useEffect(() => {
    if (!selectedCommunity) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const socket = io(`${baseUrl}/community`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinRoom', { communityId: selectedCommunity.id });

    socket.on('newMessage', (msg: CommunityMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('typing', (data: { name: string }) => {
      setTypingUser(data.name);
      setTimeout(() => setTypingUser(null), 2000);
    });

    return () => {
      socket.emit('leaveRoom', { communityId: selectedCommunity.id });
      socket.disconnect();
    };
  }, [selectedCommunity]);

  /* ── Helpers ────────────────────────────────────────── */
  const scrollToBottom = () =>
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const openChat = async (community: CommunityItem) => {
    setSelectedCommunity(community);
    setMessages([]);
    try {
      const res = await communityChatApi.getMessages(community.id);
      setMessages(res.data);
      scrollToBottom();
    } catch {
      setError('Falha ao carregar mensagens.');
    }
  };

  const handleJoin = async (community: CommunityItem) => {
    try {
      await communityChatApi.join(community.id);
      const updated = await communityChatApi.list();
      setCommunities(updated);
    } catch {
      setError('Falha ao entrar no grupo.');
    }
  };

  const handleInvite = async () => {
    if (!selectedCommunity) return;
    try {
      const invite = await communityChatApi.createInvite(selectedCommunity.id);
      const link = `${window.location.origin}/communities?invite=${invite.code}`;
      await navigator.clipboard.writeText(link);
      alert('Link de convite copiado!');
    } catch {
      setError('Falha ao gerar convite.');
    }
  };

  const handleTyping = () => {
    if (!currentUser || !selectedCommunity) return;
    socketRef.current?.emit('typing', {
      communityId: selectedCommunity.id,
      userId: currentUser.id,
      name: currentUser.name,
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'image';
    try {
      const { uploadUrl, publicUrl } = await communityChatApi.getPresignedUrl(type);
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setMediaUrl(publicUrl);
      setMediaType(type);
    } catch {
      setError('Falha ao enviar midia.');
    }
  };

  const sendMessage = async () => {
    if (!selectedCommunity || !currentUser) return;
    if (!messageText.trim() && !mediaUrl) return;

    setSending(true);
    const dto = {
      communityId: selectedCommunity.id,
      userId: currentUser.id,
      content: messageText,
      mediaUrl: mediaUrl ?? undefined,
      mediaType: mediaType !== 'none' ? mediaType : undefined,
    };

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('sendMessage', dto);
      } else {
        await communityChatApi.sendMessage(selectedCommunity.id, {
          content: messageText,
          mediaUrl: mediaUrl ?? undefined,
          mediaType: mediaType !== 'none' ? mediaType : undefined,
        });
      }
      setMessageText('');
      setMediaUrl(null);
      setMediaType('none');
    } catch {
      setError('Falha ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  /* ── Render: Chat Room ──────────────────────────────── */
  if (selectedCommunity) {
    return (
      <Layout title="" subtitle="">
        <div className="chat-room">
          <div className="chat-header">
            <button className="chat-back" onClick={() => setSelectedCommunity(null)}>
              ←
            </button>
            <strong>{selectedCommunity.name}</strong>
            {selectedCommunity.myRole === 'admin' && (
              <button className="link-button" onClick={handleInvite} style={{ marginLeft: 'auto' }}>
                Convidar
              </button>
            )}
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-msg">
                <div className="chat-msg-avatar">
                  {msg.user?.avatarUrl ? (
                    <img
                      src={msg.user.avatarUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(msg.user?.name ?? '?')
                  )}
                </div>
                <div className="chat-msg-body">
                  <div className="chat-msg-name">{msg.user?.name ?? 'Desconhecido'}</div>
                  {msg.content && <div className="chat-msg-text">{msg.content}</div>}
                  {msg.mediaUrl && msg.mediaType === 'image' && (
                    <div className="chat-msg-media">
                      <img src={msg.mediaUrl} alt="midia" />
                    </div>
                  )}
                  {msg.mediaUrl && msg.mediaType === 'video' && (
                    <div className="chat-msg-media">
                      <video src={msg.mediaUrl} controls style={{ maxWidth: 240, borderRadius: 10, marginTop: 4 }} />
                    </div>
                  )}
                  <div className="chat-msg-time">{formatDateTimeBR(msg.createdAt)}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-typing">{typingUser ? `${typingUser} esta digitando...` : ''}</div>

          {mediaUrl && (
            <div style={{ padding: '4px 0', fontSize: 12 }}>
              Midia anexada{' '}
              <button className="link-button" onClick={() => { setMediaUrl(null); setMediaType('none'); }}>
                Remover
              </button>
            </div>
          )}

          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTyping}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleMediaUpload}
            />
            <button
              className="chat-send-btn"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: 'var(--color-border)' }}
              title="Enviar midia"
            >
              +
            </button>
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={sending || (!messageText.trim() && !mediaUrl)}
            >
              {sending ? '...' : 'Enviar'}
            </button>
          </div>

          {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </Layout>
    );
  }

  /* ── Render: Community List ─────────────────────────── */
  return (
    <Layout title="Grupos" subtitle="Comunidades e grupos de conversa.">
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          <div className="community-list">
            {communities.length === 0 && (
              <p className="muted small">Nenhum grupo disponivel.</p>
            )}
            {communities.map((c) => (
              <div
                key={c.id}
                className="community-item"
                onClick={() => (c.isMember ? openChat(c) : undefined)}
                style={{ cursor: c.isMember ? 'pointer' : 'default' }}
              >
                <div className="community-cover">
                  {c.coverImageUrl ? (
                    <img src={c.coverImageUrl} alt="" />
                  ) : (
                    getInitials(c.name)
                  )}
                </div>
                <div className="community-info">
                  <div className="community-name">{c.name}</div>
                  <div className="community-members">{c.membersCount} membro{c.membersCount !== 1 ? 's' : ''}</div>
                  {c.type === 'cycle_auto' && c.cyclePhase && (
                    <span className="muted small">{c.cyclePhase}</span>
                  )}
                </div>
                <span className={`community-type-badge ${c.type}`}>
                  {TYPE_LABELS[c.type] ?? c.type}
                </span>
                {!c.isMember && (
                  <button
                    className="chat-send-btn"
                    style={{ fontSize: 12, padding: '4px 12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(c);
                    }}
                  >
                    Entrar
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
