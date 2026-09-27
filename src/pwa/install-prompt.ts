import { useSyncExternalStore } from 'react';
import { isStandalone } from 'utils/device-utils';

// Chromium's (Android Chrome, Samsung Internet, desktop Chrome/Edge) native
// install prompt. Not in TypeScript's DOM lib.
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallState {
	// The browser is offering its own one-tap install.
	canPrompt: boolean;
	installed: boolean;
}

let deferredPrompt: BeforeInstallPromptEvent | undefined;
let state: InstallState = { canPrompt: false, installed: isStandalone() };
const listeners = new Set<() => void>();

const setState = (next: Partial<InstallState>) => {
	state = { ...state, ...next };
	listeners.forEach((listener) => listener());
};

// Chrome fires beforeinstallprompt once, early — often before React has
// mounted — so this listens from module load (imported by index.tsx) and
// holds on to the event until the install guide asks for it.
window.addEventListener('beforeinstallprompt', (e) => {
	// Keep Chrome's own mini-infobar from competing with our install guide.
	e.preventDefault();
	deferredPrompt = e as BeforeInstallPromptEvent;
	setState({ canPrompt: true });
});

window.addEventListener('appinstalled', () => {
	deferredPrompt = undefined;
	setState({ canPrompt: false, installed: true });
});

// Resolves true if the user accepted the browser's install dialog.
export const promptInstall = async (): Promise<boolean> => {
	const event = deferredPrompt;
	if (!event) return false;
	// The event can only be used once.
	deferredPrompt = undefined;
	setState({ canPrompt: false });
	await event.prompt();
	const { outcome } = await event.userChoice;
	return outcome === 'accepted';
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

export const useInstallState = (): InstallState =>
	useSyncExternalStore(subscribe, () => state);
