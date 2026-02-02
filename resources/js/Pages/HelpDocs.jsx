import { useEffect, useState } from "react";

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
        if (b.type === "heading") {
          if (b.heading_level === 2) {
            return (
              <h2 key={b.id} className="article-h2">
                {b.text}
              </h2>
            );
          }
          if (b.heading_level === 3) {
            return (
              <h3 key={b.id} className="article-h3">
                {b.text}
              </h3>
            );
          }
          return (
            <h3 key={b.id} className="article-h3">
              {b.text}
            </h3>
          );
        }

        if (b.type === "paragraph") {
          return (
            <p key={b.id} className="article-p">
              {b.text}
            </p>
          );
        }

        if (b.type === "image") {
          return (
            <div key={b.id} className="article-image-wrapper">
              <img
                src={b.image_path}
                alt=""
                className="article-image"
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function HelpDocs() {
  const productSlug = "help-desk";
  const [nav, setNav] = useState(null);

  const [activeSubsectionId, setActiveSubsectionId] = useState(null);
  const [subsectionData, setSubsectionData] = useState(null);
  const [loadingSubsection, setLoadingSubsection] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  }, []);

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
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8a8a8a;
          margin-bottom: 0.625rem;
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
          background: #FF6C00;
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
          background: linear-gradient(135deg, #595755 0%, #6d6b69 50%, #595755 100%);
          height: 60px;
          flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: relative;
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

        .article-h2 {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .article-h2:first-child {
          margin-top: 0;
        }

        .article-h3 {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #FF6C00;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
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
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <img src="/coreDev.png" alt="coreDev logo" />
            </div>
            <div className="sidebar-brand">coreDev</div>
          </div>

          <div className="sidebar-content">
            {nav?.sections?.map((section) => (
              <div key={section.id} className="section-group">
                <div className="section-title">{section.title}</div>

                <div className="subsection-nav">
                  {section.subsections?.map((ss) => (
                    <button
                      key={ss.id}
                      onClick={() => handleSubsectionClick(ss.id)}
                      className={`subsection-btn ${
                        activeSubsectionId === ss.id ? "active" : ""
                      }`}
                    >
                      {ss.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header"></div>

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
        </main>
      </div>
    </>
  );
}