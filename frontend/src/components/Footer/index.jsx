import React, { useContext } from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { LiaGiftSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";
import Newsletter from "../Newsletter";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import Drawer from "@mui/material/Drawer";
import CartPanel from "../CartPanel";
import { MyContext } from "../../App";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { ProductZoom } from "../ProductZoom";
import { IoCloseSharp } from "react-icons/io5";
import { ProductDetailsComponent } from "../ProductDetails";
import AddAddress from "../../Pages/MyAccount/addAddress";


const Footer = () => {
  const context = useContext(MyContext);

  return (
    <>
      <footer className="py-6 bg-[#0b2735]">
        <div className="container">
          {/* ZeroX Intelligence: Made feature boxes responsive - wraps to 2 columns on tablet, stacks on mobile */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-2 py-3 lg:py-8 pb-0 lg:pb-8 px-2 sm:px-3 lg:px-5 scrollableBox footerBoxWrap">
            {/* ZeroX Intelligence: Added responsive width - full width on mobile, 45% on tablet, 15% on desktop */}
            <div className="col flex items-center justify-center flex-col group w-full sm:w-[45%] md:w-[30%] lg:w-[15%] mb-4 lg:mb-0">
              {/* ZeroX Intelligence: Made icon size responsive */}
              <LiaShippingFastSolid className="text-[30px] sm:text-[35px] lg:text-[40px] text-[#e5e2db] transition-all duration-300 group-hover:text-[#efb291] group-hover:-translate-y-1" />
              {/* ZeroX Intelligence: Made heading responsive */}
              <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] mt-2 lg:mt-3 text-[#e5e2db] text-center">Free Shipping</h3>
              {/* ZeroX Intelligence: Made description responsive and centered */}
              <p className="text-[11px] sm:text-[12px] font-[500] text-[#e5e2db] text-center">For all Orders Over $100</p>
            </div>

            {/* ZeroX Intelligence: Same responsive pattern for all feature boxes */}
            <div className="col flex items-center justify-center flex-col group w-full sm:w-[45%] md:w-[30%] lg:w-[15%] mb-4 lg:mb-0">
              <PiKeyReturnLight className="text-[30px] sm:text-[35px] lg:text-[40px] text-[#e5e2db] transition-all duration-300 group-hover:text-[#efb291] group-hover:-translate-y-1" />
              <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] mt-2 lg:mt-3 text-[#e5e2db] text-center">30 Days Returns</h3>
              <p className="text-[11px] sm:text-[12px] font-[500] text-[#e5e2db] text-center">For an Exchange Product</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-full sm:w-[45%] md:w-[30%] lg:w-[15%] mb-4 lg:mb-0">
              <BsWallet2 className="text-[30px] sm:text-[35px] lg:text-[40px] text-[#e5e2db] transition-all duration-300 group-hover:text-[#efb291] group-hover:-translate-y-1" />
              <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] mt-2 lg:mt-3 text-[#e5e2db] text-center">Secured Payment</h3>
              <p className="text-[11px] sm:text-[12px] font-[500] text-[#e5e2db] text-center">Payment Cards Accepted</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-full sm:w-[45%] md:w-[30%] lg:w-[15%] mb-4 lg:mb-0">
              <LiaGiftSolid className="text-[30px] sm:text-[35px] lg:text-[40px] text-[#e5e2db] transition-all duration-300 group-hover:text-[#efb291] group-hover:-translate-y-1" />
              <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] mt-2 lg:mt-3 text-[#e5e2db] text-center">Special Gifts</h3>
              <p className="text-[11px] sm:text-[12px] font-[500] text-[#e5e2db] text-center">Our First Product Order</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-full sm:w-[45%] md:w-[30%] lg:w-[15%] mb-4 lg:mb-0">
              <BiSupport className="text-[30px] sm:text-[35px] lg:text-[40px] text-[#e5e2db] transition-all duration-300 group-hover:text-[#efb291] group-hover:-translate-y-1" />
              <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] mt-2 lg:mt-3 text-[#e5e2db] text-center">Support 24/7</h3>
              <p className="text-[11px] sm:text-[12px] font-[500] text-[#e5e2db] text-center">Contact us Anytime</p>
            </div>
          </div>
          <br />

          <hr className="border-[rgba(229,226,219,0.2)]" />

          {/* ZeroX Intelligence: UPDATED - Main footer sections with new links from old Zuba footer */}
          <div className="footer flex px-3 lg:px-0 flex-col lg:flex-row py-8 gap-6 lg:gap-0">
            
            {/* ZeroX Intelligence: Column 1 - Quick Links */}
            <div className="part1 w-full lg:w-[25%] lg:border-r border-[rgba(229,226,219,0.2)] pb-6 lg:pb-0 border-b lg:border-b-0 lg:pr-6">
              <h2 className="text-[16px] sm:text-[17px] lg:text-[18px] font-[600] mb-3 lg:mb-4 text-[#efb291] border-b-2 border-[#efb291] pb-2 inline-block">Quick Links</h2>
              <ul className="list mt-4">
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/about" className="link text-[#e5e2db] hover:text-[#efb291]">
                    About Zuba House
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/products" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Shop
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/faq" className="link text-[#e5e2db] hover:text-[#efb291]">
                    FAQs
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/careers" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Careers
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  
                </li>
              </ul>
            </div>

            {/* ZeroX Intelligence: Column 2 - Customer Service */}
            <div className="part2 w-full lg:w-[25%] lg:border-r border-[rgba(229,226,219,0.2)] pb-6 lg:pb-0 border-b lg:border-b-0 lg:px-6">
              <h2 className="text-[16px] sm:text-[17px] lg:text-[18px] font-[600] mb-3 lg:mb-4 text-[#efb291] border-b-2 border-[#efb291] pb-2 inline-block">Customer Service</h2>
              <ul className="list mt-4">
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/return-refund-policy" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Return & Refund Policy
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/order-tracking" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Order Tracking
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/shipping-info" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Shipping Info
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/download-app" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Download App
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/report-suspicious-activity" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Report Suspicious Activity
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/investors" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Investors
                  </Link>
                </li>
              </ul>
            </div>

            {/* ZeroX Intelligence: Column 3 - Help */}
            <div className="part3 w-full lg:w-[25%] lg:border-r border-[rgba(229,226,219,0.2)] pb-6 lg:pb-0 border-b lg:border-b-0 lg:px-6">
              <h2 className="text-[16px] sm:text-[17px] lg:text-[18px] font-[600] mb-3 lg:mb-4 text-[#efb291] border-b-2 border-[#efb291] pb-2 inline-block">Help</h2>
              <ul className="list mt-4">
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/help-center" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Support Center & FAQ
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/sitemap" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Sitemap
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/how-to-order" className="link text-[#e5e2db] hover:text-[#efb291]">
                    How to Order
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/how-to-track" className="link text-[#e5e2db] hover:text-[#efb291]">
                    How to Track
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/partner-with-us" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Partner with Us
                  </Link>
                </li>
                <li className="list-none text-[13px] sm:text-[14px] w-full mb-2">
                  <Link to="/delete-account" className="link text-[#e5e2db] hover:text-[#efb291]">
                    Delete My Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* ZeroX Intelligence: Column 4 - Get Started + Newsletter */}
            <div className="part4 w-full lg:w-[25%] flex pl-0 lg:pl-8 flex-col pr-0 lg:pr-0">
              <h2 className="text-[16px] sm:text-[17px] lg:text-[18px] font-[600] mb-3 lg:mb-4 text-[#efb291] border-b-2 border-[#efb291] pb-2 inline-block">Get Started</h2>
              
              {/* Start Selling Button */}
              <div className="mb-5">
                <a 
                  href="https://vendor.zubahouse.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#efb291] text-[#0b2735] px-6 py-3 rounded-lg font-[600] transition-all hover:bg-[#e5a67d] hover:shadow-lg"
                >
                  Start Selling to Millions
                </a>
                <div className="mt-3">
                  <a
                    href="https://vendor.zubahouse.com/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e5e2db] hover:text-[#efb291] text-sm font-medium transition-colors"
                  >
                    Seller Login →
                  </a>
                </div>
              </div>

              {/* Newsletter Section */}
              <Newsletter />
            </div>
          </div>

          {/* ZeroX Intelligence: Features Banner */}
          <div className="bg-[rgba(239,178,145,0.1)] border border-[rgba(239,178,145,0.2)] rounded-xl p-5 mt-8 mb-8">
            <div className="flex flex-wrap justify-center gap-4 text-[12px] sm:text-[13px] text-[#e5e2db]">
              <span className="flex items-center gap-2">
                <span className="text-[#efb291]">🔔</span> Price-drop alerts
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#efb291]">📦</span> Track orders
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#efb291]">⚡</span> Faster checkout
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#efb291]">🛒</span> Low stock alerts
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#efb291]">🎁</span> Exclusive offers
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#efb291]">🏷️</span> Coupons & Deals
              </span>
            </div>
          </div>

          {/* ZeroX Intelligence: UPDATED - Bottom strip now matches footer background #0b2735 */}
          <hr className="border-[rgba(229,226,219,0.2)] mb-8" />

          {/* Social Media & Trust Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Social Media */}
            <div className="text-center">
              <h4 className="text-[#efb291] font-[600] mb-4 text-[14px]">Connect with Zuba</h4>
              <ul className="flex items-center justify-center gap-3">
                <li className="list-none">
                  <a
                    href="https://www.instagram.com/zuba_house/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[35px] h-[35px] rounded-full border border-[rgba(229,226,219,0.3)] flex items-center justify-center group hover:bg-[#efb291] transition-all"
                  >
                    <FaInstagram className="text-[17px] text-[#e5e2db] group-hover:text-[#0b2735]" />
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="https://www.facebook.com/p/Zuba-House-61559578310001/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[35px] h-[35px] rounded-full border border-[rgba(229,226,219,0.3)] flex items-center justify-center group hover:bg-[#efb291] transition-all"
                  >
                    <FaFacebookF className="text-[17px] text-[#e5e2db] group-hover:text-[#0b2735]" />
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="https://x.com/ZubaInfo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[35px] h-[35px] rounded-full border border-[rgba(229,226,219,0.3)] flex items-center justify-center group hover:bg-[#efb291] transition-all"
                  >
                    <FaXTwitter className="text-[17px] text-[#e5e2db] group-hover:text-[#0b2735]" />
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="https://www.tiktok.com/@zubahouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[35px] h-[35px] rounded-full border border-[rgba(229,226,219,0.3)] flex items-center justify-center group hover:bg-[#efb291] transition-all"
                  >
                    <FaTiktok className="text-[17px] text-[#e5e2db] group-hover:text-[#0b2735]" />
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="https://ca.linkedin.com/company/zuba-house"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[35px] h-[35px] rounded-full border border-[rgba(229,226,219,0.3)] flex items-center justify-center group hover:bg-[#efb291] transition-all"
                  >
                    <FaLinkedin className="text-[17px] text-[#e5e2db] group-hover:text-[#0b2735]" />
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="https://ca.pinterest.com/zubahouse2010/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[35px] h-[35px] rounded-full border border-[rgba(229,226,219,0.3)] flex items-center justify-center group hover:bg-[#efb291] transition-all"
                  >
                    <FaPinterestP className="text-[17px] text-[#e5e2db] group-hover:text-[#0b2735]" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Security Certifications */}
            <div className="text-center">
              <h4 className="text-[#efb291] font-[600] mb-4 text-[14px]">Security Certified</h4>
              <div className="flex flex-col gap-2 items-center">
                <div className="bg-[rgba(239,178,145,0.1)] px-4 py-2 rounded-md text-[12px] text-[#efb291] border border-[rgba(239,178,145,0.3)]">
                  🔒 SSL Secured
                </div>
                <div className="bg-[rgba(239,178,145,0.1)] px-4 py-2 rounded-md text-[12px] text-[#efb291] border border-[rgba(239,178,145,0.3)]">
                  ✅ PCI Compliant
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="text-center">
              <h4 className="text-[#efb291] font-[600] mb-4 text-[14px]">We Accept</h4>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <img src="/visa.png" alt="Visa" className="h-[20px] sm:h-[24px] w-auto opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/master_card.png" alt="MasterCard" className="h-[20px] sm:h-[24px] w-auto opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/american_express.png" alt="American Express" className="h-[20px] sm:h-[24px] w-auto opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/carte_bleue.png" alt="Carte Bleue" className="h-[20px] sm:h-[24px] w-auto opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Copyright and Legal Links */}
          <div className="border-t border-[rgba(229,226,219,0.2)] pt-6 text-center pb-[100px] lg:pb-0">
            <p className="text-[11px] sm:text-[12px] lg:text-[13px] mb-4 text-[#e5e2db]">
              © 2024－2025 Zuba House Inc. All Rights Reserved. <strong className="text-[#efb291]">Secured by ZeroX Intelligence</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-[12px]">
              <Link to="/terms-of-use" className="text-[#e5e2db] hover:text-[#efb291] transition-colors">
                Terms of Use
              </Link>
              <Link to="/faq" className="text-[#e5e2db] hover:text-[#efb291] transition-colors">
                FAQs
              </Link>
              <Link to="/return-refund-policy" className="text-[#e5e2db] hover:text-[#efb291] transition-colors">
                Return & Refund Policy
              </Link>
              <Link to="/privacy-policy" className="text-[#e5e2db] hover:text-[#efb291] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/consumer-health-data-privacy" className="text-[#e5e2db] hover:text-[#efb291] transition-colors">
                Consumer Health Data Privacy
              </Link>
              <Link to="/privacy-choices" className="text-[#e5e2db] hover:text-[#efb291] transition-colors">
                Your Privacy Choices
              </Link>
            </div>
          </div>

        </div>
      </footer>

      {/* Cart Panel */}
      <Drawer
        open={context.openCartPanel}
        onClose={context.toggleCartPanel(false)}
        anchor={"right"}
        className="cartPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>Shopping Cart ({context?.cartData?.length})</h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={context.toggleCartPanel(false)} />
        </div>

        {
          context?.cartData?.length !== 0 ? <CartPanel data={context?.cartData} /> :
            <>
              <div className="flex items-center justify-center flex-col pt-[100px] gap-5">
                <img src="/empty-cart.png" className="w-[150px]" alt="Empty Cart" />
                <h4>Your Cart is currently empty</h4>
                <Button className="btn-org btn-sm" onClick={context.toggleCartPanel(false)}>Continue Shopping</Button>
              </div>
            </>
        }
      </Drawer>

      {/* Address Panel */}
      <Drawer
        open={context.openAddressPanel}
        onClose={context.toggleAddressPanel(false)}
        anchor={"right"}
        className="addressPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>{context?.addressMode === "add" ? 'Add' : 'Edit'} Delivery Address </h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={context.toggleAddressPanel(false)} />
        </div>

        <div className="w-full max-h-[100vh] overflow-auto">
          <AddAddress />
        </div>
      </Drawer>

      {/* Product Details Modal */}
      <Dialog
        open={context?.openProductDetailsModal.open}
        fullWidth={context?.fullWidth}
        maxWidth={context?.maxWidth}
        onClose={context?.handleCloseProductDetailsModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="productDetailsModal"
      >
        <DialogContent>
          <div className="flex items-center w-full productDetailsModalContainer relative">
            <Button
              className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
              onClick={context?.handleCloseProductDetailsModal}
            >
              <IoCloseSharp className="text-[20px]" />
            </Button>
            {
              context?.openProductDetailsModal?.item?.length !== 0 &&
              <>
                <div className="col1 w-[40%] px-3 py-8">
                  <ProductZoom images={context?.openProductDetailsModal?.item?.images} />
                </div>

                <div className="col2 w-[60%] py-8 px-8 pr-16 productContent ">
                  <ProductDetailsComponent item={context?.openProductDetailsModal?.item} />
                </div>
              </>
            }
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
