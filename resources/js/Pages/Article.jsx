import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import ArticleRenderer from "@/Components/Article/ArticleRenderer";
import ArticleSidebar from "@/Components/Article/ArticleSidebar";
import TableOfContents from "@/Components/Article/TableOfContents";
import ScrollToTopButton from "@/Components/ScrollToTopButton";
import ArticleSkeleton from "@/Components/Article/ArticleSkeleton";
import "../../css/HelpDocs.css";

export default function HelpDocs({ productSlug = "help-desk" }) {
  const [nav, setNav] = useState(null);

  const [activeSubsectionId, setActiveSubsectionId] = useState(null);
  const [subsectionData, setSubsectionData] = useState(null);
  const [loadingSubsection, setLoadingSubsection] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Table of Contents state
  const [toc, setToc] = useState([]);
  const [activeTocId, setActiveTocId] = useState("");

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const handleScroll = () => {
      setShowScrollTop(mainContent.scrollTop > 300);
    };

    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  // Extract headings for ToC
  useEffect(() => {
    if (!loadingSubsection && subsectionData) {
      setTimeout(() => {
        const container = document.querySelector('.content-body');
        if (container) {
          const headings = container.querySelectorAll('h2, h3');
          const tocItems = [];
          headings.forEach((heading, index) => {
            const id = heading.id || `heading-${index}`;
            if (!heading.id) heading.id = id;

            heading.style.scrollMarginTop = '80px';

            tocItems.push({
              id,
              text: heading.innerText,
              level: heading.tagName.toLowerCase() === 'h3' ? 3 : 2
            });
          });
          setToc(tocItems);
        }
      }, 50);
    } else {
      setToc([]);
    }
  }, [loadingSubsection, subsectionData]);

  // Highlight active ToC item
  useEffect(() => {
    if (toc.length === 0) return;

    const mainContent = document.querySelector('.main-content');

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          if (mainContent && mainContent.clientHeight + mainContent.scrollTop >= mainContent.scrollHeight - 10) {
            setActiveTocId(toc[toc.length - 1].id);
          } else {
            setActiveTocId(visible[0].target.id);
          }
        }
      },
      {
        root: mainContent,
        rootMargin: "-80px 0px -40% 0px"
      }
    );

    const headings = document.querySelectorAll('.content-body h2, .content-body h3');
    headings.forEach((h) => observer.observe(h));

    return () => {
      headings.forEach((h) => observer.unobserve(h));
    };
  }, [toc]);

  const handleSubsectionClick = (id) => {
    setActiveSubsectionId(id);
    setSidebarOpen(false);
  };

  return (
    <>
      <Head title={nav?.name ? nav.name : "Knowledge Base"} />
      <style>{`
        body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }
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

          <div className="flex flex-1 w-full items-start max-w-[1400px] mx-auto">
            <div className="content-body flex-1 min-w-0">
              {loadingSubsection ? (
                <ArticleSkeleton />
              ) : (
                <>
                  <h1 className="content-title">
                    {subsectionData?.title ?? ""}
                  </h1>
                  <ArticleRenderer blocks={subsectionData?.blocks ?? []} />
                </>
              )}
            </div>

            <TableOfContents toc={toc} activeId={activeTocId} />
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
                    coreDev Solutions Inc.
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