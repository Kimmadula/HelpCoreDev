import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';

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

export function useProductSearch() {
    // Product State
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState(false);

    // Search State
    const [q, setQ] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchCancelTokenRef = useRef(null);

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

    const handleKeyDown = (e, inputRef) => {
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

    return {
        products: filteredProducts,
        allProducts: products, // Original list if needed
        loadingProducts,
        productsError,
        q,
        setQ,
        searchResults,
        showSuggestions,
        setShowSuggestions,
        searchLoading,
        selectedIndex,
        handleSearchChange,
        handleKeyDown,
    };
}
