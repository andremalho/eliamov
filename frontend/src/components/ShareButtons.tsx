import React, { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--border, #e5e7eb)',
  background: 'var(--surface, #f9fafb)',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: 'inherit',
};

export default function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const text = description ? `${title} — ${description}` : title;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch {
      /* user cancelled */
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const openWindow = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button type="button" style={btnStyle} onClick={handleNativeShare}>
          Partilhar
        </button>
      )}

      <button
        type="button"
        style={btnStyle}
        onClick={() =>
          openWindow(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`)
        }
      >
        X
      </button>

      <button
        type="button"
        style={btnStyle}
        onClick={() =>
          openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
        }
      >
        Facebook
      </button>

      <button
        type="button"
        style={btnStyle}
        onClick={() =>
          openWindow(`https://wa.me/?text=${encodedText}%20${encodedUrl}`)
        }
      >
        WhatsApp
      </button>

      <button type="button" style={btnStyle} onClick={handleCopy}>
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>

      <span className="muted small" style={{ alignSelf: 'center' }}>
        Copie o link e partilhe no Instagram Stories
      </span>
    </div>
  );
}
