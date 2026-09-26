import styled from 'styled-components';

// Shared palette, matched to the rest of the app's light "paper" look and
// its purple-tinted dark theme.
export const HEADER_HEIGHT = 56;
export const PLAYER_HEIGHT = 72;

// The whole page owns its scroll (body is overflow:hidden app-wide), sized
// to the dynamic viewport so mobile browser chrome showing/hiding doesn't
// leave a gap or cut off the bottom bar.
export const Page = styled.div`
	position: fixed;
	inset: 0;
	height: 100dvh;
	display: flex;
	flex-direction: column;
	background: #faf7f0;
	color: rgb(7, 1, 65);
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	-webkit-tap-highlight-color: transparent;

	[data-theme='dark'] & {
		background: #14112b;
		color: #e8e2fa;
	}
`;

export const Header = styled.header`
	flex-shrink: 0;
	box-sizing: content-box;
	height: ${HEADER_HEIGHT}px;
	padding: env(safe-area-inset-top) max(8px, env(safe-area-inset-right)) 0
		max(8px, env(safe-area-inset-left));
	display: flex;
	align-items: center;
	gap: 4px;
	background: rgba(250, 247, 240, 0.92);
	backdrop-filter: saturate(1.4) blur(10px);
	-webkit-backdrop-filter: saturate(1.4) blur(10px);
	border-bottom: 1px solid rgba(14, 2, 121, 0.08);
	z-index: 20;

	[data-theme='dark'] & {
		background: rgba(20, 17, 43, 0.92);
		border-bottom-color: rgba(156, 142, 224, 0.14);
	}
`;

export const HeaderTitle = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 4px;
`;

export const HeaderMain = styled.div`
	font-size: 17px;
	font-weight: 650;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const HeaderSub = styled.div`
	font-size: 12px;
	line-height: 1.3;
	color: rgba(7, 1, 65, 0.55);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-variant-numeric: tabular-nums;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

export const IconButton = styled.button<{ $active?: boolean }>`
	flex-shrink: 0;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: none;
	background: ${({ $active }) =>
		$active ? 'rgba(14, 2, 121, 0.08)' : 'transparent'};
	color: rgb(14, 2, 121);
	font-size: 20px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
	transition: background-color 0.15s ease;
	text-decoration: none;

	&:active {
		background: rgba(14, 2, 121, 0.1);
	}

	&:disabled {
		opacity: 0.35;
	}

	[data-theme='dark'] & {
		color: #c8c0e0;
		background: ${({ $active }) =>
			$active ? 'rgba(156, 142, 224, 0.16)' : 'transparent'};
	}

	[data-theme='dark'] &:active {
		background: rgba(156, 142, 224, 0.2);
	}
`;

export const Scroller = styled.main<{ $playerOpen: boolean }>`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	overscroll-behavior-y: contain;
	-webkit-overflow-scrolling: touch;
	padding-left: env(safe-area-inset-left);
	padding-right: env(safe-area-inset-right);
	padding-bottom: calc(
		${({ $playerOpen }) => ($playerOpen ? PLAYER_HEIGHT + 24 : 24)}px +
			env(safe-area-inset-bottom)
	);
	box-sizing: border-box;
`;

export const CenterBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 64px 24px;
	text-align: center;
	color: rgba(7, 1, 65, 0.55);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

// Keeps lines at a readable measure on large phones / tablets in landscape.
export const Column = styled.div`
	max-width: 720px;
	margin: 0 auto;
`;
