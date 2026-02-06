import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function ProductIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
    </svg>
  );
}

export default function MainLanding() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const res = await axios.get("/api/help/products");
        if (!cancelled) setProducts(res.data ?? []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) =>
      (p.name ?? "").toLowerCase().includes(query)
    );
  }, [products, q]);

  return (
    <>
      <Head title="CoreDev" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .hero-section {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .hero-gradient {
          background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/storage/background.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          
        }

        /* Overlay removed as requested */
        .hero-overlay {
            display: none;
        }

        .hero-content {
          animation: fadeInUp 0.8s ease-out;
        }

        .search-container {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .product-card {
          animation: fadeInScale 0.5s ease-out both;
          background: rgba(220, 220, 225, 0.85);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover {
          background: rgba(200, 200, 210, 0.95);
          transform: translateY(-4px);
        }

        .product-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 10px;
          border: 2px solid transparent;
          transition: border-color 0.3s ease;
        }

        .product-card:hover::after {
          border-color: rgba(255, 122, 89, 0.3);
        }

        .product-card:nth-child(1) { animation-delay: 0.05s; }
        .product-card:nth-child(2) { animation-delay: 0.1s; }
        .product-card:nth-child(3) { animation-delay: 0.15s; }
        .product-card:nth-child(4) { animation-delay: 0.2s; }
        .product-card:nth-child(5) { animation-delay: 0.25s; }
        .product-card:nth-child(6) { animation-delay: 0.3s; }
        .product-card:nth-child(7) { animation-delay: 0.35s; }
        .product-card:nth-child(8) { animation-delay: 0.4s; }
        .product-card:nth-child(9) { animation-delay: 0.45s; }
        .product-card:nth-child(10) { animation-delay: 0.5s; }
        .product-card:nth-child(11) { animation-delay: 0.55s; }

        .product-icon svg {
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-icon svg {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 hero-section">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-start px-8 pt-40 pb-16 hero-gradient overflow-hidden">

          <div className="hero-content relative z-10 text-center max-w-3xl w-full">
            <h1
              className="text-5xl md:text-7xl font-extrabold mb-4"
              style={{
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.03em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                color: '#ff6c00'
              }}
            >
              Knowledge Base
            </h1>

            <p className="text-lg text-white mb-10 font-normal">
              Explore and learn more about our products.
            </p>

            {/* Search Bar with Autosuggest */}
            <div className="search-container w-full max-w-2xl mx-auto relative group">
              <div className="relative z-50">
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>

                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQ(val);
                    if (val.trim().length > 1) {
                      axios.get(`/api/help/search?query=${encodeURIComponent(val)}`)
                        .then(res => setSearchResults(res.data.results || []))
                        .catch(err => console.error(err));
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search keyword..."
                  className="w-full py-4 pl-14 pr-6 text-base rounded-xl border-none shadow-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <a
                          key={`${result.type}-${result.id}`}
                          href={result.url}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 group/item"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${result.type === 'product' ? 'bg-orange-100 text-orange-600' :
                            result.type === 'section' ? 'bg-purple-100 text-purple-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                            {result.type === 'product' ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                              </svg>
                            ) : result.type === 'section' ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${result.type === 'product' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                result.type === 'section' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                  'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {result.type === 'product' ? 'PRODUCT' : result.type === 'section' ? 'SECTION' : 'ARTICLE'}
                              </span>
                            </div>
                            <div className="font-medium text-gray-900 group-hover/item:text-orange-600 transition-colors truncate">
                              {result.title}
                            </div>
                            {(result.type === 'subsection' || result.type === 'section') && (
                              <div className="text-xs text-gray-500 mt-0.5 truncate">
                                in {result.product_name}
                              </div>
                            )}
                          </div>
                          <svg className="w-4 h-4 text-gray-300 group-hover/item:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Scroll Down Arrow*/}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex justify-center animate-bounce cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            onClick={() => {
              document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l4 4 4-4" />
              <path d="M12 8v8" />
            </svg>
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section
          id="products"
          className="relative min-h-screen px-8 py-20"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 247, 0.9) 100%)'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold text-center mb-12 uppercase"
              style={{
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.02em'
              }}
            >
              Product
            </h2>

            <div className="mb-12">
              {loadingProducts ? (
                <div className="text-center text-gray-600 py-12">
                  Loading products…
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                  {q.trim()
                    ? "No products match your search."
                    : "No published products yet."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => (
                    <a
                      key={p.id}
                      href={`/help/${p.slug}`}
                      className="product-card relative flex items-center gap-4 p-6 rounded-xl shadow-sm cursor-pointer"
                    >


                      <div className="min-w-0">
                        <div
                          className="font-semibold text-sm uppercase tracking-wider text-gray-900"
                          style={{ letterSpacing: '0.01em' }}
                        >
                          {p.name}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-200 border-t border-gray-300">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <div className="flex flex-wrap justify-between items-center gap-8">
              <div className="flex gap-12 text-sm text-gray-600">
                <div className="cursor-pointer hover:text-gray-900 transition-colors">
                  HELP DESK
                </div>
                <div className="cursor-pointer hover:text-gray-900 transition-colors">
                  ISSUE TRACKER
                </div>
              </div>

              <div className="text-s text-gray-500">
                © {new Date().getFullYear()} Powered by <a
                  href="https://coredev.ph/"
                  target="_blank"
                  className="text-[#51bcda] hover:opacity-80">
                  Coredev Solutions Inc.
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}