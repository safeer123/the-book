import { useSyncExternalStore } from 'react';

// A new build has been downloaded and is waiting to take over. It doesn't
// activate on its own (that would swap code under a running page), so the
// UI offers a reload — which is the only way to update an installed app on
// iOS, where the app is rarely fully closed.
let waitingWorker: ServiceWorker | undefined;
const listeners = new Set<() => void>();

const setWaiting = (worker: ServiceWorker) => {
	waitingWorker = worker;
	listeners.forEach((listener) => listener());
};

const trackInstalling = (worker: ServiceWorker) => {
	worker.addEventListener('statechange', () => {
		// With no controller this is the very first install, not an update.
		if (worker.state === 'installed' && navigator.serviceWorker.controller) {
			setWaiting(worker);
		}
	});
};

export const register = (): void => {
	if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator))
		return;

	const registerWorker = async () => {
		try {
			const registration = await navigator.serviceWorker.register(
				`${process.env.PUBLIC_URL || ''}/service-worker.js`
			);

			if (registration.waiting && navigator.serviceWorker.controller) {
				setWaiting(registration.waiting);
			}
			registration.addEventListener('updatefound', () => {
				if (registration.installing) trackInstalling(registration.installing);
			});

			// Installed apps stay open for days; look for a new build whenever
			// the app comes back to the foreground.
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					registration.update().catch(() => undefined);
				}
			});
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Service worker registration failed:', error);
		}
	};

	window.addEventListener('load', () => {
		registerWorker().catch(() => undefined);
	});
};

export const applyUpdate = (): void => {
	const worker = waitingWorker;
	if (!worker) return;
	navigator.serviceWorker.addEventListener(
		'controllerchange',
		() => window.location.reload(),
		{ once: true }
	);
	worker.postMessage({ type: 'SKIP_WAITING' });
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

export const useUpdateAvailable = (): boolean =>
	useSyncExternalStore(subscribe, () => !!waitingWorker);
