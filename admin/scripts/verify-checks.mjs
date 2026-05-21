import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const checks = {
  A: () => read('Components/ProtectedAdminRoute/index.jsx').includes("Navigate to=\"/login\""),
  B: () => read('Pages/Notifications/index.jsx').includes('New Announcement'),
  C: () => read('Pages/Coupons/addCoupon.jsx').includes('Redeemable on'),
  D: () => read('Pages/Products/AddProductEnhanced/index.jsx').includes('Distribution channels'),
  E: () => read('Components/Sidebar/index.jsx').includes('Push Notifications'),
  F: () => read('Components/Header/index.jsx').includes('"/notifications"'),
};

console.log('Zuba Admin static verification:\n');
for (const [k, fn] of Object.entries(checks)) {
  const ok = fn();
  console.log(`${k}: ${ok ? '✅' : '❌'}`);
}
