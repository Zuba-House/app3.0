import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdStore } from "react-icons/md";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { MyContext } from "../../App";
import { SiBloglovin } from "react-icons/si";
import { fetchDataFromApi } from "../../utils/api";
import { IoLogoBuffer } from "react-icons/io";
import { IoAnalytics } from "react-icons/io5";
import { RiCoupon3Line, RiGiftLine } from "react-icons/ri";
import { MdLocalOffer } from "react-icons/md";



const Sidebar = () => {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  const context = useContext(MyContext);


  const logout = () => {
    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
    setSubmenuIndex(null)

    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history("/login")
      }
    })
  }


  return (
    <>
      <div className={`sidebar fixed top-0 left-0 z-[52] h-full border-r border-[rgba(255,255,255,0.1)] py-2 px-4 w-[${context.isSidebarOpen === true ? `${20}%` : '0px'}]`}>
        <div className="py-2 w-full"
          onClick={() => {
            context?.windowWidth < 992 && context?.setisSidebarOpen(false)
            setSubmenuIndex(null)
          }}
        >
          <Link to="/">
            <img
            src={localStorage.getItem('logo')}
              className="w-[170px] md:min-w-[200px]"
            />
          </Link>
        </div>

        <ul className="mt-4 overflow-y-scroll max-h-[80vh]">
          <li>
            <Link to="/"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <RxDashboard className="text-[18px] text-[#efb291]" /> <span>Dashboard</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(1)}
            >
              <FaRegImage className="text-[18px] text-[#efb291]" /> <span>Home Slides</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 1 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 1 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/homeSlider/list"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      Home Banners List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: 'Add Home Slide'
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                    Add Home Banner Slide
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>


          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(3)}
            >
              <TbCategory className="text-[18px] text-[#efb291]" /> <span>Category</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 3 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 3 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/category/list" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      Category List

                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: 'Add New Category'
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                    Add a Category
                  </Button>
                </li>
                <li className="w-full">
                  <Link to="/subCategory/list" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                  }}>
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                      Sub Category List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: 'Add New Sub Category'
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                    Add a Sub Category
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(4)}
            >
              <RiProductHuntLine className="text-[18px] text-[#efb291]" />{" "}
              <span>Products</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 4 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 4 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/products" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      Product List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/add-product-enhanced" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                      Add Product (Enhanced)
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>



          <li>
            <Link to="/users"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <FiUsers className="text-[18px] text-[#efb291]" /> <span>Users</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(7)}
            >
              <MdStore className="text-[18px] text-[#efb291]" /> <span>Vendors</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 7 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 7 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/vendors"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      Vendor Management
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/vendor-products"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                      🔔 Product Approvals
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>


          <li>
            <Link to="/orders"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <IoBagCheckOutline className="text-[20px] text-[#efb291]" /> <span>Orders</span>
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/analytics"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <IoAnalytics className="text-[20px] text-[#efb291]" /> <span>Analytics</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(5)}
            >
              <RiProductHuntLine className="text-[18px]" />
              <span>Banners</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 5 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 5 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/bannerV1/List"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      Home Banner List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: "Add Home Banner List 1"
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                    Add Home Banner
                  </Button>
                </li>

                <li className="w-full">
                  <Link to="/bannerlist2/List" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      Home Banner List 2
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: "Add Home Banner List2"
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                    Add Banner
                  </Button>
                </li>

                <li className="w-full">
                  <Link to="/banners/responsive"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>{" "}
                      📱 Responsive Banners
                    </Button>
                  </Link>
                </li>


              </ul>
            </Collapse>
          </li>


          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(6)}
            >
              <SiBloglovin className="text-[18px] text-[#efb291]" />
              <span>Blogs</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 6 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 6 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/blog/List" onClick={() => {
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                      Blog List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3" onClick={() => {
                    context.setIsOpenFullScreenPanel({
                      open: true,
                      model: "Add Blog"
                    })
                    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                    setSubmenuIndex(null)
                  }}>
                    <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                    Add Blog
                  </Button>
                </li>


              </ul>
            </Collapse>
          </li>


          <li>
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(8)}
            >
              <MdLocalOffer className="text-[18px] text-[#efb291]" /> <span>Promotions</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 8 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 8 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/coupons"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <RiCoupon3Line className="text-[14px] text-[#efb291]" />
                      Coupons / Promo Codes
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Link to="/gift-cards"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <RiGiftLine className="text-[14px] text-[#efb291]" />
                      Gift Cards
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li>
            <Link to="/logo/manage">
              <Button
                className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              >
                <IoLogoBuffer className="text-[18px] text-[#efb291]" />
                <span>Manage Logo</span>
              </Button>
            </Link>
          </li>

          <li>
            <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]" onClick={logout}>
              <IoMdLogOut className="text-[20px] text-[#efb291]" /> <span>Logout</span>
            </Button>
          </li>
        </ul>



      </div>


      {
        context?.windowWidth < 920 && context?.isSidebarOpen === true &&
        <div className="sidebarOverlay pointer-events-none fixed top-0 left-0 bg-[rgba(0,0,0,0.5)] w-full h-full
       z-[51]" onClick={() => {
            context?.setisSidebarOpen(false)
            setSubmenuIndex(null)
          }}>
        </div>
      }



    </>
  );
};

export default Sidebar;
