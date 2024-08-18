import { useParams } from 'react-router-dom';

export const VIDEO_STATE_KEY = 'video-state';

export const usePersistedVideoState = () => {
	const { pid } = useParams();

	const saveTime = (t: number) => {
		if (!pid || t === 0) return;

		const stateStr = localStorage.getItem(VIDEO_STATE_KEY);
		localStorage.setItem(
			VIDEO_STATE_KEY,
			JSON.stringify({
				...(stateStr ? JSON.parse(stateStr) : {}),
				[pid]: { t },
			})
		);
	};

	const getTime = () => {
		if (!pid) return 0;

		const stateStr = localStorage.getItem(VIDEO_STATE_KEY);
		if (stateStr) {
			const state = JSON.parse(stateStr) as { [key: string]: { t: string } };
			if (state?.[pid]?.t) {
				return parseInt(state?.[pid]?.t, 10);
			}
		}

		return 0;
	};

	return {
		saveTime,
		getTime,
	};
};
