import React from 'react';
import Logo from '/Logo.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e5e2db] via-[#e5e2db] to-[#e5e2db] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={Logo} alt="Zuba House" className="h-16 w-16 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-[#0b2735] mb-2">Zuba House</h1>
          <p className="text-[#0b2735] text-opacity-70">Vendor Portal</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

