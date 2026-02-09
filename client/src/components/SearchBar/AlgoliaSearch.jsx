import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDataFromApi, postData } from '../../utils/api';
import './AlgoliaSearch.css';

const CustomSearch = ({ placeholder = "Search for products..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await postData('/api/product/search/get', {
        query: query,
        page: 1,
        limit: 10
      });
      
      if (response?.error === false && response?.products) {
        setResults(response.products);
        setShowResults(true);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setShowResults(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  // Get image URL helper
  const getImageUrl = (images) => {
    if (!images || images.length === 0) return '/placeholder.png';
    const firstImage = images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (typeof firstImage === 'object' && firstImage.url) return firstImage.url;
    if (typeof firstImage === 'object' && firstImage.secureUrl) return firstImage.secureUrl;
    return '/placeholder.png';
  };

  // Get price helper
  const getPrice = (product) => {
    if (product?.pricing?.salePrice) return product.pricing.salePrice;
    if (product?.pricing?.regularPrice) return product.pricing.regularPrice;
    if (product?.salePrice) return product.salePrice;
    if (product?.price) return product.price;
    return 0;
  };

  return (
    <div className="custom-search relative">
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => {
            // Delay hiding to allow clicks
            setTimeout(() => setShowResults(false), 200);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#efb291] text-[#0b2735]"
        />
      </form>
      
      {showResults && (
        <div className="search-results absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleResultClick(product._id)}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                >
                  <img
                    src={getImageUrl(product.images || product.bannerimages)}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#0b2735]">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      ${getPrice(product).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No products found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CustomSearch;
