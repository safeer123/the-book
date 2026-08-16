import { useEffect } from 'react';
import { useAppTheme } from 'context/theme-context';

// Auth pages are always light, independent of the site-wide theme toggle —
// force it while mounted and restore the user's real preference on exit.
// data-theme-forced tells AppThemeProvider not to clobber this back to the
// user's actual mode on its own (later-running, since it's an ancestor)
// mount effect.
export const useForceLightTheme = (): void => {
	const { mode } = useAppTheme();

	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute('data-theme-forced', 'true');
		root.setAttribute('data-theme', 'light');
		root.setAttribute('data-hide-theme-toggle', 'true');
		return () => {
			root.removeAttribute('data-theme-forced');
			root.removeAttribute('data-hide-theme-toggle');
			root.setAttribute('data-theme', mode);
		};
	}, [mode]);
};
