import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { RiMenu2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";

const VendorHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const openMyAcc = Boolean(anchorMyAcc);

  useEffect(() => {
    // Fetch user data
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetchDataFromApi('/api/user/getUserDetails');
      if (response?.user) {
        setUserData(response.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };

  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const logout = async () => {
    handleCloseMyAcc();
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

  return (
    <div
      className="header fixed top-0 right-0 z-[51] h-[70px] flex items-center justify-between px-5 border-b border-[rgba(255,255,255,0.1)]"
      style={{ 
        backgroundColor: '#0b2735',
        width: isSidebarOpen ? '80%' : '100%',
        left: isSidebarOpen ? '20%' : '0',
        transition: 'all 0.3s'
      }}
    >
      <div className="flex items-center gap-4">
        <IconButton
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="!text-white"
        >
          <RiMenu2Line className="text-2xl" />
        </IconButton>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleClickMyAcc}
          className="!text-white !capitalize flex items-center gap-2"
        >
          <FaRegUser className="text-xl" />
          <span className="hidden md:block">{userData?.name || 'Vendor'}</span>
        </Button>

        <Menu
          anchorEl={anchorMyAcc}
          open={openMyAcc}
          onClose={handleCloseMyAcc}
          PaperProps={{
            style: {
              backgroundColor: '#1a3d52',
              color: '#e5e2db',
              border: '1px solid rgba(239, 178, 145, 0.2)'
            }
          }}
        >
          <MenuItem onClick={() => { navigate('/vendor/settings'); handleCloseMyAcc(); }}>
            <FaRegUser className="mr-2" /> Profile Settings
          </MenuItem>
          <MenuItem onClick={logout}>
            <IoMdLogOut className="mr-2" /> Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default VendorHeader;

