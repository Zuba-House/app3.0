import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import { RxDashboard } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdStore } from "react-icons/md";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { MyContext } from "../../App";
import { SiBloglovin } from "react-icons/si";
import { fetchDataFromApi, postData } from "../../utils/api";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoAnalytics } from "react-icons/io5";
import { RiCoupon3Line, RiGiftLine } from "react-icons/ri";
import { MdLocalOffer } from "react-icons/md";



const Sidebar = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const [pushBadge, setPushBadge] = useState(0);
  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  const context = useContext(MyContext);

  useEffect(() => {
    const loadBadge = async () => {
      const res = await fetchDataFromApi('/api/notifications/unread-count', {
        silent: true,
      });
      const count = res?.data?.count ?? res?.count;
      if (count != null) setPushBadge(Number(count) || 0);
    };
    loadBadge();
    const id = setInterval(loadBadge, 30000);
    return () => clearInterval(id);
  }, [location.pathname]);

  const logout = () => {
    context?.windowWidth < 992 && context?.setisSidebarOpen(false)
    setSubmenuIndex(null)

    postData(`/api/user/logout`, {}).then(() => {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login")
    }).catch(() => {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login")
    })
  }


  const openClass = isOpen ? 'is-open' : 'is-closed';

  return (
    <>
      <div
        className={`sidebar sidebar-fixed ${openClass} border-r border-[rgba(255,255,255,0.1)] py-1.5 px-2`}
        aria-hidden={!isOpen}
      >
        <div
          className="sidebar-header flex-shrink-0 pb-2 w-full overflow-hidden"
          onClick={() => {
            context?.windowWidth < 992 && context?.setisSidebarOpen(false)
            setSubmenuIndex(null)
          }}
        >
          <Link to="/" className="block overflow-hidden max-w-full">
            <img
              src={localStorage.getItem('logo') || '/fav.png'}
              alt="Zuba"
              className="sidebar-logo-img"
            />
          </Link>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white leading-tight"
            style={{ backgroundColor: '#7c3aed' }}
          >
            App Control Panel
          </span>
        </div>

        <nav className="sidebar-nav flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        <ul className="mt-1 pb-2 space-y-0">
          <li className="px-2 pt-1 pb-0.5">
            <span className="sidebar-section-label">
              Overview
            </span>
          </li>
          <li>
            <Link to="/"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <RxDashboard className="text-[20px] text-[#efb291]" /> <span>Dashboard</span>
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/app-analytics"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)] border-l-[3px] border-transparent hover:border-[#e8a87c]">
                <IoAnalytics className="text-[20px] text-[#efb291]" /> <span>App Analytics</span>
              </Button>
            </Link>
          </li>

          <li className="px-2 pt-3 pb-0.5">
            <span className="sidebar-section-label">
              Users
            </span>
          </li>

          <li className="hidden">
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

          <li className="hidden">
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
                <FiUsers className="text-[20px] text-[#efb291]" /> <span>All Users</span>
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


          <li className="px-2 pt-3 pb-0.5">
            <span className="sidebar-section-label">
              Orders
            </span>
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

          <li className="hidden">
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


          <li className="hidden">
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


          <li className="px-2 pt-3 pb-0.5">
            <span className="sidebar-section-label">
              Engagement
            </span>
          </li>

          <li>
            <Link to="/notifications"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button
                className={`w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)] ${
                  location.pathname === '/notifications'
                    ? '!bg-[rgba(232,168,124,0.15)] !border-l-[3px] !border-[#e8a87c]'
                    : ''
                }`}
              >
                <Badge badgeContent={pushBadge} color="error" max={99} invisible={!pushBadge}>
                  <IoNotificationsOutline className="text-[20px] text-[#efb291]" />
                </Badge>
                <span>Push Notifications</span>
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/app-activity"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button
                className={`w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)] ${
                  location.pathname === '/app-activity'
                    ? '!bg-[rgba(232,168,124,0.15)] !border-l-[3px] !border-[#e8a87c]'
                    : ''
                }`}
              >
                <IoNotificationsOutline className="text-[20px] text-[#efb291]" />
                <span>App Activity</span>
              </Button>
            </Link>
          </li>

          <li className="px-2 pt-3 pb-0.5">
            <span className="sidebar-section-label">
              App Promotions
            </span>
          </li>

          <li>
            <Link to="/app-promotions"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <RiCoupon3Line className="text-[20px] text-[#efb291]" /> <span>App-Only Coupons</span>
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/app-gift-cards"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <RiGiftLine className="text-[20px] text-[#efb291]" /> <span>App Gift Cards</span>
              </Button>
            </Link>
          </li>

          <li className="hidden">
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={() => isOpenSubMenu(9)}
            >
              <IoNotificationsOutline className="text-[18px] text-[#efb291]" /> <span>Marketing</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${submenuIndex === 9 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={submenuIndex === 9 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/notifications"
                    onClick={() => {
                      context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                      setSubmenuIndex(null)
                    }}
                  >
                    <Button className="!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3">
                      <IoNotificationsOutline className="text-[14px] text-[#efb291]" />
                      Push Notifications
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li className="hidden">
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
                <li className="w-full hidden">
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

          <li className="px-2 pt-3 pb-0.5">
            <span className="sidebar-section-label">
              Settings
            </span>
          </li>

          <li>
            <Link to="/profile"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false)
                setSubmenuIndex(null)
              }}
            >
              <Button className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]">
                <FaRegUser className="text-[20px] text-[#efb291]" /> <span>Settings</span>
              </Button>
            </Link>
          </li>

        </ul>
        </nav>

        <div className="sidebar-footer flex-shrink-0 pt-1 border-t border-[rgba(255,255,255,0.12)]">
          <Button
            className="sidebar-link w-full !capitalize !justify-start !min-h-[32px] !py-1"
            onClick={logout}
          >
            <IoMdLogOut className="sidebar-icon text-[#efb291]" /> <span>Logout</span>
          </Button>
        </div>
      </div>


    </>
  );
};

export default Sidebar;
