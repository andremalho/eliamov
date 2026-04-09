import React from 'react';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (text: string): string => {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  return html;
};

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'hr' };

const parse = (text: string): Block[] => {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (h) {
      const level = h[1].length as 1 | 2 | 3;
      blocks.push({ type: `h${level}` as 'h1' | 'h2' | 'h3', text: h[2] });
      i++;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: buf.join(' ') });
      continue;
    }

    if (/^[-•*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const buf: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|>\s?|---+$|[-•*]\s+|\d+\.\s+)/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'p', text: buf.join(' ') });
  }

  return blocks;
};

const renderBlock = (block: Block, key: number) => {
  switch (block.type) {
    case 'h1':
      return <h1 key={key} dangerouslySetInnerHTML={{ __html: inline(block.text) }} />;
    case 'h2':
      return <h2 key={key} dangerouslySetInnerHTML={{ __html: inline(block.text) }} />;
    case 'h3':
      return <h3 key={key} dangerouslySetInnerHTML={{ __html: inline(block.text) }} />;
    case 'p':
      return <p key={key} dangerouslySetInnerHTML={{ __html: inline(block.text) }} />;
    case 'ul':
      return (
        <ul key={key}>
          {block.items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inline(item) }} />
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key}>
          {block.items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inline(item) }} />
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote key={key} dangerouslySetInnerHTML={{ __html: inline(block.text) }} />
      );
    case 'hr':
      return <hr key={key} />;
  }
};

export const Markdown: React.FC<{ children: string }> = ({ children }) => {
  const blocks = parse(children);
  return <div className="markdown">{blocks.map(renderBlock)}</div>;
};

export default Markdown;
