import { useUserAuth } from 'auth/auth-context';

// Hides/redirects the admin UI (Recitation Timeline Editor, Project
// Manager) for everyone except these emails. Mirrored in firestore.rules'
// isAdmin() — keep both lists in sync, since that's the actual write
// enforcement; this one is only what decides what renders on the client.
const ADMIN_EMAILS = ['safeer2c@gmail.com', 'dumpfolders2c@gmail.com'];

export const useIsAdmin = (): boolean => {
	const { user } = useUserAuth();
	const email = user?.email?.toLowerCase();
	return Boolean(email && ADMIN_EMAILS.includes(email));
};
