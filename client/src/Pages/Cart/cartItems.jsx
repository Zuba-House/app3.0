import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GoTriangleDown } from "react-icons/go";
import Rating from "@mui/material/Rating";
import { IoCloseSharp } from "react-icons/io5";
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import { formatCurrency } from "../../utils/currency";

const CartItems = (props) => {
  const [sizeanchorEl, setSizeAnchorEl] = useState(null);
  const [selectedSize, setCartItems] = useState(props.selected);
  const openSize = Boolean(sizeanchorEl);

  const [qtyanchorEl, setQtyAnchorEl] = useState(null);
  const [selectedQty, setSelectedQty] = useState(props.qty);
  const openQty = Boolean(qtyanchorEl);

  const numbers = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10) + 1);

  const context = useContext(MyContext);

  const handleClickSize = (event) => {
    setSizeAnchorEl(event.currentTarget);
  };
  const handleCloseSize = (value) => {
    setSizeAnchorEl(null);
    if (value !== null) {
      setCartItems(value);
    }
  };

  const handleClickQty = (event) => {
    setQtyAnchorEl(event.currentTarget);
  };
  const handleCloseQty = (value) => {
    setQtyAnchorEl(null);
    if (value !== null) {
      setSelectedQty(value);

      // Check if this is a guest cart item (id starts with 'guest_')
      const isGuestItem = props?.item?._id?.toString().startsWith('guest_');

      if (isGuestItem || !context?.isLogin) {
        // Update guest cart
        if (context?.updateGuestCartQty) {
          context.updateGuestCartQty(props?.item?._id, value);
        }
      } else {
        // Update server cart
        const cartObj = {
          _id: props?.item?._id,
          qty: value,
          subTotal: parseFloat(props?.item?.price || 0) * value
        }

        editData("/api/cart/update-qty", cartObj).then((res) => {
          if (res?.data?.error === false) {
            context.alertBox("success", res?.data?.message);
            context?.getCartItems();
          }
        })
      }
    }
  };


  // Removed old updateCart function - variations should be changed on product page, not in cart




  const removeItem = (id) => {
    // Check if this is a guest cart item
    const isGuestItem = id?.toString().startsWith('guest_');

    if (isGuestItem || !context?.isLogin) {
      // Remove from guest cart
      if (context?.removeFromGuestCart) {
        context.removeFromGuestCart(id);
      }
    } else {
      // Remove from server cart
      deleteData(`/api/cart/delete-cart-item/${id}`).then((res) => {
        context.alertBox("success", "Product removed from cart");
        context?.getCartItems();
      })
    }
  }


  return (
    <div className="cartItem w-full p-3 flex items-center gap-4 pb-5 border-b border-[rgba(0,0,0,0.1)] relative">
      {/* Out of Stock Badge */}
      {props?.item?.isOutOfStock && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold z-10">
          OUT OF STOCK
        </div>
      )}
      {props?.item?.isLowStock && !props?.item?.isOutOfStock && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-[10px] font-bold z-10">
          Only {props?.item?.currentStock || props?.item?.countInStock} left
        </div>
      )}

      <div className="img w-[30%] sm:w-[20%] lg:w-[15%] rounded-md overflow-hidden relative">
        <Link to={`/product/${props?.item?.productId}`} className="group">
          <img
            src={props?.item?.image}
            className="w-full group-hover:scale-105 transition-all"
            alt={props?.item?.productTitle}
          />
        </Link>
      </div>

      <div className="info  w-[70%]  sm:w-[80%]  lg:w-[85%] relative">
        <IoCloseSharp className="cursor-pointer absolute top-[0px] right-[0px] text-[22px] link transition-all" onClick={() => removeItem(props?.item?._id)} />
        <span className="text-[13px]">{props?.item?.brand}</span>
        <h3 className="text-[13px] sm:text-[15px] w-[80%]">
          <Link to={`/product/${props?.item?.productId}`} className="link">{props?.item?.productTitle?.substr(0, context?.windowWidth < 992 ? 30 : 120) + '...'}</Link>
        </h3>

        {/* Variation Info Display */}
        {props?.item?.variation && props?.item?.variation.attributes && props?.item?.variation.attributes.length > 0 && (
          <div className="variation-info flex flex-wrap gap-2 mt-1 mb-1">
            {props.item.variation.attributes.map((attr, idx) => (
              <span key={idx} className="text-[11px] bg-gray-100 px-2 py-1 rounded">
                {attr.name}: <strong>{attr.value}</strong>
              </span>
            ))}
          </div>
        )}
        {props?.item?.variation?.sku && (
          <div className="text-[11px] text-gray-500 mt-1">SKU: {props.item.variation.sku}</div>
        )}

        <Rating name="size-small" value={props?.item?.rating} size="small" readOnly />

        <div className="flex items-center gap-4 mt-2">
          {/* Old variation system - kept for backward compatibility only */}
          {(props?.item?.size || props?.item?.weight || props?.item?.ram) && !props?.item?.variation && (
            <div className="text-[11px] bg-gray-100 px-2 py-1 rounded">
              {props?.item?.size && `Size: ${props.item.size}`}
              {props?.item?.weight && `Weight: ${props.item.weight}`}
              {props?.item?.ram && `RAM: ${props.item.ram}`}
            </div>
          )}



          <div className="relative">
            <span
              className={`flex items-center justify-center bg-[#f1f1f1] text-[11px] font-[600] py-1 px-2 rounded-md ${
                props?.item?.isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={props?.item?.isOutOfStock ? undefined : handleClickQty}
            >
              Qty: {selectedQty} <GoTriangleDown />
            </span>

            {!props?.item?.isOutOfStock && (
              <Menu
                id="qty-menu"
                anchorEl={qtyanchorEl}
                open={openQty}
                onClose={() => handleCloseQty(null)}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                {Array.from({ length: Math.min(15, props?.item?.currentStock || props?.item?.countInStock || 15) }).map((_, index) => (
                  <MenuItem key={index} onClick={() => handleCloseQty(index + 1)}>{index + 1}</MenuItem>
                ))}
              </Menu>
            )}
          </div>
        </div>

        {/* Stock Warning Messages */}
        {props?.item?.isOutOfStock && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-700">
            ⚠️ This item is no longer available. Please remove it from your cart.
          </div>
        )}
        {props?.item?.stockChanged && !props?.item?.isOutOfStock && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[12px] text-blue-700">
            ℹ️ Stock has changed. Quantity adjusted to available stock.
          </div>
        )}

        <div className="flex items-center gap-4 mt-2">
          <span className="price text-[14px] font-[600]">{formatCurrency(props?.item?.price)}</span>

          {props?.item?.oldPrice && props?.item?.oldPrice > props?.item?.price && (
            <span className="oldPrice line-through text-gray-500 text-[14px] font-[500]">
              {formatCurrency(props?.item?.oldPrice)}
            </span>
          )}

          {props?.item?.discount && props?.item?.discount > 0 && (
            <span className="price text-primary text-[14px] font-[600]">
              {props?.item?.discount}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItems;

