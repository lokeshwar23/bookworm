'use client';
// components/ui/BookCover.jsx
// Shared cover component: shows real image if available, else a styled SVG generated from book data.
// Used by BookCard, wishlist, orders, cart, writers, product detail.

import { useState } from 'react';

const PALETTES = [
  { bg: '#1e1b4b', accent: '#6366f1', light: '#a5b4fc' },
  { bg: '#1a2744', accent: '#3b82f6', light: '#93c5fd' },
  { bg: '#1c2536', accent: '#06b6d4', light: '#67e8f9' },
  { bg: '#14253b', accent: '#10b981', light: '#6ee7b7' },
  { bg: '#2d1b4e', accent: '#8b5cf6', light: '#c4b5fd' },
  { bg: '#2d1a2e', accent: '#ec4899', light: '#f9a8d4' },
  { bg: '#1f2937', accent: '#f59e0b', light: '#fcd34d' },
  { bg: '#1c2b2b', accent: '#14b8a6', light: '#5eead4' },
];

export function getPalette(title = '') {
  const sum = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTES[sum % PALETTES.length];
}

function shortTitle(title = '') {
  if (title.length <= 22) return [title];
  const words = title.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 18) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
    if (lines.length === 3) { line = '…'; break; }
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 3);
}

/** Pure SVG book cover — no image needed */
export function GeneratedCoverSVG({ title = '', author = '', category = '', className = '' }) {
  const pal = getPalette(title);
  const titleLines = shortTitle(title);
  const authorShort = author.length > 22 ? author.slice(0, 20) + '…' : author;

  return (
    <svg
      viewBox="0 0 200 280"
      xmlns="http://www.w3.org/2000/svg"
      className={className || 'w-full h-full'}
      aria-label={title}
    >
      <rect width="200" height="280" fill={pal.bg} />
      <rect x="0" y="0" width="6" height="280" fill={pal.accent} opacity="0.9" />
      <rect x="6" y="0" width="194" height="38" fill={pal.accent} opacity="0.15" />
      <rect x="14" y="10" width="120" height="18" rx="4" fill={pal.accent} opacity="0.3" />
      <text x="22" y="23" fontSize="9" fill={pal.light} fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="0.5">
        {category.toUpperCase().slice(0, 20)}
      </text>
      <circle cx="170" cy="220" r="60" fill={pal.accent} opacity="0.07" />
      <circle cx="160" cy="230" r="38" fill={pal.accent} opacity="0.07" />
      <circle cx="30"  cy="180" r="45" fill={pal.accent} opacity="0.05" />
      <text x="100" y="105" fontSize="38" textAnchor="middle" fontFamily="system-ui,sans-serif" opacity="0.35">📖</text>
      {titleLines.map((line, i) => (
        <text key={i} x="100" y={130 + i * 22}
          fontSize={titleLines.length === 1 ? 15 : 13}
          fontWeight="700" fontFamily="system-ui,sans-serif" fill="#ffffff" textAnchor="middle">
          {line}
        </text>
      ))}
      <rect x="60" y={132 + titleLines.length * 22} width="80" height="1.5" rx="1" fill={pal.accent} opacity="0.5" />
      <text x="100" y={148 + titleLines.length * 22} fontSize="10" fill={pal.light}
        fontFamily="system-ui,sans-serif" textAnchor="middle" opacity="0.85">
        {authorShort}
      </text>
      <rect x="6" y="262" width="194" height="18" fill={pal.accent} opacity="0.2" />
      <text x="100" y="274" fontSize="8" fill={pal.light} fontFamily="system-ui,sans-serif"
        textAnchor="middle" opacity="0.7" letterSpacing="1">BOOKWORM</text>
    </svg>
  );
}

/**
 * Smart cover: tries the real image URL, falls back to GeneratedCoverSVG.
 *
 * Props:
 *   book  – object with { cover_image_url, title, author, category_name }
 *   className – applied to the wrapper div
 *   imgClassName – applied to the <img> element when a real image loads
 */
export default function BookCover({ book, className = 'w-full h-full', imgClassName = 'w-full h-full object-cover' }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!book?.cover_image_url || imgFailed) {
    return (
      <GeneratedCoverSVG
        title={book?.title}
        author={book?.author}
        category={book?.category_name}
        className={className}
      />
    );
  }

  return (
    <img
      src={book.cover_image_url}
      alt={book?.title}
      className={imgClassName}
      onError={() => setImgFailed(true)}
    />
  );
}
