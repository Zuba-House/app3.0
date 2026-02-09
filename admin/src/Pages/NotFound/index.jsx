import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button
            variant="contained"
            startIcon={<FaHome />}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

