import { isStandalone } from 'utils/device-utils';

// The installed app opens on the sura reader, not the home page. The
// manifest's start_url says so, but it doesn't reach apps installed before
// it changed (Android refreshes it lazily, iOS keeps the URL it was added
// from), so an app launch that lands on "/" is moved here too. Runs before
// the router is created, so the first render is already /msuras.
const APP_START_PATH = '/msuras';

if (isStandalone() && window.location.pathname === '/') {
	window.history.replaceState(
		window.history.state,
		'',
		`${APP_START_PATH}${window.location.search}${window.location.hash}`
	);
}
