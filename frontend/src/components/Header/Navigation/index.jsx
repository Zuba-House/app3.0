import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState } from "react";
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { GoRocket } from "react-icons/go";
import CategoryPanel from "./CategoryPanel";

import "../Navigation/style.css";
import { fetchDataFromApi } from "../../../utils/api";
import { MyContext } from "../../../App";
import MobileNav from "./MobileNav";

const Navigation = (props) => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [catData, setCatData] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    setCatData(context?.catData);
  }, [context?.catData]);

  useEffect(() => {
    setIsOpenCatPanel(props.isOpenCatPanel);
  }, [props.isOpenCatPanel])

  const openCategoryPanel = () => {
    setIsOpenCatPanel(true);
  };

  return (
    <>
      {/* ZeroX Intelligence: Updated navigation background to match header/footer */}
      <nav className="navigation bg-[#0b2735]">
        <div className="container flex items-center justify-start lg:justify-end gap-8">
          {
            context?.windowWidth > 992 &&
            <div className="col_1 w-[20%]">
              {/* ZeroX Intelligence: Updated Shop By Categories button colors */}
              <Button
                className="!text-[#e5e2db] hover:!text-[#efb291] gap-2 w-full transition-all"
                onClick={openCategoryPanel}
              >
                <RiMenu2Fill className="text-[18px]" />
                Shop By Categories
                <LiaAngleDownSolid className="text-[13px] ml-auto font-bold" />
              </Button>
            </div>
          }


          <div className="col_2 w-full lg:w-[60%]">
            <ul className="flex items-center gap-3 nav">
              {/* ZeroX Intelligence: Updated Home link colors */}
              <li className="list-none">
                <Link to="/" className="link transition text-[14px] font-[500]">
                  <Button className="link transition !font-[500] !text-[#e5e2db] hover:!text-[#efb291] !py-4">
                    Home
                  </Button>
                </Link>
              </li>
              <li className="list-none">
               
              </li>

              {
                catData?.length !== 0 && catData?.map((cat, index) => {
                  return (
                    <li className="list-none relative" key={index}>
                      {/* ZeroX Intelligence: Updated category link colors */}
                      <Link to={`/products?catId=${cat?._id}`} className="link transition text-[14px] font-[500]">
                        <Button className="link transition !font-[500] !text-[#e5e2db] hover:!text-[#efb291] !py-4">
                          {cat?.name}
                        </Button>
                      </Link>

                      {
                        cat?.children?.length !== 0 &&
                        /* ZeroX Intelligence: Updated submenu background to match main nav */
                        <div className="submenu absolute top-[120%] left-[0%] min-w-[150px] bg-[#0b2735] shadow-md opacity-0 transition-all border border-[rgba(229,226,219,0.2)]">
                          <ul>
                            {
                              cat?.children?.map((subCat, index_) => {
                                return (
                                  <li className="list-none w-full relative" key={index_}>
                                    <Link to={`/products?subCatId=${subCat?._id}`} className="w-full">
                                      {/* ZeroX Intelligence: Updated submenu item colors */}
                                      <Button className="!text-[#e5e2db] hover:!text-[#efb291] w-full !text-left !justify-start !rounded-none transition-all">
                                        {subCat?.name}
                                      </Button>

                                      {
                                        subCat?.children?.length !== 0 &&
                                        /* ZeroX Intelligence: Updated third-level submenu background */
                                        <div className="submenu absolute top-[0%] left-[100%] min-w-[150px] bg-[#0b2735] shadow-md opacity-0 transition-all border border-[rgba(229,226,219,0.2)]">
                                          <ul>
                                            {
                                              subCat?.children?.map((thirdLavelCat, index__) => {
                                                return (
                                                  <li className="list-none w-full" key={index__}>
                                                    <Link to={`/products?thirdLavelCatId=${thirdLavelCat?._id}`} className="w-full">
                                                      {/* ZeroX Intelligence: Updated third-level submenu item colors */}
                                                      <Button className="!text-[#e5e2db] hover:!text-[#efb291] w-full !text-left !justify-start !rounded-none transition-all">
                                                        {thirdLavelCat?.name}
                                                      </Button>
                                                    </Link>
                                                  </li>)
                                              })
                                            }



                                          </ul>
                                        </div>
                                      }


                                    </Link>
                                  </li>
                                )
                              })
                            }




                          </ul>
                        </div>
                      }

                    </li>
                  )
                })
              }


            </ul>
          </div>

          {/* Currency Notice */}
          <div className="col_3 w-[20%] hidden lg:block">
            <p className="text-[14px] font-[500] flex items-center gap-3 mb-0 mt-0 text-[#e5e2db]">
              <GoRocket className="text-[18px] text-[#efb291]" />
              All prices in USD
            </p>
          </div>
        </div>
      </nav>

      {/* category panel component */}
      {
        catData?.length !== 0 &&
        <CategoryPanel
          isOpenCatPanel={isOpenCatPanel}
          setIsOpenCatPanel={setIsOpenCatPanel}
          propsSetIsOpenCatPanel={props.setIsOpenCatPanel}
          data={catData}
        />
      }


      {
        context?.windowWidth < 992 && <MobileNav />
      }



    </>
  );
};

export default Navigation;
