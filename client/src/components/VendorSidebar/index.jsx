import { Button } from "@mui/material";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { RiProductHuntLine } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { FaMoneyBillWave, FaChartLine, FaCog, FaStore } from "react-icons/fa";
import { fetchDataFromApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const VendorSidebar = ({ isOpen, setIsOpen }) => {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetchDataFromApi(`/api/user/logout?token=${token}`, { withCredentials: true });
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  const menuItems = [
    {
      path: "/vendor/dashboard",
      icon: <RxDashboard className="text-[18px] text-[#efb291]" />,
      label: "Dashboard"
    },
    {
      path: "/vendor/products",
      icon: <RiProductHuntLine className="text-[18px] text-[#efb291]" />,
      label: "Products",
      submenu: [
        { path: "/vendor/products", label: "All Products" },
        { path: "/vendor/products/add", label: "Add Product" }
      ]
    },
    {
      path: "/vendor/orders",
      icon: <IoBagCheckOutline className="text-[18px] text-[#efb291]" />,
      label: "Orders"
    },
    {
      path: "/vendor/earnings",
      icon: <FaMoneyBillWave className="text-[18px] text-[#efb291]" />,
      label: "Earnings"
    },
    {
      path: "/vendor/analytics",
      icon: <FaChartLine className="text-[18px] text-[#efb291]" />,
      label: "Analytics"
    },
    {
      path: "/vendor/settings",
      icon: <FaCog className="text-[18px] text-[#efb291]" />,
      label: "Settings"
    }
  ];

  return (
    <>
      <div 
        className={`sidebar fixed top-0 left-0 z-[52] h-full border-r border-[rgba(255,255,255,0.1)] py-2 px-4 transition-all duration-300 ${
          isOpen ? 'w-[20%] opacity-100 visible' : 'w-0 opacity-0 invisible'
        }`}
        style={{ backgroundColor: '#0b2735' }}
      >
        <div 
          className="py-2 w-full"
          onClick={() => {
            if (window.innerWidth < 992) {
              setIsOpen(false);
              setSubmenuIndex(null);
            }
          }}
        >
          <Link to="/vendor/dashboard">
            <div className="flex items-center gap-2">
              <FaStore className="text-2xl text-[#efb291]" />
              <span className="text-white font-bold text-xl">Vendor Portal</span>
            </div>
          </Link>
        </div>

        <ul className="mt-4 overflow-y-scroll max-h-[80vh]">
          {menuItems.map((item, index) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isActive = location.pathname === item.path || 
              (item.submenu && item.submenu.some(sub => location.pathname === sub.path));

            if (hasSubmenu) {
              return (
                <li key={index}>
                  <Button
                    className={`w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)] ${
                      isActive ? '!bg-[rgba(239,178,145,0.2)]' : ''
                    }`}
                    onClick={() => isOpenSubMenu(index)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                      <FaAngleDown
                        className={`transition-all ${submenuIndex === index ? "rotate-180" : ""}`}
                      />
                    </span>
                  </Button>

                  <Collapse isOpened={submenuIndex === index ? true : false}>
                    <ul className="w-full">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex} className="w-full">
                          <Link
                            to={subItem.path}
                            onClick={() => {
                              if (window.innerWidth < 992) {
                                setIsOpen(false);
                                setSubmenuIndex(null);
                              }
                            }}
                          >
                            <Button
                              className={`!text-[rgba(255,255,255,0.75)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 ${
                                location.pathname === subItem.path ? '!text-[#efb291]' : ''
                              }`}
                            >
                              <span className="block w-[5px] h-[5px] rounded-full bg-[#efb291]"></span>
                              {subItem.label}
                            </Button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                </li>
              );
            }

            return (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 992) {
                      setIsOpen(false);
                      setSubmenuIndex(null);
                    }
                  }}
                >
                  <Button
                    className={`w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)] ${
                      isActive ? '!bg-[rgba(239,178,145,0.2)]' : ''
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              </li>
            );
          })}

          <li className="mt-4">
            <Button
              className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-[rgba(255,255,255,0.9)] !font-[500] items-center !py-2 hover:!bg-[rgba(255,255,255,0.1)]"
              onClick={logout}
            >
              <IoMdLogOut className="text-[18px] text-[#efb291]" />
              <span>Logout</span>
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default VendorSidebar;

