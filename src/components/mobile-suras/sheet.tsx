import {
	ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { CloseOutlined } from '@ant-design/icons';
import { IconButton } from './styles';

const ANIM_MS = 260;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.6; // px per ms

const Backdrop = styled.div<{ $shown: boolean }>`
	position: fixed;
	inset: 0;
	/* Above the player bar and any antd popups the page might show. */
	z-index: 1100;
	background: rgba(7, 1, 30, 0.45);
	opacity: ${({ $shown }) => ($shown ? 1 : 0)};
	transition: opacity ${ANIM_MS}ms ease;
	-webkit-tap-highlight-color: transparent;
`;

const Panel = styled.div<{ $shown: boolean; $tall: boolean }>`
	position: fixed;
	z-index: 1101;
	left: 0;
	right: 0;
	bottom: 0;
	margin: 0 auto;
	width: 100%;
	max-width: 640px;
	max-height: calc(100dvh - 48px - env(safe-area-inset-top));
	${({ $tall }) =>
		$tall &&
		css`
			height: calc(100dvh - 48px - env(safe-area-inset-top));
		`}
	display: flex;
	flex-direction: column;
	border-radius: 20px 20px 0 0;
	background: #fffdf8;
	color: rgb(7, 1, 65);
	box-shadow: 0 -8px 30px rgba(7, 1, 65, 0.18);
	transform: translateY(${({ $shown }) => ($shown ? '0' : '105%')});
	transition: transform ${ANIM_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1);
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	outline: none;

	[data-theme='dark'] & {
		background: #1e1b33;
		color: #e8e2fa;
		box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5);
	}
`;

// The drag target: handle + title row. Kept separate from the scrolling
// body so dragging content never fights with scrolling it.
const Grip = styled.div`
	flex-shrink: 0;
	touch-action: none;
	cursor: grab;
	user-select: none;
`;

const Handle = styled.div`
	width: 40px;
	height: 5px;
	border-radius: 3px;
	margin: 8px auto 2px;
	background: rgba(7, 1, 65, 0.18);

	[data-theme='dark'] & {
		background: rgba(232, 226, 250, 0.25);
	}
`;

const TitleRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	min-height: 48px;
	padding: 0 8px 4px 20px;
`;

const Title = styled.h2`
	flex: 1;
	min-width: 0;
	margin: 0;
	font-size: 17px;
	font-weight: 650;
	color: inherit;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const Body = styled.div<{ $flush: boolean }>`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	overscroll-behavior: contain;
	-webkit-overflow-scrolling: touch;
	padding: 4px 16px calc(16px + env(safe-area-inset-bottom));
	${({ $flush }) =>
		$flush &&
		css`
			padding-left: 0;
			padding-right: 0;
		`}
`;

const Footer = styled.div`
	flex-shrink: 0;
	padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
	border-top: 1px solid rgba(14, 2, 121, 0.08);

	[data-theme='dark'] & {
		border-top-color: rgba(156, 142, 224, 0.16);
	}
`;

interface Props {
	open: boolean;
	onClose: () => void;
	title: ReactNode;
	children: ReactNode;
	// Fill (almost) the whole screen instead of sizing to content.
	tall?: boolean;
	// No side padding in the body, for edge-to-edge lists.
	flush?: boolean;
	// Pinned below the scrolling body (e.g. prev/next controls).
	footer?: ReactNode;
	// Extra controls in the title row, before the close button.
	actions?: ReactNode;
}

// A mobile bottom sheet: slides up over a dimmed backdrop, closes on
// backdrop tap, Escape, the close button, or dragging the top grip down.
const Sheet = ({
	open,
	onClose,
	title,
	children,
	tall = false,
	flush = false,
	footer,
	actions,
}: Props) => {
	// `mounted` outlives `open` by the exit animation; `shown` lags `open` by
	// a frame on the way in so the slide-up transition actually runs.
	const [mounted, setMounted] = useState(open);
	const [shown, setShown] = useState(false);
	const [dragY, setDragY] = useState(0);
	const dragRef = useRef<{ y: number; t: number } | undefined>();
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = useId();

	useEffect(() => {
		if (open) {
			setMounted(true);
			const raf = requestAnimationFrame(() =>
				requestAnimationFrame(() => setShown(true))
			);
			return () => cancelAnimationFrame(raf);
		}
		setShown(false);
		setDragY(0);
		const timer = setTimeout(() => setMounted(false), ANIM_MS);
		return () => clearTimeout(timer);
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	useEffect(() => {
		if (shown) panelRef.current?.focus({ preventScroll: true });
	}, [shown]);

	const onPointerDown = useCallback((e: React.PointerEvent) => {
		if ((e.target as HTMLElement).closest('button')) return;
		dragRef.current = { y: e.clientY, t: performance.now() };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}, []);

	const onPointerMove = useCallback((e: React.PointerEvent) => {
		if (!dragRef.current) return;
		setDragY(Math.max(0, e.clientY - dragRef.current.y));
	}, []);

	const onPointerUp = useCallback(
		(e: React.PointerEvent) => {
			const start = dragRef.current;
			dragRef.current = undefined;
			if (!start) return;
			const dy = e.clientY - start.y;
			const velocity = dy / Math.max(1, performance.now() - start.t);
			if (dy > DISMISS_DISTANCE || (dy > 30 && velocity > DISMISS_VELOCITY)) {
				onClose();
			} else {
				setDragY(0);
			}
		},
		[onClose]
	);

	if (!mounted) return null;

	const dragging = dragY > 0 && dragRef.current !== undefined;

	return createPortal(
		<>
			<Backdrop $shown={shown} onClick={onClose} aria-hidden />
			<Panel
				ref={panelRef}
				role="dialog"
				aria-modal
				aria-labelledby={titleId}
				tabIndex={-1}
				$shown={shown}
				$tall={tall}
				style={
					dragY > 0
						? {
								transform: `translateY(${dragY}px)`,
								transition: dragging ? 'none' : undefined,
						  }
						: undefined
				}
			>
				<Grip
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
				>
					<Handle />
					<TitleRow>
						<Title id={titleId}>{title}</Title>
						{actions}
						<IconButton type="button" aria-label="Close" onClick={onClose}>
							<CloseOutlined />
						</IconButton>
					</TitleRow>
				</Grip>
				<Body $flush={flush}>{children}</Body>
				{footer && <Footer>{footer}</Footer>}
			</Panel>
		</>,
		document.body
	);
};

export default Sheet;
