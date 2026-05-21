import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";

import { RiMenu2Line } from "react-icons/ri";

import { FaRegBell } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from "../../App";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { fetchDataFromApi, postData } from "../../utils/api";
import {
  getAppActivityBadgeCount,
  APP_ACTIVITY_UPDATED_EVENT,
} from "../../utils/appActivityFeed";
import NotificationPanel from "./NotificationPanel";
import AddProductEnhanced from "../../Pages/Products/AddProductEnhanced";
import AddHomeSlide from "../../Pages/HomeSliderBanners/addHomeSlide";
import AddCategory from "../../Pages/Categegory/addCategory";
import AddSubCategory from "../../Pages/Categegory/addSubCategory";
import AddAddress from "../../Pages/Address/addAddress";
import EditCategory from "../../Pages/Categegory/editCategory";



import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IoMdClose } from "react-icons/io";
import Slide from '@mui/material/Slide';
import EditProductEnhanced from "../../Pages/Products/EditProductEnhanced";
import { AddBannerV1 } from "../../Pages/Banners/addBannerV1";
import { EditBannerV1 } from "../../Pages/Banners/editBannerV1";
import { BannerList2_AddBanner } from "../../Pages/Banners/bannerList2_AddBanner";
import { BannerList2_Edit_Banner } from "../../Pages/Banners/bannerList2_Edit_Banner";
import { AddResponsiveBanner } from "../../Pages/Banners/AddResponsiveBanner";
import { EditResponsiveBanner } from "../../Pages/Banners/EditResponsiveBanner";
import AddBlog from "../../Pages/Blog/addBlog";
import EditBlog from "../../Pages/Blog/editBlog";
import EditHomeSlide from "../../Pages/HomeSliderBanners/editHomeSlide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));


