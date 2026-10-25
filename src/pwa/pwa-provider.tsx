import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { isAndroid, isIOS, isMacSafari, isPhone } from 'utils/device-utils';
import InstallGuideModal from './install-guide-modal';
import InstallNudge from './install-nudge';
import { promptInstall, useInstallState } from './install-prompt';
import { applyUpdate, useUpdateAvailable } from './service-worker-registration';

// Set once the install nudge has been shown on this device, so it only
// ever appears by itself on someone's first visit — signed in or not. The
// "Install app" entries (profile menu, /msuras header) install on demand.
const GUIDE_SEEN_KEY = 'pwa-install-guide-seen';
// Let the page (or a post-login redirect) settle before the nudge appears.
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
	// Android/Chromium: the browser's one-tap install dialog. Elsewhere
	// (iOS, in-app browsers) there is none, so this opens the step guide.
	install: () => void;
	// Registers a page that wants the first-visit nudge; returns its cleanup.
	requestNudge: () => () => void;
}

const PwaContext = createContext<PwaContextType>({
	canInstall: false,
	install: () => undefined,
	requestNudge: () => () => undefined,
});

export const usePwa = () => useContext(PwaContext);

// Pages a first-time visitor typically lands on (/, /suras, /msuras) call
// this so the "Install or skip" nudge shows there, and not over sign-in or
// other utility pages.
export const useInstallNudge = () => {
	const { requestNudge } = usePwa();
	useEffect(() => requestNudge(), [requestNudge]);
};

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

	const [nudgeRequests, setNudgeRequests] = useState(0);
	const [nudgeOpen, setNudgeOpen] = useState(false);

	const requestNudge = useCallback(() => {
		setNudgeRequests((n) => n + 1);
		return () => setNudgeRequests((n) => n - 1);
	}, []);

	useEffect(() => {
		// Don't nag desktop users whose browser can't install; they can still
		// open the guide from the profile menu when it applies.
		if (
			!nudgeRequests ||
			installed ||
			readSeen() ||
			!(isMobileDevice || canPrompt)
		) {
			return undefined;
		}
		const timer = window.setTimeout(() => {
			markSeen();
			setNudgeOpen(true);
		}, AUTO_OPEN_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [nudgeRequests, installed, canPrompt, isMobileDevice]);

	const install = useCallback(() => {
		setNudgeOpen(false);
		if (canPrompt) {
			promptInstall().catch(() => undefined);
		} else {
			setGuideOpen(true);
		}
	}, [canPrompt]);

	// Installed from the browser's own UI while the guide was open.
	useEffect(() => {
		if (installed) {
			setGuideOpen(false);
			setNudgeOpen(false);
		}
	}, [installed]);

	const value = useMemo(
		() => ({ canInstall, install, requestNudge }),
		[canInstall, install, requestNudge]
	);

	return (
		<PwaContext.Provider value={value}>
			{children}
			{nudgeOpen && (
				<InstallNudge onInstall={install} onSkip={() => setNudgeOpen(false)} />
			)}
			<InstallGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
			<UpdateBanner />
		</PwaContext.Provider>
	);
};
