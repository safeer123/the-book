import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PLAYER_HEIGHT } from './styles';

const VISIBLE_MS = 1800;

const Bubble = styled.div<{ $shown: boolean; $raised: boolean }>`
	position: fixed;
	left: 50%;
	bottom: calc(
		${({ $raised }) => ($raised ? PLAYER_HEIGHT + 20 : 20)}px +
			env(safe-area-inset-bottom)
	);
	z-index: 1200;
	max-width: calc(100vw - 48px);
	padding: 10px 18px;
	border-radius: 20px;
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	color: #fff;
	background: rgba(20, 17, 43, 0.92);
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	pointer-events: none;
	opacity: ${({ $shown }) => ($shown ? 1 : 0)};
	transform: translate(-50%, ${({ $shown }) => ($shown ? '0' : '8px')});
	transition: opacity 0.2s ease, transform 0.2s ease;

	[data-theme='dark'] & {
		color: #14112b;
		background: rgba(232, 226, 250, 0.95);
	}
`;

// Remounted (via `key`) for every message, so each one gets a fresh timer.
const Toast = ({ text, raised }: { text?: string; raised: boolean }) => {
	const [shown, setShown] = useState(false);

	useEffect(() => {
		if (!text) return undefined;
		const raf = requestAnimationFrame(() => setShown(true));
		const timer = setTimeout(() => setShown(false), VISIBLE_MS);
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timer);
		};
	}, [text]);

	if (!text) return null;
	return (
		<Bubble role="status" aria-live="polite" $shown={shown} $raised={raised}>
			{text}
		</Bubble>
	);
};

export default Toast;
