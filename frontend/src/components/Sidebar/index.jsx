import React, { useContext, useEffect, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "../Sidebar/style.css";
import { Collapse } from "react-collapse";
import { FaAngleDown } from "react-icons/fa6";
import Button from "@mui/material/Button";
import { FaAngleUp } from "react-icons/fa6";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import Rating from "@mui/material/Rating";
import { MyContext } from "../../App";
import { useLocation } from "react-router-dom";
import { postData, fetchDataFromApi } from "../../utils/api";
import { MdOutlineFilterAlt } from "react-icons/md";


export const Sidebar = (props) => {
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(true);
  const [isOpenBrandFilter, setIsOpenBrandFilter] = useState(false);
  const [isOpenStockFilter, setIsOpenStockFilter] = useState(false);
  const [isOpenTypeFilter, setIsOpenTypeFilter] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [filters, setFilters] = useState({
    catId: [],
    subCatId: [],
    thirdsubCatId: [],
    minPrice: '',
    maxPrice: '',
    rating: [],
    brand: [],
    stockStatus: [],
    productType: [],
    page: 1,
    limit: 25
  })



  const [price, setPrice] = useState([5, 1000]);

  const context = useContext(MyContext);

  const location = useLocation();

  // Fetch available brands
  useEffect(() => {
    fetchDataFromApi('/api/product/getAllProducts?page=1&limit=1000').then((res) => {
      if (res?.products && Array.isArray(res.products)) {
        const brands = [...new Set(res.products.map(p => p.brand).filter(b => b && b.trim() !== ''))].sort();
        setAvailableBrands(brands);
      }
    }).catch(err => console.error('Error fetching brands:', err));
  }, []);


  const handleCheckboxChange = (field, value) => {

    context?.setSearchData([]);

    const currentValues = filters[field] || []
    const updatedValues = currentValues?.includes(value) ?
      currentValues.filter((item) => item !== value) :
      [...currentValues, value];

    setFilters((prev) => ({
      ...prev,
      [field]: updatedValues
    }))


    if (field === "catId") {
      setFilters((prev) => ({
        ...prev,
        subCatId: [],
        thirdsubCatId: []
      }))
    }

  }


  useEffect(() => {

    const url = window.location.href;
    const queryParameters = new URLSearchParams(location.search);

    if (url.includes("catId")) {
      const categoryId = queryParameters.get("catId");
      if (categoryId) {
        const catArr = [categoryId];
        setFilters((prev) => ({
          ...prev,
          catId: catArr,
          subCatId: [],
          thirdsubCatId: [],
          rating: [],
          page: 1
        }));
        context?.setSearchData([]);
      }
    }

    if (url.includes("subCatId")) {
      const subcategoryId = queryParameters.get("subCatId");
      if (subcategoryId) {
        const subcatArr = [subcategoryId];
        setFilters((prev) => ({
          ...prev,
          subCatId: subcatArr,
          catId: [],
          thirdsubCatId: [],
          rating: [],
          page: 1
        }));
        context?.setSearchData([]);
      }
    }


    if (url.includes("thirdLavelCatId")) {
      const thirdcategoryId = queryParameters.get("thirdLavelCatId");
      if (thirdcategoryId) {
        const thirdcatArr = [thirdcategoryId];
        setFilters((prev) => ({
          ...prev,
          thirdsubCatId: thirdcatArr,
          subCatId: [],
          catId: [],
          rating: [],
          page: 1
        }));
        context?.setSearchData([]);
      }
    }

    // If no category in URL, reset filters
    if (!url.includes("catId") && !url.includes("subCatId") && !url.includes("thirdLavelCatId")) {
      setFilters((prev) => ({
        ...prev,
        catId: [],
        subCatId: [],
        thirdsubCatId: [],
        page: 1
      }));
    }

  }, [location]);



  const filtesData = () => {
    props.setIsLoading(true);

    //console.log(context?.searchData)

    if (context?.searchData?.products?.length > 0) {
      props.setProductsData(context?.searchData);
      props.setIsLoading(false);
      props.setTotalPages(context?.searchData?.totalPages)
      window.scrollTo(0, 0);
    } else {
      postData(`/api/product/filters`, filters).then((res) => {
        props.setProductsData(res);
        props.setIsLoading(false);
        props.setTotalPages(res?.totalPages)
        window.scrollTo(0, 0);
      })
    }


  }



  useEffect(() => {
    filters.page = props.page;
    filtesData();
  }, [filters, props.page])


  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      minPrice: price[0],
      maxPrice: price[1]
    }))
  }, [price]);


  return (
    <aside className="sidebar py-3  lg:py-5 static lg:sticky top-[130px] z-[50] pr-0 lg:pr-5">
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden w-full">
        <div className="box">
          <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
            Shop by Category
            <Button
              className="!w-[44px] !h-[44px] !min-w-[44px] !min-h-[44px] !rounded-full !ml-auto !text-[#000] lg:!w-[30px] lg:!h-[30px] lg:!min-w-[30px] filter-toggle-btn"
              onClick={() => setIsOpenCategoryFilter(!isOpenCategoryFilter)}
            >
              {isOpenCategoryFilter === true ? <FaAngleUp className="filter-icon" /> : <FaAngleDown className="filter-icon" />}
            </Button>
          </h3>
          <Collapse isOpened={isOpenCategoryFilter}>
            <div className="scroll px-4 relative -left-[13px]">


              {
                context?.catData?.length !== 0 && context?.catData?.map((item, index) => {
                  return (
                    <FormControlLabel
                      key={index}
                      value={item?._id}
                      control={<Checkbox />}
                      checked={filters?.catId?.includes(item?._id)}
                      label={item?.name}
                      onChange={() => handleCheckboxChange('catId', item?._id)}
                      className="w-full"
                    />
                  )
                })
              }

            </div>
          </Collapse>
        </div>

        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
            Filter By Price
          </h3>

          <RangeSlider
            value={price}
            onInput={setPrice}
            min={5}
            max={1000}
            step={5}
          />
          <div className="flex pt-4 pb-2 priceRange">
            <span className="text-[13px]">
              From: <strong className="text-dark">${price[0]}</strong>
            </span>
            <span className="ml-auto text-[13px]">
              To: <strong className="text-dark">${price[1]}</strong>
            </span>
          </div>
        </div>

        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
            Filter By Rating
          </h3>

          <div className="flex items-center pl-2 lg:pl-1">
            <FormControlLabel
              value={5}
              control={<Checkbox />}
              checked={filters?.rating?.includes(5)}
              onChange={() => handleCheckboxChange('rating', 5)}
            />
            <Rating
              name="rating"
              value={5}
              size="small"
              readOnly
            />

          </div>



          <div className="flex items-center pl-2 lg:pl-1">
            <FormControlLabel
              value={4}
              control={<Checkbox />}
              checked={filters?.rating?.includes(4)}
              onChange={() => handleCheckboxChange('rating', 4)}
            />
            <Rating
              name="rating"
              value={4}
              size="small"
              readOnly
            />

          </div>


          <div className="flex items-center pl-2 lg:pl-1">
            <FormControlLabel
              value={3}
              control={<Checkbox />}
              checked={filters?.rating?.includes(3)}
              onChange={() => handleCheckboxChange('rating', 3)}
            />
            <Rating
              name="rating"
              value={3}
              size="small"
              readOnly
            />

          </div>


          <div className="flex items-center pl-2 lg:pl-1">
            <FormControlLabel
              value={2}
              control={<Checkbox />}
              checked={filters?.rating?.includes(2)}
              onChange={() => handleCheckboxChange('rating', 2)}
            />
            <Rating
              name="rating"
              value={2}
              size="small"
              readOnly
            />

          </div>




          <div className="flex items-center pl-2 lg:pl-1">
            <FormControlLabel
              value={1}
              control={<Checkbox />}
              checked={filters?.rating?.includes(1)}
              onChange={() => handleCheckboxChange('rating', 1)}
            />
            <Rating
              name="rating"
              value={1}
              size="small"
              readOnly
            />

          </div>

        </div>

        {/* Brand Filter */}
        {availableBrands.length > 0 && (
          <div className="box mt-4">
            <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
              Filter By Brand
              <Button
              className="!w-[44px] !h-[44px] !min-w-[44px] !min-h-[44px] !rounded-full !ml-auto !text-[#000] lg:!w-[30px] lg:!h-[30px] lg:!min-w-[30px] filter-toggle-btn"
              onClick={() => setIsOpenBrandFilter(!isOpenBrandFilter)}
              >
                {isOpenBrandFilter === true ? <FaAngleUp className="filter-icon" /> : <FaAngleDown className="filter-icon" />}
              </Button>
            </h3>
            <Collapse isOpened={isOpenBrandFilter}>
              <div className="scroll px-4 relative -left-[13px] max-h-[200px] overflow-y-auto">
                {availableBrands.map((brand, index) => (
                  <FormControlLabel
                    key={index}
                    value={brand}
                    control={<Checkbox />}
                    checked={filters?.brand?.includes(brand)}
                    label={brand}
                    onChange={() => handleCheckboxChange('brand', brand)}
                    className="w-full"
                  />
                ))}
              </div>
            </Collapse>
          </div>
        )}

        {/* Stock Status Filter */}
        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
            Filter By Stock
            <Button
              className="!w-[44px] !h-[44px] !min-w-[44px] !min-h-[44px] !rounded-full !ml-auto !text-[#000] lg:!w-[30px] lg:!h-[30px] lg:!min-w-[30px] filter-toggle-btn"
              onClick={() => setIsOpenStockFilter(!isOpenStockFilter)}
            >
              {isOpenStockFilter === true ? <FaAngleUp className="filter-icon" /> : <FaAngleDown className="filter-icon" />}
            </Button>
          </h3>
          <Collapse isOpened={isOpenStockFilter}>
            <div className="scroll px-4 relative -left-[13px]">
              <FormControlLabel
                value="in_stock"
                control={<Checkbox />}
                checked={filters?.stockStatus?.includes('in_stock')}
                label="In Stock"
                onChange={() => handleCheckboxChange('stockStatus', 'in_stock')}
                className="w-full"
              />
              <FormControlLabel
                value="out_of_stock"
                control={<Checkbox />}
                checked={filters?.stockStatus?.includes('out_of_stock')}
                label="Out of Stock"
                onChange={() => handleCheckboxChange('stockStatus', 'out_of_stock')}
                className="w-full"
              />
            </div>
          </Collapse>
        </div>

        {/* Product Type Filter */}
        <div className="box mt-4">
          <h3 className="w-full mb-3 text-[16px] font-[600] flex items-center pr-5">
            Filter By Type
            <Button
              className="!w-[44px] !h-[44px] !min-w-[44px] !min-h-[44px] !rounded-full !ml-auto !text-[#000] lg:!w-[30px] lg:!h-[30px] lg:!min-w-[30px] filter-toggle-btn"
              onClick={() => setIsOpenTypeFilter(!isOpenTypeFilter)}
            >
              {isOpenTypeFilter === true ? <FaAngleUp className="filter-icon" /> : <FaAngleDown className="filter-icon" />}
            </Button>
          </h3>
          <Collapse isOpened={isOpenTypeFilter}>
            <div className="scroll px-4 relative -left-[13px]">
              <FormControlLabel
                value="simple"
                control={<Checkbox />}
                checked={filters?.productType?.includes('simple')}
                label="Simple Products"
                onChange={() => handleCheckboxChange('productType', 'simple')}
                className="w-full"
              />
              <FormControlLabel
                value="variable"
                control={<Checkbox />}
                checked={filters?.productType?.includes('variable')}
                label="Variable Products"
                onChange={() => handleCheckboxChange('productType', 'variable')}
                className="w-full"
              />
            </div>
          </Collapse>
        </div>

      </div>
      <br />
      <Button className="btn-org w-full !flex lg:!hidden" onClick={() => context?.setOpenFilter(false)}><MdOutlineFilterAlt size={20} /> Filers</Button>


    </aside>
  );
};
