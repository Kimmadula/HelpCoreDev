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
          background: linear-gradient(135deg, #FFF4E6 0%, #FFE5CC 25%, #FFB088 50%, #FF8C66 75%, #FF7A59 100%);
        }

        .hero-overlay::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 120, 80, 0.3) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
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
        <section className="relative min-h-screen flex flex-col items-center justify-center px-8 py-16 hero-gradient overflow-hidden">
          <div className="hero-overlay absolute inset-0"></div>

          <div className="hero-content relative z-10 text-center max-w-3xl w-full">
            <h1 
              className="text-5xl md:text-7xl font-extrabold mb-4 text-gray-900"
              style={{ 
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.03em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              Knowledge Base
            </h1>
            
            <p className="text-lg text-gray-700 mb-10 font-normal">
              Explore and learn more about our products.
            </p>

            {/* Search Bar */}
            <div className="search-container w-full max-w-2xl mx-auto">
              <div className="relative">
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
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for products, features, or documentation..."
                  className="w-full py-4 pl-14 pr-6 text-base rounded-xl border-none shadow-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section 
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
                      <div className="product-icon flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-900">
                        <ProductIcon />
                      </div>
                      
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
              
              <div className="text-xs text-gray-500">
                © {new Date().getFullYear()} Powered by OranDev Solutions Inc.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}