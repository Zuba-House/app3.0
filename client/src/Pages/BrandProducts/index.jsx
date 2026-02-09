import React, { useContext, useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";

// Brand configuration - add new brands here
// The key is case-insensitive URL slug, value contains display info
const BRAND_CONFIG = {
  ngoma: {
    displayName: "NGOMA",
    brandQuery: "NGOMA", // The exact brand name in the database
    description: "Discover our exclusive collection of NGOMA products. Premium quality, authentic designs.",
    headerColor: "#0b2735",
    accentColor: "#eeb190"
  },
  kanyanaworld: {
    displayName: "Kanyana World",
    brandQuery: "KanyanaWorld", // The exact brand name in the database (can also match case-insensitively)
    description: "Explore the vibrant Kanyana World collection. Unique styles, exceptional quality.",
    headerColor: "#0b2735",
    accentColor: "#eeb190"
  },
  // Add more brands as needed:
  // brandslug: {
  //   displayName: "Brand Display Name",
  //   brandQuery: "ExactBrandNameInDB",
  //   description: "Brand description...",
  //   headerColor: "#0b2735",
  //   accentColor: "#eeb190"
  // }
};

// Function to get brand config (case-insensitive)
const getBrandConfig = (brandSlug) => {
  if (!brandSlug) return null;
  const normalizedSlug = brandSlug.toLowerCase().replace(/[-_\s]/g, '');
  
  // Try exact match first
  if (BRAND_CONFIG[normalizedSlug]) {
    return BRAND_CONFIG[normalizedSlug];
  }
  
  // Try matching against keys with similar normalization
  for (const [key, config] of Object.entries(BRAND_CONFIG)) {
    const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
    if (normalizedKey === normalizedSlug) {
      return config;
    }
  }
  
  // If no config found, create a generic one using the slug
  return {
    displayName: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
    brandQuery: brandSlug,
    description: `Browse our collection of ${brandSlug} products.`,
    headerColor: "#0b2735",
    accentColor: "#eeb190"
  };
};

const BrandProductsPage = () => {
  const { brandSlug: paramBrandSlug } = useParams();
  const location = useLocation();
  
  // Get brand slug from URL params or from direct path (e.g., /kanyanaworld)
  const brandSlug = useMemo(() => {
    if (paramBrandSlug) {
      return paramBrandSlug;
    }
    // Extract brand from direct URL path (e.g., /kanyanaworld -> kanyanaworld)
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length === 1) {
      return pathParts[0];
    }
    return null;
  }, [paramBrandSlug, location.pathname]);
  
  const [itemView, setItemView] = useState("grid");
  const [anchorEl, setAnchorEl] = useState(null);

  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [selectedSortVal, setSelectedSortVal] = useState("Name, A to Z");

  const context = useContext(MyContext);

  // Get brand configuration
  const brandConfig = useMemo(() => getBrandConfig(brandSlug), [brandSlug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(1);
    setSelectedSortVal("Name, A to Z");
    fetchBrandProducts(1);
  }, [brandSlug]);

  const fetchBrandProducts = async (pageNum = 1, sortBy = 'name', order = 'asc') => {
    setIsLoading(true);
    try {
      const response = await postData('/api/product/filters', {
        brand: [brandConfig.brandQuery],
        page: pageNum,
        limit: 24
      });

      if (response?.error === false && response?.products) {
        // Sort products if needed
        let sortedProducts = [...response.products];
        if (sortBy === 'name') {
          sortedProducts.sort((a, b) => {
            const nameA = (a.name || a.productTitle || '').toLowerCase();
            const nameB = (b.name || b.productTitle || '').toLowerCase();
            return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
          });
        } else if (sortBy === 'price') {
          sortedProducts.sort((a, b) => {
            const priceA = parseFloat(a.pricing?.price || a.price || 0);
            const priceB = parseFloat(b.pricing?.price || b.price || 0);
            return order === 'asc' ? priceA - priceB : priceB - priceA;
          });
        }

        setProductsData({
          products: sortedProducts,
          total: response.total,
          page: response.page,
          totalPages: response.totalPages
        });
        setTotalPages(response.totalPages || 1);
        setTotalProducts(response.total || 0);
        setPage(pageNum);
      } else {
        setProductsData({ products: [], total: 0, page: 1, totalPages: 1 });
        setTotalPages(1);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error(`Error fetching ${brandConfig.displayName} products:`, error);
      setProductsData({ products: [], total: 0, page: 1, totalPages: 1 });
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  };

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortBy = (name, order, value) => {
    setSelectedSortVal(value);
    fetchBrandProducts(page, name, order);
    setAnchorEl(null);
  };

  const handlePageChange = (event, value) => {
    fetchBrandProducts(value, selectedSortVal.includes('Price') ? 'price' : 'name', 
      selectedSortVal.includes('high to low') || selectedSortVal.includes('Z to A') ? 'desc' : 'asc');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="pb-0">
      <div className="bg-white p-2">
        <div className="container">
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb" className="mb-4 pt-4">
            <Link to="/" className="text-[#0b2735] hover:text-[#eeb190]">
              Home
            </Link>
            <span className="text-gray-600">{brandConfig.displayName} Products</span>
          </Breadcrumbs>

          {/* Header Section */}
          <div className="mb-6">
            <h1 
              className="text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-[700] mb-2"
              style={{ color: brandConfig.headerColor }}
            >
              {brandConfig.displayName} Products
            </h1>
            <p className="text-[14px] sm:text-[16px] text-gray-600">
              {brandConfig.description}
            </p>
          </div>

          {/* Toolbar */}
          <div className="bg-[#f1f1f1] p-2 w-full mb-4 rounded-md flex items-center justify-between sticky top-[135px] z-[99]">
            <div className="col1 flex items-center itemViewActions">
              <Button
                className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full 
                  !text-[#000] ${itemView === "list" && "active !bg-[#dfdfdf]"}`}
                onClick={() => setItemView("list")}
              >
                <LuMenu className="text-[rgba(0,0,0,0.7)] text-[16px]" />
              </Button>
              <Button
                className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full 
                  !text-[#000] ${itemView === "grid" && "active !bg-[#dfdfdf]"}`}
                onClick={() => setItemView("grid")}
              >
                <IoGridSharp className="text-[rgba(0,0,0,0.7)] text-[14px]" />
              </Button>

              <span className="text-[14px] hidden sm:block md:block lg:block font-[500] pl-3 text-[rgba(0,0,0,0.7)]">
                {totalProducts > 0 ? `Showing ${productsData?.products?.length || 0} of ${totalProducts} products` : 'No products found'}
              </span>
            </div>

            <div className="col2 ml-auto flex items-center justify-end gap-3 pr-4">
              <span className="text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]">
                Sort By
              </span>

              <Button
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                className="!bg-white !text-[12px] !text-[#000] !capitalize !border-2 
                !border-[#000]"
              >
                {selectedSortVal}
              </Button>

              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem
                  onClick={() => handleSortBy('name', 'asc', 'Name, A to Z')}
                  className="!text-[13px] !text-[#000] !capitalize"
                >
                  Name, A to Z
                </MenuItem>

                <MenuItem
                  onClick={() => handleSortBy('name', 'desc', 'Name, Z to A')}
                  className="!text-[13px] !text-[#000] !capitalize"
                >
                  Name, Z to A
                </MenuItem>

                <MenuItem
                  onClick={() => handleSortBy('price', 'asc', 'Price, low to high')}
                  className="!text-[13px] !text-[#000] !capitalize"
                >
                  Price, low to high
                </MenuItem>

                <MenuItem
                  onClick={() => handleSortBy('price', 'desc', 'Price, high to low')}
                  className="!text-[13px] !text-[#000] !capitalize"
                >
                  Price, high to low
                </MenuItem>
              </Menu>
            </div>
          </div>

          {/* Products Grid/List */}
          <div
            className={`grid ${itemView === "grid"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1"
              } gap-4`}
          >
            {itemView === "grid" ? (
              <>
                {isLoading === true ? (
                  <ProductLoadingGrid view={itemView} />
                ) : (
                  productsData?.products?.length !== 0 && productsData?.products?.map((item, index) => {
                    return (
                      <ProductItem key={item._id || index} item={item} />
                    )
                  })
                )}
              </>
            ) : (
              <>
                {isLoading === true ? (
                  <ProductLoadingGrid view={itemView} />
                ) : (
                  productsData?.products?.length !== 0 && productsData?.products?.map((item, index) => {
                    return (
                      <ProductItemListView key={item._id || index} item={item} />
                    )
                  })
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-10 mb-6">
              <Pagination
                showFirstButton
                showLastButton
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && productsData?.products?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[18px] text-gray-600 mb-4">
                No {brandConfig.displayName} products found at the moment.
              </p>
              <Link to="/products">
                <Button className="!bg-[#0b2735] hover:!bg-[#1a3d52] !text-white !capitalize">
                  Browse All Products
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Export the brand config for use in other components if needed
export { BRAND_CONFIG, getBrandConfig };
export default BrandProductsPage;

