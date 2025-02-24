import { useUserAuth } from 'auth/auth-context';
import { useRemoteConfig } from './use-remote-config';
import { useMemo } from 'react';

export const useVerseBindSaveEnabled = () => {
	const { data } = useRemoteConfig();
	const { user } = useUserAuth();
	return useMemo(
		() => data?.saveEnabledUsers?.includes(user?.email || ''),
		[data, user]
	);
};
