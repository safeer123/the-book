// Browser/OS chrome around the app: the status/title bar color.

// Match the page backgrounds (light "paper" / purple dark) so the Android
// status bar and installed-app title bar blend into the app.
const THEME_COLORS = { light: '#faf7f0', dark: '#14112b' };

const syncThemeColor = () => {
	const meta = document.querySelector<HTMLMetaElement>(
		'meta[name="theme-color"]'
	);
	if (!meta) return;
	const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
	meta.content = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
};

export const setUpAppChrome = (): void => {
	syncThemeColor();
	// Pages force their own theme (auth pages light, mobile player dark) by
	// setting data-theme directly, so follow the attribute, not the context.
	new MutationObserver(syncThemeColor).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	});
};
