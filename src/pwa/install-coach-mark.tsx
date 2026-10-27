import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { Button } from 'antd';
import { usePwa } from './pwa-provider';

// Room between the screen edge and the card.
const EDGE = 12;
const RING_PADDING = 6;
const ARROW_SIZE = 10;

const fadeIn = keyframes`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`;

const pulse = keyframes`
	0%, 100% {
		outline-offset: 2px;
		outline-color: rgba(255, 255, 255, 0.9);
	}
	50% {
		outline-offset: 7px;
		outline-color: rgba(255, 255, 255, 0.25);
	}
`;

// Swallows taps on the dimmed page so the choice stays explicit.
const Blocker = styled.div`
	position: fixed;
	inset: 0;
	z-index: 1040;
`;

// A hole over the install button; its huge shadow dims everything else.
// Tapping it installs, same as the button underneath.
const Ring = styled.button`
	position: fixed;
	z-index: 1041;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: transparent;
	cursor: pointer;
	box-shadow: 0 0 0 9999px rgba(7, 1, 30, 0.62);
	outline: 2px solid rgba(255, 255, 255, 0.9);
	animation: ${fadeIn} 0.25s ease-out, ${pulse} 1.6s ease-in-out infinite;
`;

const Card = styled.div`
	position: fixed;
	z-index: 1042;
	box-sizing: border-box;
	width: min(320px, calc(100vw - ${EDGE * 2}px));
	padding: 16px;
	border-radius: 16px;
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	background: #fff;
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
	animation: ${fadeIn} 0.25s ease-out;

	[data-theme='dark'] & {
		background: #241f3d;
		border: 1px solid rgba(156, 142, 224, 0.3);
	}
`;

const Arrow = styled.span`
	position: absolute;
	top: -${ARROW_SIZE / 2}px;
	width: ${ARROW_SIZE}px;
	height: ${ARROW_SIZE}px;
	background: inherit;
	transform: rotate(45deg);

	[data-theme='dark'] & {
		border-left: 1px solid rgba(156, 142, 224, 0.3);
		border-top: 1px solid rgba(156, 142, 224, 0.3);
	}
`;

const Title = styled.div`
	font-size: 16px;
	font-weight: 650;
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		color: #e8e2fa;
	}
`;

const Message = styled.p`
	margin: 6px 0 14px;
	font-size: 14px;
	line-height: 1.45;
	color: rgba(7, 1, 65, 0.7);

	[data-theme='dark'] & {
		color: #c8c0e0;
	}
`;

const Actions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 8px;
`;

interface Props {
	anchorRef: RefObject<HTMLElement>;
}

// First-visit tour step on /msuras: dims the page, spotlights the header's
// install button and explains it, with Install or Skip.
const InstallCoachMark = ({ anchorRef }: Props) => {
	const { nudgeOpen, install, skipNudge } = usePwa();
	const [rect, setRect] = useState<DOMRect>();
	const installRef = useRef<HTMLButtonElement>(null);

	useLayoutEffect(() => {
		if (!nudgeOpen) return undefined;
		const measure = () => setRect(anchorRef.current?.getBoundingClientRect());
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, [nudgeOpen, anchorRef]);

	useEffect(() => {
		if (!nudgeOpen || !rect) return undefined;
		installRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') skipNudge();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [nudgeOpen, rect, skipNudge]);

	if (!nudgeOpen || !rect) return null;

	const centerX = rect.left + rect.width / 2;
	const cardRight = EDGE;
	const arrowRight = window.innerWidth - centerX - cardRight - ARROW_SIZE / 2;

	return createPortal(
		<>
			<Blocker />
			<Ring
				type="button"
				aria-label="Install app"
				onClick={install}
				style={{
					top: rect.top - RING_PADDING,
					left: rect.left - RING_PADDING,
					width: rect.width + RING_PADDING * 2,
					height: rect.height + RING_PADDING * 2,
				}}
			/>
			<Card
				role="dialog"
				aria-label="Install The Book"
				style={{
					top: rect.bottom + RING_PADDING + ARROW_SIZE + 4,
					right: cardRight,
				}}
			>
				<Arrow style={{ right: Math.max(12, arrowRight) }} />
				<Title>Install The Book as an app</Title>
				<Message>
					Tap this button to add The Book to your home screen. It opens
					full-screen like any other app, and suras you&apos;ve read work
					offline.
				</Message>
				<Actions>
					<Button type="text" onClick={skipNudge}>
						Skip
					</Button>
					<Button ref={installRef} type="primary" onClick={install}>
						Install
					</Button>
				</Actions>
			</Card>
		</>,
		document.body
	);
};

export default InstallCoachMark;
