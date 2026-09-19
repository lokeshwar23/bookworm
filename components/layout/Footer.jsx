// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2a2a2a] py-8 px-4 text-center text-sm text-gray-600 bg-[#0f0f0f]">
      <p>© {new Date().getFullYear()} BookWorm — Your online bookstore. All rights reserved.</p>
    </footer>
  );
}
