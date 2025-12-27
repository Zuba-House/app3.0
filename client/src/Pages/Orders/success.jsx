import React, { useContext } from 'react';
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { MyContext } from '../../App';

export const OrderSuccess = () => {
    const context = useContext(MyContext);
    return (
        <section className='w-full p-6 sm:p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-3 sm:gap-4 min-h-[60vh] bg-[#f5f0f0]'>
            <div className='text-center max-w-md mx-auto'>
                <div className='mb-4 sm:mb-6'>
                    <img 
                        src="/checked.png" 
                        className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] mx-auto" 
                        alt="Order successful"
                    />
                </div>
                <h3 className='mb-2 sm:mb-3 text-[22px] sm:text-[28px] lg:text-[32px] font-[600] text-gray-800'>
                    Your order is placed
                </h3>
                <p className='mt-0 mb-2 text-[15px] sm:text-[16px] text-gray-600'>
                    Thank you for your payment.
                </p>
                <p className='mt-0 mb-6 sm:mb-8 text-[14px] sm:text-[15px] text-gray-700 text-center px-4'>
                    Order Invoice send to your email{' '}
                    <b className='text-gray-900 break-all'>{context?.userData?.email || 'your registered email'}</b>
                </p>
                <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center'>
                    <Link to="/" className='w-full sm:w-auto'>
                        <Button 
                            className="btn-org btn-border w-full sm:w-auto min-h-[44px] px-6 py-2 text-[14px] sm:text-[16px]"
                        >
                            Back to home
                        </Button>
                    </Link>
                    <Link to="/my-orders" className='w-full sm:w-auto'>
                        <Button 
                            className="btn-org w-full sm:w-auto min-h-[44px] px-6 py-2 text-[14px] sm:text-[16px]"
                        >
                            View Orders
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
