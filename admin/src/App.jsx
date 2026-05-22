import "./App.css";
import "./responsive.css";
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useParams } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import { createContext, useState } from "react";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Products from "./Pages/Products";
import ErrorBoundary from "./Components/ErrorBoundary";

import HomeSliderBanners from "./Pages/HomeSliderBanners";
import CategoryList from "./Pages/Categegory";
import SubCategoryList from "./Pages/Categegory/subCatList";
import Users from "./Pages/Users";
import Vendors from "./Pages/Vendors";
import VendorProducts from "./Pages/VendorProducts";
import Orders from "./Pages/Orders";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyAccount from "./Pages/VerifyAccount";
import ChangePassword from "./Pages/ChangePassword";

import toast, { Toaster } from 'react-hot-toast';
import { fetchDataFromApi } from "./utils/api";
import { getUserFromApiResponse } from "./utils/apiResponse";
import { useEffect } from "react";
import Profile from "./Pages/Profile";
import ProductDetails from "./Pages/Products/productDetails";
import AddProductEnhanced from "./Pages/Products/AddProductEnhanced";
import VariationsManager from "./Pages/Products/VariationsManager";
import BannerV1List from "./Pages/Banners/bannerV1List";
import { BannerList2 } from "./Pages/Banners/bannerList2";
import ResponsiveBannerManager from "./Pages/Banners/ResponsiveBannerManager";
import { BlogList } from "./Pages/Blog";
import LoadingBar from "react-top-loading-bar";
import NotFound from "./Pages/NotFound";

// Promotions
import CouponsList from "./Pages/Coupons";
import AddCoupon from "./Pages/Coupons/addCoupon";
import EditCoupon from "./Pages/Coupons/editCoupon";
import AppGiftCards from "./Pages/AppGiftCards";
import AddGiftCard from "./Pages/GiftCards/addGiftCard";
import EditGiftCard from "./Pages/GiftCards/editGiftCard";

const GiftCardEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app-gift-cards/edit/${id}`} replace />;
};

import { buildAdminRoute } from "./utils/buildAdminRoute";
import Unauthorized from "./Pages/Unauthorized";
import Notifications from "./Pages/Notifications";
import AppActivity from "./Pages/AppActivity";
import AppAnalytics from "./Pages/AppAnalytics";
import AppPromotions from "./Pages/AppPromotions";

const MyContext = createContext();

const VariationsManagerWrapper = () => {
  const { id } = useParams();
  return <VariationsManager productId={id} />;
}

function App() {
  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState([]);
  const [catData, setCatData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarWidth, setSidebarWidth] = useState(18);

  const [progress, setProgress] = useState(0);


  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = useState({
    open: false,
    id: ""
  });


  useEffect(() => {
    localStorage.removeItem("userEmail")
    if (windowWidth < 992) {
      setisSidebarOpen(false);
      setSidebarWidth(100)
    } else {
      setSidebarWidth(18)
    }
  }, [windowWidth])


  // useEffect(() => {
  //   if (userData?.role !== "ADMIN") {
  //     const handleContextmenu = e => {
  //       e.preventDefault()
  //     }
  //     document.addEventListener('contextmenu', handleContextmenu)
  //     return function cleanup() {
  //       document.removeEventListener('contextmenu', handleContextmenu)
  //     }
  //   }
  // }, [userData])

  const router = createBrowserRouter([
    {
      path: "/",
      exact: true,
      element: buildAdminRoute(Dashboard),
    },
    {
      path: "/login",
      exact: true,
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/sign-up",
      exact: true,
      element: (
        <>
          <SignUp />
        </>
      ),
    },
    {
      path: "/forgot-password",
      exact: true,
      element: (
        <>
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/verify-account",
      exact: true,
      element: (
        <>
          <VerifyAccount />
        </>
      ),
    },
    {
      path: "/change-password",
      exact: true,
      element: (
        <>
          <ChangePassword />
        </>
      ),
    },
    {
      path: "/products",
      exact: true,
      element: buildAdminRoute(Products),
    },
    {
      path: "/add-product-enhanced",
      exact: true,
      element: buildAdminRoute(AddProductEnhanced, { contentClass: '' }),
    },
    {
      path: "/homeSlider/list",
      exact: true,
      element: buildAdminRoute(HomeSliderBanners, { contentWidth: '82%' }),
    },
    {
      path: "/category/list",
      exact: true,
      element: buildAdminRoute(CategoryList),
    },
    {
      path: "/subCategory/list",
      exact: true,
      element: buildAdminRoute(SubCategoryList),
    },
    {
      path: "/users",
      exact: true,
      element: buildAdminRoute(Users),
    },
    {
      path: "/vendors",
      exact: true,
      element: buildAdminRoute(Vendors),
    },
    {
      path: "/vendor-products",
      exact: true,
      element: buildAdminRoute(VendorProducts),
    },
    {
      path: "/orders",
      exact: true,
      element: buildAdminRoute(Orders),
    },
    // Coupons Routes
    {
      path: "/coupons",
      exact: true,
      element: buildAdminRoute(CouponsList),
    },
    {
      path: "/coupons/add",
      exact: true,
      element: buildAdminRoute(AddCoupon),
    },
    {
      path: "/coupons/edit/:id",
      exact: true,
      element: buildAdminRoute(EditCoupon),
    },
    // App gift cards (primary)
    {
      path: "/app-gift-cards",
      exact: true,
      element: buildAdminRoute(AppGiftCards),
    },
    {
      path: "/app-gift-cards/add",
      exact: true,
      element: buildAdminRoute(AddGiftCard),
    },
    {
      path: "/app-gift-cards/edit/:id",
      exact: true,
      element: buildAdminRoute(EditGiftCard),
    },
    // Legacy URLs → app gift cards
    {
      path: "/gift-cards",
      element: <Navigate to="/app-gift-cards" replace />,
    },
    {
      path: "/gift-cards/add",
      element: <Navigate to="/app-gift-cards/add" replace />,
    },
    {
      path: "/gift-cards/edit/:id",
      element: <GiftCardEditRedirect />,
    },
    {
      path: "/profile",
      exact: true,
      element: buildAdminRoute(Profile),
    },
    {
      path: "/product/:id",
      exact: true,
      element: buildAdminRoute(ProductDetails),
    },
    {
      path: "/product/:id/variations",
      exact: true,
      element: buildAdminRoute(VariationsManagerWrapper),
    },

    {
      path: "/bannerV1/list",
      exact: true,
      element: buildAdminRoute(BannerV1List),
    },
    {
      path: "/bannerlist2/List",
      exact: true,
      element: buildAdminRoute(BannerList2),
    },
    {
      path: "/banners/responsive",
      exact: true,
      element: buildAdminRoute(ResponsiveBannerManager),
    },
    {
      path: "/blog/List",
      exact: true,
      element: buildAdminRoute(BlogList),
    },
    {
      path: "/notifications",
      exact: true,
      element: buildAdminRoute(Notifications),
    },
    {
      path: "/app-activity",
      exact: true,
      element: buildAdminRoute(AppActivity),
    },
    {
      path: "/app-analytics",
      exact: true,
      element: buildAdminRoute(AppAnalytics),
    },
    {
      path: "/app-promotions",
      exact: true,
      element: buildAdminRoute(AppPromotions),
    },
    {
      path: "/unauthorized",
      exact: true,
      element: <Unauthorized />,
    },
  ]);

  const alertBox = (type, msg) => {
    if (type === "success") {
      toast.success(msg)
    }
    if (type === "error") {
      toast.error(msg)
    }
  }


  useEffect(() => {

    const token = localStorage.getItem('accessToken');

    if (token !== undefined && token !== null && token !== "") {
      setIsLogin(true);

      fetchDataFromApi(`/api/user/user-details`).then((res) => {
        const user = getUserFromApiResponse(res);
        if (user) setUserData(user);
        if (res?.response?.data?.message === "You have not login") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLogin(false);
          alertBox("error", "Your session is closed please login again")

          //window.location.href = "/login"
        }
      })

    } else {
      setIsLogin(false);
    }

  }, [isLogin])


  useEffect(() => {
    getCat();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, [])


  const getCat = () => {
    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res?.data)
    })
  }


  const values = {
    isSidebarOpen,
    setisSidebarOpen,
    isLogin,
    setIsLogin,
    isOpenFullScreenPanel,
    setIsOpenFullScreenPanel,
    alertBox,
    setUserData,
    userData,
    setAddress,
    address,
    catData,
    setCatData,
    getCat,
    windowWidth,
    setSidebarWidth,
    sidebarWidth,
    setProgress,
    progress
  };

  return (
    <ErrorBoundary>
      <MyContext.Provider value={values}>
        <RouterProvider router={router} />
        <LoadingBar
          color="#1565c0"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
          className="topLoadingBar"
          height={3}
        />
        <Toaster />
      </MyContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
export { MyContext };
