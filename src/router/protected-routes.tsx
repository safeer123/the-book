import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, User } from 'firebase/auth';
import { Spin } from 'antd';

const ProtectedRoutes = () => {
	const auth = getAuth();
	const [user, loading, error]: [
		User | null | undefined,
		boolean,
		Error | undefined
	] = useAuthState(auth);
	const location = useLocation();

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					background: '#fff',
				}}
			>
				<Spin size="large" />
			</div>
		);
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
