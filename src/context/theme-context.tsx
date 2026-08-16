import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	ReactNode,
} from 'react';
// antd's ConfigProvider type declaration fails to parse under this repo's
// pinned TypeScript version, tripping a false-positive here even though the
// export exists at runtime.
// eslint-disable-next-line import/named
import { ConfigProvider, theme as antdTheme, Tooltip } from 'antd';
import styled from 'styled-components';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'app-theme-mode';

// Shared "elevated surface" look for Popover content in dark mode — antd's
// own dark surface color sits too close to the page background to read as
// a distinct floating panel, so pass this as `overlayInnerStyle` when
// `mode === 'dark'`.
export const DARK_POPOVER_STYLE: React.CSSProperties = {
	background: '#241f3d',
	border: '1px solid rgba(156, 142, 224, 0.3)',
	boxShadow: '0 10px 28px rgba(0, 0, 0, 0.55)',
};

interface ThemeContextType {
	mode: ThemeMode;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useAppTheme must be used within an AppThemeProvider');
	}
	return context;
};

const getInitialMode = (): ThemeMode => {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
};

const ToggleButton = styled.button`
	position: fixed;
	top: 16px;
	right: 16px;
	/* Below antd's Drawer/Modal default z-index (1000) so an open drawer
	   fully covers this instead of visually colliding with its header. */
	z-index: 900;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: none;
	cursor: pointer;
	font-size: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	transition: transform 0.15s ease;

	&:hover {
		transform: scale(1.06);
	}

	[data-theme='dark'] & {
		background: #2a2740;
	}

	/* Pages with their own always-on theme (mobile player, video-binding's
	   profile menu) opt out by setting this attribute on <html>. */
	[data-hide-theme-toggle='true'] & {
		display: none;
	}
`;

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [mode, setMode] = useState<ThemeMode>(getInitialMode);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, mode);
		// Pages that force their own theme (e.g. mobile-qbind, always dark) set
		// data-theme-forced on <html>; on mount, their effect runs before this
		// one (children commit before parents), so skip clobbering it back.
		if (!document.documentElement.hasAttribute('data-theme-forced')) {
			document.documentElement.setAttribute('data-theme', mode);
		}
	}, [mode]);

	const toggleTheme = () =>
		setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

	const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

	return (
		<ThemeContext.Provider value={value}>
			<ConfigProvider
				theme={{
					algorithm:
						mode === 'dark'
							? antdTheme.darkAlgorithm
							: antdTheme.defaultAlgorithm,
				}}
			>
				{children}
				<Tooltip
					title={
						mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
					}
					placement="bottomLeft"
				>
					<ToggleButton type="button" onClick={toggleTheme}>
						{mode === 'dark' ? '☀️' : '🌙'}
					</ToggleButton>
				</Tooltip>
			</ConfigProvider>
		</ThemeContext.Provider>
	);
};
