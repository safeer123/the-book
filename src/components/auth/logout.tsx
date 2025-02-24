/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
import { useUserAuth } from 'auth/auth-context';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignOutPage = () => {
	const { logOut } = useUserAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logOut();
			navigate('/');
		} catch (error) {
			console.log('Error : ', error);
		}
	};

	useEffect(() => {
		handleLogout();
	}, []);

	return null;
};

export default SignOutPage;
