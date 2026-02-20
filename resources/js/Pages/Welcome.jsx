import { Head } from "@inertiajs/react";
import { useRef, useMemo } from "react";
import { useProductSearch } from "../Hooks/useProductSearch";

// Components
import ProductCard from "../Components/Welcome/ProductCard";
import ProductSkeleton from "../Components/Welcome/ProductSkeleton";
import SearchSuggestionItem from "../Components/Welcome/SearchSuggestionItem";

// Styles
import '../../css/welcome.css';

// Local Search Icon Component
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

// Main Component
export default function MainLanding() {
  const {
    products, // This is filteredProducts from the hook
    loadingProducts,
    productsError,
    q,
    searchResults,
    showSuggestions,
    setShowSuggestions,
    searchLoading,
    selectedIndex,
    handleSearchChange,
    handleKeyDown,
  } = useProductSearch();

  const inputRef = useRef(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

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
                  onKeyDown={(e) => handleKeyDown(e, inputRef)}
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
              ) : products.length === 0 ? (
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
                  {products.map((p, index) => (
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