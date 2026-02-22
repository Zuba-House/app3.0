import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Search from "../Search";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IoGitCompareOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa6";
import Tooltip from "@mui/material/Tooltip";
import Navigation from "./Navigation";
import { MyContext } from "../../App";
import { Button } from "@mui/material";
import { FaRegUser } from "react-icons/fa";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { fetchDataFromApi } from "../../utils/api";
import { LuMapPin } from "react-icons/lu";
import { useEffect } from "react";
import { HiOutlineMenu } from "react-icons/hi";


const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);

  const context = useContext(MyContext);

  const history = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  const location = useLocation();

  const protectedRoutes = [
    "/my-account",
    "/my-orders",
    "/my-list",
    "/checkout",
    "/order",
    "/address"
    // Note: "/cart" is NOT protected - guests can add items to cart
  ];

  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      if (res?.logo?.[0]?.logo) {
        localStorage.setItem('logo', res?.logo?.[0]?.logo)
      }
    })
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const isProtectedRoute = protectedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (!token && isProtectedRoute) {
      history("/login")
    }
  }, [context?.isLogin, location.pathname]);

  const logout = () => {
    setAnchorEl(null);

    // Always clear local state first to prevent stuck state
    const clearLocalState = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      context.setIsLogin(false);
      context.setUserData(null);
      context?.setCartData([]);
      context?.setMyListData([]);
      history("/");
    };

    // Try to call logout API, but always clear local state regardless
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true })
      .then((res) => {
        clearLocalState();
      })
      .catch((error) => {
        console.log('Logout API error (proceeding with local logout):', error);
        clearLocalState();
      });
  }

  return (
    <>
      <header className="bg-[#0b2735] fixed lg:sticky left-0 w-full top-0 lg:-top-[47px] z-[101]">
        <div className="top-strip hidden lg:block py-2 border-t-[1px] border-[rgba(229,226,219,0.2)] border-b-[1px]">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="col1 w-[50%] hidden lg:block">
                <p className="text-[12px] font-[500] mt-0 mb-0 text-[#e5e2db]">
                  Get up to 50% off new season styles, limited time only
                </p>
              </div>

              <div className="col2 flex items-center justify-between w-full lg:w-[50%] lg:justify-end">
                <ul className="flex items-center gap-3 w-full justify-between lg:w-[200px]">
                  <li className="list-none">
                    <Link
                      to="/help-center"
                      className="text-[11px] lg:text-[13px] link font-[500] transition text-[#e5e2db] hover:text-[#efb291]"
                    >
                      Help Center{" "}
                    </Link>
                  </li>
                  <li className="list-none">
                    <Link
                      to="/order-tracking"
                      className="text-[11px] lg:text-[13px] link font-[500] transition text-[#e5e2db] hover:text-[#efb291]"
                    >
                      Order Tracking
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="header py-2 lg:py-4 border-b-[1px] border-[rgba(229,226,219,0.2)]">
          <div className="container flex items-center justify-between">
            {
              context?.windowWidth < 992 &&
              <Button className="!w-[44px] !min-w-[44px] !h-[44px] !rounded-full !text-[#e5e2db] hover:!text-[#efb291] !p-0 !flex !items-center !justify-center" onClick={() => setIsOpenCatPanel(true)}>
                <HiOutlineMenu size={24} />
              </Button>
            }

            <div className="col1 w-[40%] lg:w-[25%] flex items-center">
              <Link to={"/"} className="flex items-center">
                <img 
                  src={localStorage.getItem('logo') || '/logo.png'} 
                  className="max-w-[140px] lg:max-w-[200px] max-h-[60px] lg:max-h-[80px] object-contain" 
                  alt="Zuba House Logo"
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              </Link>
            </div>

            <div className={`col2 fixed top-0 left-0 w-full h-full lg:w-[40%] lg:static p-2 lg:p-0 bg-[#0b2735] lg:bg-transparent z-50 ${context?.windowWidth > 992 && '!block'} ${context?.openSearchPanel === true ? 'block' : 'hidden'}`}>
              <Search />
            </div>

            <div className="col3 w-auto lg:w-[30%] flex items-center pl-2 lg:pl-7">
              <ul className="flex items-center justify-end gap-2 lg:gap-3 w-full">
                {context.isLogin === false && context?.windowWidth > 992 ? (
                  <li className="list-none">
                    <Link
                      to="/login"
                      className="link transition text-[15px] font-[500] text-[#e5e2db] hover:text-[#efb291]"
                    >
                      Login
                    </Link>{" "}
                    <span className="text-[#e5e2db]">|</span> &nbsp;
                    <Link
                      to="/register"
                      className="link transition text-[15px] font-[500] text-[#e5e2db] hover:text-[#efb291]"
                    >
                      Register
                    </Link>
                  </li>
                ) : (
                  <>
                    {
                      context?.windowWidth > 992 &&
                      <li>
                        <Button
                          className="!text-[#e5e2db] myAccountWrap flex items-center gap-3 cursor-pointer hover:!text-[#efb291]"
                          onClick={handleClick}
                        >
                          <Button className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !bg-[rgba(229,226,219,0.15)]">
                            <FaRegUser className="text-[17px] text-[#e5e2db]" />
                          </Button>

                          {
                            context?.windowWidth > 992 &&
                            <div className="info flex flex-col">
                              <h4 className="leading-3 text-[14px] text-[#e5e2db] font-[500] mb-0 capitalize text-left justify-start">
                                {context?.userData?.name}
                              </h4>
                              <span className="text-[13px] text-[rgba(229,226,219,0.8)] font-[400] capitalize text-left justify-start">
                                {context?.userData?.email}
                              </span>
                            </div>
                          }

                        </Button>

                        <Menu
                          anchorEl={anchorEl}
                          id="account-menu"
                          open={open}
                          onClose={handleClose}
                          onClick={handleClose}
                          slotProps={{
                            paper: {
                              elevation: 0,
                              sx: {
                                overflow: "visible",
                                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                mt: 1.5,
                                "& .MuiAvatar-root": {
                                  width: 32,
                                  height: 32,
                                  ml: -0.5,
                                  mr: 1,
                                },
                                "&::before": {
                                  content: '""',
                                  display: "block",
                                  position: "absolute",
                                  top: 0,
                                  right: 14,
                                  width: 10,
                                  height: 10,
                                  bgcolor: "background.paper",
                                  transform: "translateY(-50%) rotate(45deg)",
                                  zIndex: 0,
                                },
                              },
                            },
                          }}
                          transformOrigin={{ horizontal: "right", vertical: "top" }}
                          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        >
                          <Link to="/my-account" className="w-full block">
                            <MenuItem
                              onClick={handleClose}
                              className="flex gap-2 ! !py-2 hover:!text-[#efb291]"
                            >
                              <FaRegUser className="text-[18px]" />{" "}
                              <span className="text-[14px]">My Account</span>
                            </MenuItem>
                          </Link>
                          <Link to="/address" className="w-full block">
                            <MenuItem
                              onClick={handleClose}
                              className="flex gap-2 ! !py-2 hover:!text-[#efb291]"
                            >
                              <LuMapPin className="text-[18px]" />{" "}
                              <span className="text-[14px]">Address</span>
                            </MenuItem>
                          </Link>
                          <Link to="/my-orders" className="w-full block">
                            <MenuItem
                              onClick={handleClose}
                              className="flex gap-2 ! !py-2 hover:!text-[#efb291]"
                            >
                              <IoBagCheckOutline className="text-[18px]" />{" "}
                              <span className="text-[14px]">Orders</span>
                            </MenuItem>
                          </Link>
                          <Link to="/my-list" className="w-full block">
                            <MenuItem
                              onClick={handleClose}
                              className="flex gap-2 ! !py-2 hover:!text-[#efb291]"
                            >
                              <IoMdHeartEmpty className="text-[18px]" />{" "}
                              <span className="text-[14px]">My List</span>
                            </MenuItem>
                          </Link>

                          <MenuItem
                            onClick={logout}
                            className="flex gap-2 ! !py-2 hover:!text-[#efb291]"
                          >
                            <IoIosLogOut className="text-[18px]" />{" "}
                            <span className="text-[14px]">Logout</span>
                          </MenuItem>
                        </Menu>
                      </li>
                    }

                  </>
                )}


                {
                  context?.windowWidth > 992 &&
                  <li>
                    <Tooltip title="Wishlist">
                      <Link to="/my-list">
                        <IconButton aria-label="cart" className="hover:!text-[#efb291]">
                          <StyledBadge badgeContent={context?.myListData?.length !== 0 ? context?.myListData?.length : 0} color="secondary">
                            <FaRegHeart className="text-[#e5e2db]" />
                          </StyledBadge>
                        </IconButton>
                      </Link>
                    </Tooltip>
                  </li>

                }


                <li className="list-none">
                  <Tooltip title="Cart">
                    <IconButton
                      aria-label="cart"
                      onClick={() => context.setOpenCartPanel(true)}
                      className="hover:!text-[#efb291] !w-[44px] !min-w-[44px] !h-[44px] lg:!w-auto lg:!h-auto"
                      sx={{
                        '@media (max-width: 992px)': {
                          minWidth: '44px',
                          minHeight: '44px',
                          width: '44px',
                          height: '44px',
                          padding: '8px'
                        }
                      }}
                    >
                      <StyledBadge badgeContent={context?.cartData?.length !== 0 ? context?.cartData?.length : 0} color="secondary">
                        <MdOutlineShoppingCart className="text-[#e5e2db] text-[20px] lg:text-[24px]" />
                      </StyledBadge>
                    </IconButton>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Navigation isOpenCatPanel={isOpenCatPanel} setIsOpenCatPanel={setIsOpenCatPanel} />
      </header>


      <div className="afterHeader mt-[115px] lg:mt-0"></div>

    </>
  );
};

export default Header;
