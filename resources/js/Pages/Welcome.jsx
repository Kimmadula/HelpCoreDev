import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";

// Utility: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Component: Product Icon
function ProductIcon({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
    </svg>
  );
}

// Component: Search Icon
function SearchIcon() {
  return (
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
  );
}

// Component: Loading Skeleton for Products
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="glass-card relative p-6 rounded-xl animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

// Component: Search Suggestion Item
function SearchSuggestionItem({ result, onNavigate }) {
  const iconConfig = {
    product: {
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      borderColor: "border-orange-100",
      label: "PRODUCT",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
      ),
    },
    section: {
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      borderColor: "border-purple-100",
      label: "SECTION",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ),
    },
    subsection: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
      label: "ARTICLE",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
  };

  const config = iconConfig[result.type] || iconConfig.subsection;

  return (
    <a
      href={result.url}
      onClick={onNavigate}
      className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 group/item"
      role="option"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgColor} ${config.textColor}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            {config.label}
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
  );
}

// Component: Product Card
function ProductCard({ product, index }) {
  return (
    <a
      href={`/help/${product.slug}`}
      className="product-card group relative block"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="glass-card relative p-6 rounded-xl h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Orange gradient accent on hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Icon */}
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
            <ProductIcon className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <h3 className="font-semibold text-base text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
            {product.name}
          </h3>
        </div>

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

// Main Component
export default function MainLanding() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchCancelTokenRef = useRef(null);
  const inputRef = useRef(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Load products on mount
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);
      setProductsError(false);
      try {
        const res = await axios.get("/api/help/products");
        if (!cancelled) setProducts(res.data ?? []);
      } catch (e) {
        console.error("Failed to load products:", e);
        if (!cancelled) {
          setProducts([]);
          setProductsError(true);
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      if (searchCancelTokenRef.current) {
        searchCancelTokenRef.current.cancel("New search initiated");
      }

      searchCancelTokenRef.current = axios.CancelToken.source();

      try {
        setSearchLoading(true);
        const res = await axios.get(
          `/api/help/search?query=${encodeURIComponent(query)}`,
          { cancelToken: searchCancelTokenRef.current.token }
        );
        setSearchResults(res.data.results || []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Search failed:", err);
          setSearchResults([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQ(val);
    setSelectedIndex(-1);

    if (val.trim().length > 1) {
      setSearchLoading(true);
      performSearch(val);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          window.location.href = searchResults[selectedIndex].url;
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) =>
      (p.name ?? "").toLowerCase().includes(query)
    );
  }, [products, q]);

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Head title="Knowledge Base">
        <meta name="description" content="Explore and learn more about our products. Search our comprehensive knowledge base." />
        <meta property="og:title" content="Knowledge Base" />
        <meta property="og:description" content="Explore and learn more about our products." />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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

        .hero-content {
          animation: fadeInUp 0.8s ease-out;
        }

        .search-container {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .product-card {
          animation: fadeInScale 0.5s ease-out both;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .search-suggestion-selected {
          background-color: rgba(255, 108, 0, 0.1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 hero-section">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-start px-4 sm:px-8 pt-32 sm:pt-40 pb-16 hero-gradient overflow-hidden">
          <main className="hero-content relative z-10 text-center max-w-3xl w-full">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 
             bg-gradient-to-t from-[#ff6c00] from-0% to-white to-75% bg-clip-text text-transparent"
              style={{
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.03em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              Kn<img
                src="/coreDev.png"
                alt="coreDev logo"
                className="inline-block align-middle"
                style={{
                  width: '1em',
                  height: '1em',
                  margin: '0 2px'
                }}
              />wledge Base
            </h1>

            <p className="text-base sm:text-lg text-white mb-10 font-normal">
              Explore and learn more about our products.
            </p>

            {/* Search Bar */}
            <div className="search-container w-full max-w-2xl mx-auto relative group">
              <div className="relative z-50">
                <SearchIcon />

                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search keyword..."
                  aria-label="Search knowledge base"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions"
                  aria-expanded={showSuggestions && searchResults.length > 0}
                  className="w-full py-4 pl-14 pr-6 text-base rounded-xl border-none shadow-lg focus:shadow-xl focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />

                {searchLoading && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchResults.length > 0 && (
                  <div
                    id="search-suggestions"
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn"
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className={selectedIndex === idx ? 'search-suggestion-selected' : ''}
                        >
                          <SearchSuggestionItem
                            result={result}
                            onNavigate={() => setShowSuggestions(false)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showSuggestions && !searchLoading && q.trim().length > 1 && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
                    <div className="px-6 py-8 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">No results found</p>
                      <p className="text-sm mt-1">Try different keywords or browse products below</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Scroll Down Arrow */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex justify-center animate-bounce cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            onClick={scrollToProducts}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && scrollToProducts()}
            aria-label="Scroll to products"
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
          className="relative min-h-screen px-4 sm:px-8 py-20"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 247, 0.9) 100%)'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-12 uppercase"
              style={{
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.02em'
              }}
            >
              Products
            </h2>

            <div className="mb-12">
              {loadingProducts ? (
                <ProductSkeleton />
              ) : productsError ? (
                <div className="text-center text-red-600 py-12">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">Failed to load products</p>
                  <p className="text-sm mt-1 text-gray-600">Please refresh the page to try again</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium">
                    {q.trim()
                      ? "No products match your search"
                      : "No published products yet"}
                  </p>
                  {q.trim() && (
                    <p className="text-sm mt-1">Try adjusting your search terms</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p, index) => (
                    <ProductCard key={p.id} product={p} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#353635] border-t border-gray-300">
          <div className="max-w-6xl mx-auto px-5 py-5">
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
                © {currentYear} Powered by
                <a href="https://coredev.ph/" target="_blank" rel="noopener noreferrer" className="text-[#51bcda]">
                  <img
                    src="/coreDevlogo.png"
                    alt="coreDev logo"
                    style={{
                      width: '1em',
                      height: '1em',
                      verticalAlign: 'middle',
                      display: 'inline-block',
                      margin: '0 2px'
                    }}
                  />
                  coredev Solutions Inc.
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}