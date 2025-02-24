import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, User } from 'firebase/auth';

const ProtectedRoutes = () => {
	const auth = getAuth();
	const [user, loading, error]: [
		User | null | undefined,
		boolean,
		Error | undefined
	] = useAuthState(auth);
	const location = useLocation();

	if (loading) {
		return <div>...Loading</div>;
	}

	if (error) {
		return <div>Error</div>;
	}

	return user ? (
		<Outlet />
	) : (
		<Navigate to="/login" state={{ from: location }} />
	);
};

export default ProtectedRoutes;
