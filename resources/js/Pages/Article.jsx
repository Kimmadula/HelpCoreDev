import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import ArticleRenderer from "@/Components/Article/ArticleRenderer";
import ArticleSidebar from "@/Components/Article/ArticleSidebar";
import ScrollToTopButton from "@/Components/ScrollToTopButton";
import "../../css/HelpDocs.css";

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
        <ArticleSidebar
          sidebarOpen={sidebarOpen}
          nav={nav}
          activeSubsectionId={activeSubsectionId}
          onSubsectionClick={handleSubsectionClick}
        />

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

          <ScrollToTopButton show={showScrollTop} onClick={scrollToTop} />

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