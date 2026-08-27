import { useUserAuth } from 'auth/auth-context';

// FE-only allowlist: hides/redirects the admin UI (Recitation Timeline
// Editor, Project Manager) for everyone except these emails. This does NOT
// protect the underlying Firestore writes on its own — anyone who can
// write to Firestore directly (e.g. via devtools) isn't blocked by this.
// Real enforcement would need Firestore Security Rules (see
// firestore.rules for the ready-to-deploy version), intentionally not
// wired in for now.
const ADMIN_EMAILS = ['safeer2c@gmail.com', 'dumpfolders2c@gmail.com'];

export const useIsAdmin = (): boolean => {
	const { user } = useUserAuth();
	const email = user?.email?.toLowerCase();
	return Boolean(email && ADMIN_EMAILS.includes(email));
};