const Header = ({ sidebarOpen = false }) => {
  const location = useLocation();
  const history = useNavigate();
  const context = useContext(MyContext);

  const [anchorMyAcc, setAnchorMyAcc] = React.useState(null);
  const openMyAcc = Boolean(anchorMyAcc);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const notifOpen = Boolean(notifAnchor);

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  useEffect(() => {
    const loadBadge = async () => {
      setNotificationCount(await getAppActivityBadgeCount());
    };
    loadBadge();
    const onBadge = (e) => {
      if (typeof e?.detail?.count === 'number') {
        setNotificationCount(e.detail.count);
      } else {
        loadBadge();
      }
    };
    window.addEventListener(APP_ACTIVITY_UPDATED_EVENT, onBadge);
    window.addEventListener('admin-notification-badge', onBadge);
    const interval = setInterval(loadBadge, 60_000);
    return () => {
      window.removeEventListener(APP_ACTIVITY_UPDATED_EVENT, onBadge);
      window.removeEventListener('admin-notification-badge', onBadge);
      clearInterval(interval);
    };
  }, [location.pathname]);

  useEffect(() => {

    fetchDataFromApi("/api/logo").then((res) => {
      localStorage.setItem('logo', res?.logo[0]?.logo)
    })


    const token = localStorage.getItem('accessToken');

    if (token !== undefined && token !== null && token !== "") {
      const url = window.location.href
      history(location.pathname)
    } else {
      history("/login")
    }

  }, [context?.isLogin]);


  const logout = () => {
    setAnchorMyAcc(null);

    postData(`/api/user/logout`, {}).then(() => {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history("/login")
    }).catch(() => {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history("/login")
    })
  }

  return (
    <>
      <header
        className={`admin-header-bar w-full h-14 min-h-[3.5rem] py-1 pl-3 pr-3 sm:pr-4 shadow-md bg-[#fff] flex items-center justify-between fixed top-0 left-0 right-0 z-[53] transition-[padding] duration-200 ${
          sidebarOpen ? 'is-sidebar-open' : ''
        }`}
      >
        <div className="part1 flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          {(() => {
            const isMobile = (context?.windowWidth ?? 0) < 992;
            const showHeaderLogo =
              isMobile || context.isSidebarOpen === false;
            const logoSrc = localStorage.getItem('logo') || '/fav.png';
            if (!showHeaderLogo) return null;
            return (
              <Link
                to="/"
                className="admin-header-logo-link flex items-center shrink-0 overflow-hidden"
                onClick={() => {
                  if (isMobile) context?.setisSidebarOpen(false);
                }}
              >
                <img
                  src={logoSrc}
                  alt="Zuba House"
                  className="admin-header-logo"
                />
              </Link>
            );
          })()}

          <Button
            className="!w-[36px] !h-[36px] sm:!w-[40px] sm:!h-[40px] !rounded-full !min-w-[36px] shrink-0 !text-[rgba(0,0,0,0.8)]"
            onClick={() => context.setisSidebarOpen(!context.isSidebarOpen)}
            aria-label="Toggle menu"
          >
            <RiMenu2Line className="text-[18px] text-[rgba(0,0,0,0.8)]" />
          </Button>
        </div>

        <div className="part2 flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          <Tooltip title="App activity — signups, orders, deliveries">
            <IconButton
              aria-label="App activity notifications"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <StyledBadge
                badgeContent={notificationCount || 0}
                color="secondary"
                invisible={!notificationCount}
              >
                <FaRegBell />
              </StyledBadge>
            </IconButton>
          </Tooltip>
          <NotificationPanel
            anchorEl={notifAnchor}
            open={notifOpen}
            onClose={() => setNotifAnchor(null)}
          />

          {context.isLogin === true ? (
            <div className="relative flex items-center gap-2">
              <span
                className="hidden md:inline text-[10px] font-semibold px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                style={{ backgroundColor: '#7c3aed' }}
              >
                App Control Panel
              </span>
              <div
                className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer"
                onClick={handleClickMyAcc}
              >
                {
                  context?.userData?.avatar !== "" && context?.userData?.avatar !== null && context?.userData?.avatar !== undefined ?
                    <img
                      src={context?.userData?.avatar}
                      className="w-full h-full object-cover"
                    />

                    :

                    <img
                      src="/user.jpg"
                      className="w-full h-full object-cover"
                    />

                }

              </div>

              <Menu
                anchorEl={anchorMyAcc}
                id="account-menu"
                open={openMyAcc}
                onClose={handleCloseMyAcc}
                onClick={handleCloseMyAcc}
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
                <MenuItem onClick={handleCloseMyAcc} className="!bg-white">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer">
                      {
                        context?.userData?.avatar !== "" && context?.userData?.avatar !== null && context?.userData?.avatar !== undefined ?
                          <img
                            src={context?.userData?.avatar}
                            className="w-full h-full object-cover"
                          />

                          :

                          <img
                            src="/user.jpg"
                            className="w-full h-full object-cover"
                          />

                      }
                    </div>

                    <div className="info">
                      <h3 className="text-[15px] font-[500] leading-5">
                        {context?.userData?.name}
                      </h3>
                      <p className="text-[12px] font-[400] opacity-70">
                        {context?.userData?.email}
                      </p>
                    </div>
                  </div>
                </MenuItem>
                <Divider />

                <Link to="/profile">
                  <MenuItem
                    onClick={handleCloseMyAcc}
                    className="flex items-center gap-3"
                  >
                    <FaRegUser className="text-[16px]" />{" "}
                    <span className="text-[14px]">Profile</span>
                  </MenuItem>
                </Link>

                <MenuItem
                  onClick={logout}
                  className="flex items-center gap-3"
                >
                  <IoMdLogOut className="text-[18px]" />{" "}
                  <span className="text-[14px]">Sign Out</span>
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Link to="/login">
              <Button className="btn-blue btn-sm !rounded-full">Sign In</Button>
            </Link>
          )}
        </div>
      </header>





      <Dialog
        fullScreen
        open={context?.isOpenFullScreenPanel.open}
        onClose={() => context?.setIsOpenFullScreenPanel({
          open: false
        })}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => context?.setIsOpenFullScreenPanel({
                open: false
              })}
              aria-label="close"
            >
              <IoMdClose className="text-gray-800" />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              <span className="text-gray-800">{context?.isOpenFullScreenPanel?.model}</span>
            </Typography>

          </Toolbar>
        </AppBar>


        {
          context?.isOpenFullScreenPanel?.model === "Add Product" && <AddProductEnhanced />
        }


        {
          context?.isOpenFullScreenPanel?.model === "Add Home Slide" && <AddHomeSlide />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Edit Home Slide" && <EditHomeSlide />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Add New Category" && <AddCategory />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Add New Sub Category" && <AddSubCategory />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Add New Address" && <AddAddress />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Edit Category" && <EditCategory />
        }


        {
          context?.isOpenFullScreenPanel?.model === "Edit Product" && <EditProductEnhanced />
        }


        {
          context?.isOpenFullScreenPanel?.model === "Add Home Banner List 1" && <AddBannerV1 />
        }


        {
          context?.isOpenFullScreenPanel?.model === "Edit BannerV1" && <EditBannerV1 />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Add Home Banner List2" && <BannerList2_AddBanner />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Edit bannerList2" && <BannerList2_Edit_Banner />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Add Responsive Banner" && <AddResponsiveBanner />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Edit Responsive Banner" && <EditResponsiveBanner />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Add Blog" && <AddBlog />
        }

        {
          context?.isOpenFullScreenPanel?.model === "Edit Blog" && <EditBlog />
        }


      </Dialog>

    </>
  );
};

export default Header;
