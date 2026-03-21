import React, { useContext, useState } from "react";
import "../Search/style.css";
import Button from "@mui/material/Button";
import { IoSearch } from "react-icons/io5";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';

const Search = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(MyContext);

  const history = useNavigate();

  const onChangeInput = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  };

  const search = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    const obj = {
      page: 1,
      limit: 3,
      query: trimmedQuery
    };

    try {
      setIsLoading(true);
      const res = await postData(`/api/product/search/get`, obj);
      context?.setSearchData(res);
      context?.setOpenSearchPanel(false);
      history(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } catch (error) {
      console.error("Search failed:", error);
      context?.alertBox?.("error", "Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="searchBox w-[100%] h-[50px] bg-[#e5e5e5] rounded-[5px] relative p-2">
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full h-[35px] focus:outline-none bg-inherit p-2 text-[15px]"
        value={searchQuery}
        onChange={onChangeInput}
        onKeyDown={handleKeyDown}
      />
      <Button className="!absolute top-[8px] right-[5px] z-50 !w-[37px] !min-w-[37px] h-[37px] !rounded-full !text-black search-icon-btn" onClick={search}>
        {
          isLoading === true ? <CircularProgress /> : <IoSearch className="text-[#4e4e4e] search-icon" />
        }


      </Button>
    </div>
  );
};

export default Search;
