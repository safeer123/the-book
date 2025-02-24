import {
	GoogleAuthProvider,
	User,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from 'firebase/auth';
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	ReactElement,
} from 'react';
import { auth } from 'utils/init-firebase';

interface IUserAuthProviderProps {
	children: ReactNode;
}

type AuthContextData = {
	user: User | null;
	logIn: typeof logIn;
	signUp: typeof signUp;
	logOut: typeof logOut;
	googleSignIn: typeof googleSignIn;
};

const logIn = (email: string, password: string) => {
	return signInWithEmailAndPassword(auth, email, password);
};

const signUp = (email: string, password: string) => {
	return createUserWithEmailAndPassword(auth, email, password);
};

const logOut = async () => {
	await signOut(auth);
};

const googleSignIn = () => {
	const googleAuthProvider = new GoogleAuthProvider();
	return signInWithPopup(auth, googleAuthProvider);
};

export const UserAuthContext = createContext<AuthContextData>({
	user: null,
	logIn,
	signUp,
	logOut,
	googleSignIn,
});

export const UserAuthProvider = ({
	children,
}: IUserAuthProviderProps): ReactElement => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (userData) => {
			if (userData) {
				setUser(userData);
			}
		});

		return () => {
			unsubscribe();
		};
	});
	const value: AuthContextData = {
		user,
		logIn,
		signUp,
		logOut,
		googleSignIn,
	};
	return (
		<UserAuthContext.Provider value={value}>
			{children}
		</UserAuthContext.Provider>
	);
};

export const useUserAuth = () => {
	return useContext(UserAuthContext);
};
