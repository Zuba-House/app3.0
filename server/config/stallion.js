import dotenv from 'dotenv';

dotenv.config();

// Warehouse configuration (kept for EasyPost integration)
const WAREHOUSE = {
  name: process.env.WAREHOUSE_NAME || "Zuba House Warehouse",
  company: "Zuba House",
  address1: process.env.WAREHOUSE_ADDRESS1 || "119 Chem Rivermead",
  address2: "",
  city: process.env.WAREHOUSE_CITY || "Gatineau",
  province: process.env.WAREHOUSE_PROVINCE || "QC",
  postal_code: process.env.WAREHOUSE_POSTAL || "J9H5W5",
  country: process.env.WAREHOUSE_COUNTRY || "CA",
  phone: process.env.WAREHOUSE_PHONE || "+14375577487"
};

// NOTE: Stallion API removed - will be replaced with EasyPost
export { WAREHOUSE };

