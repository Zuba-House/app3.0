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
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  }

  const search = () => {

    setIsLoading(true)

    const obj = {
      page: 1,
      limit: 3,
      query: searchQuery
    }

    if (searchQuery !== "") {
      postData(`/api/product/search/get`, obj).then((res) => {
        context?.setSearchData(res);
        setTimeout(() => {
          setIsLoading(false);
          context?.setOpenSearchPanel(false)
          history("/search")
        }, 1000);
      })
    }

  }

  return (
    <div className="searchBox w-[100%] h-[50px] bg-white rounded-xl relative p-2 border border-[#e5e2db] shadow-sm">
      <input
        type="text"
        placeholder="Search products..."
        className="w-full h-[35px] focus:outline-none bg-inherit p-2 text-[15px] text-[#0b2735] placeholder:text-[#0b2735] placeholder:opacity-50"
        value={searchQuery}
        onChange={onChangeInput}
        onKeyPress={handleKeyPress}
      />
      <Button className="!absolute top-[8px] right-[5px] z-50 !w-[37px] !min-w-[37px] h-[37px] !rounded-full !text-[#0b2735] hover:!bg-[#efb291] hover:!text-[#0b2735] search-icon-btn transition-all" onClick={search}>
        {
          isLoading === true ? <CircularProgress size={20} /> : <IoSearch className="text-[#0b2735] search-icon" />
        }


      </Button>
    </div>
  );
};

export default Search;
