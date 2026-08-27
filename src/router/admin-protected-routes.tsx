import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from 'data/use-is-admin';

// Nested inside ProtectedRoutes, so a visitor here is already signed in —
// this only adds the extra admin-email check (see use-is-admin.ts). FE-only
// gate: it hides the UI, it doesn't protect the underlying data.
const AdminProtectedRoutes = () => {
	const isAdmin = useIsAdmin();
	return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminProtectedRoutes;
