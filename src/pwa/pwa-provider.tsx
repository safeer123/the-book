import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { auth } from 'utils/init-firebase';
import { isAndroid, isIOS, isMacSafari, isPhone } from 'utils/device-utils';
import InstallGuideModal from './install-guide-modal';
import { useInstallState } from './install-prompt';
import { applyUpdate, useUpdateAvailable } from './service-worker-registration';

// Set once the guide has been shown on this device, so it only ever opens
// by itself the first time someone signs in here. The profile menu's
// "Install app" item reopens it on demand.
const GUIDE_SEEN_KEY = 'pwa-install-guide-seen';
// Let the post-login redirect settle before a modal appears over it.
const AUTO_OPEN_DELAY_MS = 1800;

const readSeen = () => {
	try {
		return localStorage.getItem(GUIDE_SEEN_KEY) === '1';
	} catch {
		return false;
	}
};

const markSeen = () => {
	try {
		localStorage.setItem(GUIDE_SEEN_KEY, '1');
	} catch {
		// Private mode etc. — worst case the guide shows again next time.
	}
};

interface PwaContextType {
	// Not yet installed, and this browser has some way to install.
	canInstall: boolean;
	openInstallGuide: () => void;
}

const PwaContext = createContext<PwaContextType>({
	canInstall: false,
	openInstallGuide: () => undefined,
});

export const usePwa = () => useContext(PwaContext);

const UpdateBar = styled.div`
	position: fixed;
	top: calc(12px + env(safe-area-inset-top));
	left: 50%;
	transform: translateX(-50%);
	z-index: 1100;
	display: flex;
	align-items: center;
	gap: 10px;
	max-width: calc(100vw - 24px);
	padding: 8px 8px 8px 16px;
	border-radius: 24px;
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	font-size: 14px;
	white-space: nowrap;
	color: #fff;
	background: rgba(20, 17, 43, 0.94);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

	[data-theme='dark'] & {
		color: #14112b;
		background: rgba(232, 226, 250, 0.96);
	}

	.ant-btn-text {
		color: inherit;
	}
`;

const UpdateBanner = () => {
	const updateAvailable = useUpdateAvailable();
	const [dismissed, setDismissed] = useState(false);
	if (!updateAvailable || dismissed) return null;
	return (
		<UpdateBar role="status">
			A new version is available
			<Button size="small" type="primary" shape="round" onClick={applyUpdate}>
				Reload
			</Button>
			<Button
				size="small"
				type="text"
				shape="circle"
				icon={<CloseOutlined />}
				aria-label="Dismiss"
				onClick={() => setDismissed(true)}
			/>
		</UpdateBar>
	);
};

export const PwaProvider = ({ children }: { children: ReactNode }) => {
	const { canPrompt, installed } = useInstallState();
	const [guideOpen, setGuideOpen] = useState(false);

	// Phones/tablets always have a way (native prompt or Share/menu steps);
	// desktops only when the browser itself offers install.
	const isMobileDevice = isIOS || isAndroid || isPhone;
	const canInstall = !installed && (isMobileDevice || canPrompt || isMacSafari);

	useEffect(() => {
		// Don't nag desktop users whose browser can't install; they can still
		// open the guide from the profile menu when it applies.
		if (installed || readSeen() || !(isMobileDevice || canPrompt)) {
			return undefined;
		}
		let timer: number | undefined;
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			window.clearTimeout(timer);
			if (user && !readSeen()) {
				timer = window.setTimeout(() => {
					markSeen();
					setGuideOpen(true);
				}, AUTO_OPEN_DELAY_MS);
			}
		});
		return () => {
			window.clearTimeout(timer);
			unsubscribe();
		};
	}, [installed, canPrompt, isMobileDevice]);

	// Installed from the browser's own UI while the guide was open.
	useEffect(() => {
		if (installed) setGuideOpen(false);
	}, [installed]);

	const openInstallGuide = useCallback(() => setGuideOpen(true), []);
	const value = useMemo(
		() => ({ canInstall, openInstallGuide }),
		[canInstall, openInstallGuide]
	);

	return (
		<PwaContext.Provider value={value}>
			{children}
			<InstallGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
			<UpdateBanner />
		</PwaContext.Provider>
	);
};
