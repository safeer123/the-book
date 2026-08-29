import { useUserAuth } from 'auth/auth-context';
import { useQuery, UseQueryResult } from 'react-query';
import { doc, getDoc } from 'firebase/firestore';
import { fbDB } from 'utils/init-firebase';

// Admin status is server-side only: existence of a doc at admins/{uid}
// grants admin rights (see firestore.rules' isAdmin()). No admin
// emails/uids are shipped in the client bundle — a user can only ever
// check their own doc, never list the collection.
export const useIsAdmin = (): UseQueryResult<boolean> => {
	const { user } = useUserAuth();
	return useQuery(
		['is-admin', user?.uid],
		async () => {
			if (!user) return false;
			const snap = await getDoc(doc(fbDB, 'admins', user.uid));
			return snap.exists();
		},
		{ enabled: Boolean(user), staleTime: Infinity }
	);
};
