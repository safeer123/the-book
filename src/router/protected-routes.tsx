import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, User } from 'firebase/auth';
import { Spin } from 'antd';
import { useCurrentPath, withReturnTo } from 'auth/return-to';

const ProtectedRoutes = () => {
	const auth = getAuth();
	const [user, loading, error]: [
		User | null | undefined,
		boolean,
		Error | undefined
	] = useAuthState(auth);
	const currentPath = useCurrentPath();

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
		// Replace, so "back" after signing in doesn't land on the sign-in page.
		<Navigate replace to={withReturnTo('/login', currentPath)} />
	);
};

export default ProtectedRoutes;
