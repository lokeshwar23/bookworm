// components/Breadcrumb.jsx
import Link from 'next/link';

export default function Breadcrumb({ items }) {
  // items = [{ label, href? }, ...]
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-300 transition">{item.label}</Link>
          ) : (
            <span className="text-gray-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
