import { useQuery, UseQueryResult } from 'react-query';
import { fetchAndActivate, getAll } from 'firebase/remote-config';
import { remoteConfig } from 'utils/init-firebase';

const VERSE_BIND_SAVE_ENABLED_USERS = 'verse_bind_save_enabled_users';

export const useRemoteConfig = (): UseQueryResult<{
	saveEnabledUsers: string[];
}> => {
	return useQuery(
		['remote-config'],
		async () => {
			// Fetch and activate the Remote Config
			await fetchAndActivate(remoteConfig);

			// Get the parameter value
			const value = getAll(remoteConfig);
			return {
				saveEnabledUsers: (
					JSON.parse(value[VERSE_BIND_SAVE_ENABLED_USERS].asString()) as {
						users: string[];
					}
				)?.users,
			};
		},
		{
			staleTime: Infinity,
		}
	);
};
