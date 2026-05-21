import ProtectedAdminRoute from '../Components/ProtectedAdminRoute';
import AdminLayout from '../Components/AdminLayout';

export function buildAdminRoute(Component, options = {}) {
  const { contentClass } = options;
  return (
    <ProtectedAdminRoute>
      <AdminLayout contentClass={contentClass}>
        <Component />
      </AdminLayout>
    </ProtectedAdminRoute>
  );
}
