import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";

function alignClass(align) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  if (align === "justify") return "text-justify";
  return "text-left";
}

function imageAlignStyle(align) {
  if (align === "center") return { display: "block", margin: "0 auto" };
  if (align === "right") return { display: "block", marginLeft: "auto" };
  return {};
}

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/storage/')) return path;
  return `/storage/${path}`;
}

function ArticleRenderer({ blocks }) {
  if (!blocks?.length) {
    return (
      <div className="text-gray-500 italic py-8 text-center">
        No content available yet.
      </div>
    );
  }

  return (
    <div className="article-content">
      {blocks.map((b) => {
        // HEADING
        if (b.type === "heading") {
          const cls = alignClass(b.align);
          const style = { textAlign: b.align };

          if (b.heading_level === 3) {
            return (
              <h3 key={b.id} className={`article-h3 ${cls}`} style={style}>
                {b.text}
              </h3>
            );
          }
          return (
            <h2 key={b.id} className={`article-h2 ${cls}`} style={style}>
              {b.text}
            </h2>
          );
        }

        // PARAGRAPH
        if (b.type === "paragraph") {
          const cls = alignClass(b.align);
          const ytId = getYouTubeId(b.text?.trim() ?? "");

          if (ytId) {
            const style = imageAlignStyle(b.align);
            return (
              <div key={b.id} className="article-image-wrapper" style={{ ...style, maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }

          const style = { textAlign: b.align };

          return (
            <div key={b.id} className={`article-p ${cls}`} style={style}>
              <ReactMarkdown>{b.text ?? ""}</ReactMarkdown>
            </div>
          );
        }

        // LIST
        if (b.type === "list") {
          const items = Array.isArray(b.list_items) ? b.list_items : [];
          const cls = alignClass(b.align);

          if (b.list_style === "number") {
            return (
              <ol key={b.id} className={`${cls} list-decimal pl-6 mb-4`}>
                {items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ol>
            );
          }

          return (
            <ul key={b.id} className={`${cls} list-disc pl-6 mb-4`}>
              {items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          );
        }

        // IMAGE
        if (b.type === "image") {
          const style = imageAlignStyle(b.align);
          let maxWidth = "100%";
          if (b.image_width === "sm") maxWidth = "320px";
          if (b.image_width === "md") maxWidth = "520px";
          if (b.image_width === "lg") maxWidth = "760px";
          if (b.image_width === "full") maxWidth = "100%";

          return (
            <div key={b.id} className="article-image-wrapper">
              <img
                src={getImageUrl(b.image_path)}
                alt=""
                style={{ ...style, maxWidth, borderRadius: 8 }}
              />
            </div>
          );
        }

        // RICH TEXT
        if (b.type === "richtext") {
          const cls = alignClass(b.align);
          return (
            <div
              key={b.id}
              className={`article-richtext ${cls}`}
              dangerouslySetInnerHTML={{ __html: b.text ?? "" }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

function CollapsibleSection({ section, activeSubsectionId, onSubsectionClick }) {
  const hasActiveChild = section.subsections?.some(ss => ss.id === activeSubsectionId);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  return (
    <div className="section-group">
      <button
        className="w-full flex items-center justify-between text-left group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="section-title mb-0 group-hover:text-gray-600 transition-colors">
          {section.title}
        </div>
        <svg
          className={`w-3 h-3 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
      >
        <div className="subsection-nav">
          {section.subsections?.map((ss) => (
            <button
              key={ss.id}
              onClick={() => onSubsectionClick(ss.id)}
              className={`subsection-btn ${activeSubsectionId === ss.id ? "active" : ""}`}
            >
              {ss.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HelpDocs({ productSlug = "help-desk" }) {
  const [nav, setNav] = useState(null);

  const [activeSubsectionId, setActiveSubsectionId] = useState(null);
  const [subsectionData, setSubsectionData] = useState(null);
  const [loadingSubsection, setLoadingSubsection] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetch(`/api/help/${productSlug}/nav`)
      .then((r) => r.json())
      .then((data) => {
        setNav(data);
        const firstSection = data.sections?.[0];
        const firstSub = firstSection?.subsections?.[0];
        if (firstSub?.id) setActiveSubsectionId(firstSub.id);
      })
      .catch(console.error);
  }, [productSlug]);

  useEffect(() => {
    if (!activeSubsectionId) return;

    setLoadingSubsection(true);
    fetch(`/api/help/subsections/${activeSubsectionId}`)
      .then((r) => r.json())
      .then((data) => setSubsectionData(data))
      .catch(console.error)
      .finally(() => setLoadingSubsection(false));
  }, [activeSubsectionId]);

  const handleSubsectionClick = (id) => {
    setActiveSubsectionId(id);
    setSidebarOpen(false);
  };

  return (
    <>
      <Head title={nav?.name ? nav.name : "Knowledge Base"} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        .help-docs-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #fafafa;
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        .sidebar-nav {
          width: 280px;
          background: #ffffff;
          border-right: 1px solid #e5e5e5;
          flex-shrink: 0;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .sidebar-header {
          background: #f9f9f9;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-shrink: 0;
        }

        .sidebar-logo {
          width: 28px;
          height: 28px;
        }

        .sidebar-brand {
          font-weight: 600;
          font-size: 1rem;
          color: #1a1a1a;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .sidebar-content {
          padding: 1.25rem;
          overflow-y: auto;
          flex: 1;
        }

        .section-group {
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #1a1a1a;
          /* Margin moved to CollapsibleSection logic */
          padding: 0 0.5rem;
        }

        .subsection-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .subsection-btn {
          width: 100%;
          text-align: left;
          font-size: 0.9375rem;
          padding: 0.625rem 0.75rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #404040;
          font-weight: 400;
          border: none;
          background: transparent;
          cursor: pointer;
          letter-spacing: -0.01em;
        }

        .subsection-btn:hover {
          background: #fff5ed;
          color: #FF6C00;
        }

        .subsection-btn.active {
          background: #ff6a00ff;
          color: white;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(255, 108, 0, 0.15);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          min-height: 100vh;
        }

        .content-header {
          /* background: linear-gradient(135deg, #595755 0%, #6d6b69 50%, #595755 100%); */
          background-color: #353635;
          height: 60px;
          flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: relative;
          display: flex; 
          align-items: center; 
          justify-content: flex-end; 
          padding: 0 2rem; 
        }

        .content-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF6C00 0%, #ff8c3a 100%);
        }

        .content-body {
          padding: 3rem 4rem;
          max-width: 1200px;
          flex: 1; /* Sticky footer: pushes footer down */
        }

        .content-title {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 2.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 2.5rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #a0a0a0;
          font-size: 0.9375rem;
        }

        .loading-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid #f0f0f0;
          border-top-color: #FF6C00;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 0.625rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Article Content Styles */
        .article-content {
          font-family: 'Inter', sans-serif;
          color: #333333;
          line-height: 1.7;
          font-size: 1rem;
          font-weight: 400;
        }

        .article-h2:first-child {
          margin-top: 0;
        }

        .article-p {
          margin-bottom: 1.125rem;
          color: #4a4a4a;
          line-height: 1.75;
        }

        .article-p:last-child {
          margin-bottom: 0;
        }

        .article-image-wrapper {
          margin: 2.5rem 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .article-image {
          max-width: 100%;
          display: block;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .article-richtext {
            margin-bottom: 2rem;
            color: #4a4a4a;
            white-space: pre-wrap;
        }
        
        /* Support for Tiptap text-align */
        .article-richtext p {
            margin-bottom: 1.125rem;
            line-height: 1.75;
            min-height: 1.75em;
        }
        
        /* Ensure empty paragraphs are visible but take less space */
        .article-richtext p:empty {
            margin-bottom: 0;
        }

        .article-richtext p:empty::before {
            content: "\\00a0";
            display: inline-block;
        }
        
        .article-richtext p[style*="text-align: center"],
        .article-richtext .text-center {
            text-align: center !important;
        }

        .article-richtext p[style*="text-align: right"],
        .article-richtext .text-right {
            text-align: right !important;
        }

        .article-richtext p[style*="text-align: justify"],
        .article-richtext .text-justify {
            text-align: justify !important;
        }

        .article-richtext img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            display: inline-block; /* Ensure it respects text-align */
        }
        
        .article-richtext h2 {
            font-family: 'Source Sans 3', sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .article-richtext h3 {
             font-family: 'Source Sans 3', sans-serif;
             font-size: 1.25rem;
             font-weight: 600;
             color: #1a1a1a;
             margin-top: 1.5rem;
             margin-bottom: 0.75rem;
        }

        .article-richtext ul {
            list-style-type: disc;
            padding-left: 3rem;
            margin-bottom: 1rem;
        }

        .article-richtext ol {
            list-style-type: decimal;
            padding-left: 3rem;
            margin-bottom: 0.5rem;
        }

        /* Nested List Styles */
        .article-richtext ul ul {
            list-style-type: circle;
            margin-bottom: 0;
            margin-top: 0.25rem;
        }

        .article-richtext ul ul ul {
            list-style-type: square;
        }

        .article-richtext ol ol {
            list-style-type: lower-alpha;
            margin-bottom: 0;
             margin-top: 0.25rem;
        }

        .article-richtext ol ol ol {
            list-style-type: lower-roman;
        }
        
        .article-richtext li {
            margin-bottom: 0.75rem;
        }

        .article-richtext strong {
            font-weight: 700;
        }

        .article-richtext em {
            font-style: italic;
        }
        
        .article-richtext u {
            text-decoration: underline;
        }

        .article-richtext a {
            color: #2563eb;
            text-decoration: underline;
            cursor: pointer;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1000;
          background: #FF6C00;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.625rem 0.875rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 108, 0, 0.3);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .mobile-menu-toggle:hover {
          background: #ff8c3a;
        }

        .sidebar-overlay {
          display: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .help-docs-container {
            flex-direction: column;
          }

          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .sidebar-nav {
            position: fixed;
            top: 0;
            left: -280px;
            width: 280px;
            height: 100vh;
            z-index: 999;
            transition: left 0.3s ease;
          }

          .sidebar-nav.open {
            left: 0;
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .sidebar-overlay.open {
            display: block;
            opacity: 1;
          }

          .content-body {
            padding: 2rem 1.5rem;
          }

          .content-title {
            font-size: 1.75rem;
          }

          .content-header {
            height: 60px;
          }

          .article-h2 {
            font-size: 1.25rem;
          }

          .article-h3 {
            font-size: 1.125rem;
          }
        }
      `}</style>

      <div className="help-docs-container">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          Menu
        </button>

        {/* Sidebar Overlay for Mobile */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <aside className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}>

          <a href="/">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <img src="/coreDev.png" alt="coreDev logo" />
              </div>
              <div className="sidebar-brand">Knowledge Base</div>
            </div>
          </a>

          <div className="sidebar-content">
            {nav?.sections?.map((section) => (
              <CollapsibleSection
                key={section.id}
                section={section}
                activeSubsectionId={activeSubsectionId}
                onSubsectionClick={handleSubsectionClick}
              />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <div className="flex items-center gap-2">
              <select
                className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF6C00] focus:border-transparent cursor-pointer hover:bg-white/20 transition"
                value={nav?.id || ""}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const product = nav?.all_products?.find(p => p.id === selectedId);
                  if (product) {
                    window.location.href = `/help/${product.slug}`;
                  }
                }}
              >
                {nav?.all_products?.map(p => (
                  <option key={p.id} value={p.id} className="text-gray-900 bg-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="content-body">
            <h1 className="content-title">
              {subsectionData?.title ?? ""}
            </h1>

            {loadingSubsection ? (
              <div className="loading-state">
                <span className="loading-spinner"></span>
                Loading content...
              </div>
            ) : (
              <ArticleRenderer blocks={subsectionData?.blocks ?? []} />
            )}
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-20 right-8 p-3 bg-[#FF6C00] text-white rounded-full shadow-lg hover:bg-[#ff8c3a] transition-all transform hover:scale-110 z-50 group"
              title="Back to top"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}

          {/* FOOTER */}
          <footer className="bg-[#353635] border-t border-gray-300">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex flex-wrap justify-between items-center gap-8">
                <div className="flex gap-12 text-xs text-white">
                  <div className="cursor-pointer transition-colors">
                    HELP DESK
                  </div>
                  <div className="cursor-pointer transition-colors">
                    ISSUE TRACKER
                  </div>
                </div>

                <div className="text-xs text-white">
                  © {new Date().getFullYear()} Powered by <img src="/coreDevlogo.png" alt="o" style={{ width: '1em', height: '1em', verticalAlign: 'middle', display: 'inline-block', margin: '0 2px' }} />
                  <a
                    href="https://coredev.ph/"
                    target="_blank"
                    className="text-[#51bcda] hover:opacity-80">
                    coredev Solutions Inc.
                  </a>
                </div>
              </div>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}