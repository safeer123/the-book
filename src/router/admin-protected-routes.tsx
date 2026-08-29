import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from 'data/use-is-admin';

// Nested inside ProtectedRoutes, so a visitor here is already signed in —
// this only adds the extra admin check (see use-is-admin.ts). FE-only
// gate: it hides the UI, it doesn't protect the underlying data. Waits out
// isLoading so a real admin isn't bounced before the Firestore doc read
// resolves.
const AdminProtectedRoutes = () => {
	const { data: isAdmin, isLoading } = useIsAdmin();
	if (isLoading) return null;
	return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminProtectedRoutes;
