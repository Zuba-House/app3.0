import React, { useState, useEffect } from 'react';
import { Button } from "@mui/material";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../Components/Badge";
import SearchBox from '../../Components/SearchBox';
import { FaAngleUp } from "react-icons/fa6";
import { deleteData, editData, fetchDataFromApi } from '../../utils/api';
import Pagination from "@mui/material/Pagination";

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useContext } from 'react';

import { MyContext } from "../../App.jsx";

export const Orders = () => {

  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  const [ordersData, setOrdersData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageOrder, setPageOrder] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalOrdersData, setTotalOrdersData] = useState([]);

  const context = useContext(MyContext);


  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };


  const handleChange = (event, id) => {
    const newStatus = event.target.value;
    setOrderStatus(newStatus);

    // Map old status values to new status system
    const statusMap = {
      'pending': 'Received',
      'confirm': 'Processing',
      'delivered': 'Delivered'
    };

    // Determine which status to send
    const mappedStatus = statusMap[newStatus] || newStatus;
    
    const obj = {
      order_status: newStatus, // Keep for backward compatibility
      status: mappedStatus // New status system
    }

    console.log('Updating order:', id, 'with status:', obj);

    editData(`/api/order/order-status/${id}`, obj).then((res) => {
      console.log('✅ Order update response:', res);
      
      // editData returns res.data directly, so res is already the response object
      const response = res;
      
      if (response?.success === true || response?.error === false) {
        context.alertBox("success", response?.message || "Order status updated successfully");
        // Refresh orders list immediately
        fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
          if (res?.error === false) {
            setOrdersData(res?.data)
            setOrderStatus(''); // Reset to trigger useEffect refresh
          }
        })
      } else {
        context.alertBox("error", response?.message || "Failed to update order status");
      }
    }).catch((error) => {
      console.error("❌ Order update error:", error);
      console.error("Error details:", error?.response);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to update order status";
      context.alertBox("error", errorMessage);
    })

  };


  useEffect(() => {
    context?.setProgress(50);
    fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
      if (res?.error === false) {
        setOrdersData(res?.data)
        context?.setProgress(100);
      }
    })
    fetchDataFromApi(`/api/order/order-list`).then((res) => {
      if (res?.error === false) {
        setTotalOrdersData(res)
      }
    })
  }, [orderStatus, pageOrder])


  useEffect(() => {

    // Filter orders based on search query
    if (searchQuery !== "") {
      const filteredOrders = totalOrdersData?.data?.filter((order) =>
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.createdAt?.includes(searchQuery)
      );
      setOrdersData(filteredOrders)
    } else {
      fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
        if (res?.error === false) {
          setOrders(res)
          setOrdersData(res?.data)
        }
      })
    }

  }, [searchQuery])


    const deleteOrder = (id) => {
          if (context?.userData?.role === "ADMIN") {
              deleteData(`/api/order/deleteOrder/${id}`).then((res) => {
                fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
                  if (res?.error === false) {
                    setOrdersData(res?.data)
                    context?.setProgress(100);
                    context.alertBox("success", "Order Delete successfully!");
                  }
                })

                fetchDataFromApi(`/api/order/order-list`).then((res) => {
                  if (res?.error === false) {
                    setTotalOrdersData(res)
                  }
                })
                
              })
          } else {
              context.alertBox("error", "Only admin can delete data");
          }
      }
  

  return (
    <div className="card my-2 md:mt-4 shadow-md sm:rounded-lg bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 px-5 py-5 flex-col sm:flex-row">
        <h2 className="text-[18px] font-[600] text-left mb-2 lg:mb-0">Recent Orders</h2>
        <div className="ml-auto w-full">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setPageOrder={setPageOrder}
          />
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                &nbsp;
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Order Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Paymant Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Name
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Address
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Pincode
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Email
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                User Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Order Status
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Date
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody>

            {
              ordersData?.length !== 0 && ordersData?.map((order, index) => {
                return (
                  <>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-[500]">
                        <Button
                          className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                          onClick={() => isShowOrderdProduct(index)}
                        >
                          {
                            isOpenOrderdProduct === index ? <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" /> : <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                          }

                        </Button>
                      </td>
                      <td className="px-6 py-4 font-[500]">
                        <span className="text-primary">
                          {order?._id}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-[500]">
        <span className="text-primary whitespace-nowrap text-[13px]">
          {
            order?.payment_status === 'FAILED'
              ? 'FAILED'
              : (order?.paymentId ? order?.paymentId : 'CASH ON DELIVERY')
          }
        </span>
                      </td>

                      <td className="px-6 py-4 font-[500] whitespace-nowrap">
                        {order?.userId?.name}
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        {order?.phone || 
                         order?.delivery_address?.contactInfo?.phone || 
                         order?.delivery_address?.mobile || 
                         'N/A'}
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        {/* Use order.shippingAddress if available, otherwise use delivery_address */}
                        {order?.shippingAddress ? (
                          <span className="block w-[400px]">
                            {[
                              order.shippingAddress.addressLine1,
                              order.shippingAddress.addressLine2,
                              order.shippingAddress.city,
                              order.shippingAddress.province || order.shippingAddress.provinceCode,
                              order.shippingAddress.postalCode || order.shippingAddress.postal_code,
                              order.shippingAddress.country
                            ].filter(Boolean).join(", ")}
                          </span>
                        ) : (
                          <>
                            <span className='inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md'>{order?.delivery_address?.addressType || order?.delivery_address?.label}</span>
                            <span className="block w-[400px]">
                              {order?.delivery_address?.address?.addressLine1 || order?.delivery_address?.address_line1 || ''} {" "}
                              {order?.delivery_address?.address?.city || order?.delivery_address?.city || ''} {" "}
                              {order?.delivery_address?.address?.addressLine2 || order?.delivery_address?.landmark || ''} {" "}
                              {order?.delivery_address?.address?.provinceCode || order?.delivery_address?.state || ''} {" "}
                              {order?.delivery_address?.address?.country || order?.delivery_address?.country || ''}
                            </span>
                          </>
                        )}
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        {order?.shippingAddress?.postalCode || 
                         order?.shippingAddress?.postal_code || 
                         order?.delivery_address?.address?.postalCode || 
                         order?.delivery_address?.pincode || 
                         'N/A'}
                      </td>

                      <td className="px-6 py-4 font-[500]">{order?.totalAmt}</td>

                      <td className="px-6 py-4 font-[500]">
                        {order?.userId?.email?.substr(0,5)+'***'}
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        <span className="text-primary">
                          {order?.userId?._id}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        {/* Always show editable order status select */}
                        <div className="flex flex-col gap-1">
                          {/* Payment Status Badge (if exists) */}
                          {order?.payment_status && (
                            <Badge status={order?.payment_status} />
                          )}
                          {/* Order Status Select - Always editable */}
                          <Select
                            labelId={`order-status-select-${order?._id}`}
                            id={`order-status-${order?._id}`}
                            value={order?.status || order?.order_status || 'pending'}
                            label="Order Status"
                            size="small"
                            style={{ zoom: '80%', minWidth: '120px' }}
                            className="w-full"
                            onChange={(e) => handleChange(e, order?._id)}
                          >
                            {/* Legacy status options */}
                            <MenuItem value={'pending'}>Pending</MenuItem>
                            <MenuItem value={'confirm'}>Confirm</MenuItem>
                            {/* New status system options */}
                            <MenuItem value={'Received'}>Received</MenuItem>
                            <MenuItem value={'Processing'}>Processing</MenuItem>
                            <MenuItem value={'Shipped'}>Shipped</MenuItem>
                            <MenuItem value={'Out for Delivery'}>Out for Delivery</MenuItem>
                            <MenuItem value={'Delivered'}>Delivered</MenuItem>
                          </Select>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-[500] whitespace-nowrap">
                        {order?.createdAt?.split("T")[0]}
                      </td>
                      <td className="px-6 py-4 font-[500] whitespace-nowrap">
                        <Button onClick={() => deleteOrder(order?._id)} variant="outlined" color="error" size="small">Delete</Button>
                      </td>
                    </tr>

                    {isOpenOrderdProduct === index && (
                      <tr>
                        <td className="pl-20" colSpan="6">
                          <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Product Id
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Product Title
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Variation / SKU
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Image
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Quantity
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Price
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 whitespace-nowrap"
                                  >
                                    Sub Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  order?.products?.map((item, index) => {
                                    // Get variation attributes for display
                                    const variationInfo = [];
                                    
                                    // Check new variation system first
                                    if (item?.variation?.attributes && item.variation.attributes.length > 0) {
                                      item.variation.attributes.forEach(attr => {
                                        if (attr.name && attr.value) {
                                          variationInfo.push(`${attr.name}: ${attr.value}`);
                                        }
                                      });
                                    }
                                    
                                    // Fallback to legacy fields if no new variation data
                                    if (variationInfo.length === 0) {
                                      if (item?.size) variationInfo.push(`Size: ${item.size}`);
                                      if (item?.weight) variationInfo.push(`Weight: ${item.weight}`);
                                      if (item?.ram) variationInfo.push(`RAM: ${item.ram}`);
                                    }
                                    
                                    const sku = item?.variation?.sku || item?.sku || 'N/A';
                                    
                                    return (
                                      <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-[500]">
                                          <span className="text-gray-600 text-[11px]">
                                            {item?.productId || item?._id}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 font-[500]">
                                          <div className="w-[200px]">
                                            {item?.productTitle}
                                          </div>
                                        </td>

                                        <td className="px-6 py-4 font-[500]">
                                          <div className="min-w-[150px]">
                                            {variationInfo.length > 0 ? (
                                              <div className="flex flex-wrap gap-1">
                                                {variationInfo.map((info, idx) => (
                                                  <span 
                                                    key={idx} 
                                                    className="inline-block bg-blue-100 text-blue-800 text-[11px] font-medium px-2 py-0.5 rounded"
                                                  >
                                                    {info}
                                                  </span>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-gray-400 text-[12px]">No variation</span>
                                            )}
                                            <div className="text-[10px] text-gray-500 mt-1">
                                              SKU: {sku}
                                            </div>
                                          </div>
                                        </td>

                                        <td className="px-6 py-4 font-[500]">
                                          <img
                                            src={item?.variation?.image || item?.image}
                                            className="w-[40px] h-[40px] object-cover rounded-md"
                                            alt={item?.productTitle}
                                          />
                                        </td>

                                        <td className="px-6 py-4 font-[500] whitespace-nowrap">
                                          {item?.quantity}
                                        </td>

                                        <td className="px-6 py-4 font-[500]">{item?.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>

                                        <td className="px-6 py-4 font-[500]">{(item?.price * item?.quantity)?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                      </tr>
                                    )
                                  })
                                }


                                <tr>
                                  <td
                                    className="bg-[#f1f1f1]"
                                    colSpan="12"
                                  ></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })

            }






          </tbody>
        </table>
      </div>


      {
        orders?.totalPages > 1 &&
        <div className="flex items-center justify-center mt-10 pb-5">
          <Pagination
            showFirstButton showLastButton
            count={orders?.totalPages}
            page={pageOrder}
            onChange={(e, value) => setPageOrder(value)}
          />
        </div>
      }
    </div>
  )
}


export default Orders;

