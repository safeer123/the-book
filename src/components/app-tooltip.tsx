import {
	cloneElement,
	MouseEvent,
	ReactElement,
	TouchEvent,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Tooltip, TooltipProps } from 'antd';
import { isTouchDevice } from 'utils/device-utils';

const LONG_PRESS_MS = 450;
const HINT_VISIBLE_MS = 1600;
const MOVE_TOLERANCE_PX = 10;

type Props = TooltipProps & { children: ReactElement };

type Handler<E> = ((e: E) => void) | undefined;

// On touch screens a hover tooltip costs an extra tap (iOS spends the first
// tap "hovering", which opens the tooltip, and only the second one clicks),
// and there's no hover to discover it with anyway. Here the tap goes
// straight through, and the hint moves to a long-press instead — the same
// gesture Android uses for its native icon-button tooltips. A long-press
// that showed the hint doesn't also fire the click.
const TouchTooltip = ({ children, title, ...rest }: Props) => {
	const [open, setOpen] = useState(false);
	const pressTimer = useRef<number>();
	const hideTimer = useRef<number>();
	const pressOrigin = useRef<{ x: number; y: number }>();
	const hintShown = useRef(false);

	useEffect(
		() => () => {
			window.clearTimeout(pressTimer.current);
			window.clearTimeout(hideTimer.current);
		},
		[]
	);

	const childProps = children.props as {
		onTouchStart?: Handler<TouchEvent>;
		onTouchMove?: Handler<TouchEvent>;
		onTouchEnd?: Handler<TouchEvent>;
		onTouchCancel?: Handler<TouchEvent>;
		onContextMenu?: Handler<MouseEvent>;
	};

	const cancelPress = () => {
		window.clearTimeout(pressTimer.current);
		pressTimer.current = undefined;
	};

	const onTouchStart = (e: TouchEvent) => {
		childProps.onTouchStart?.(e);
		const touch = e.touches[0];
		pressOrigin.current = { x: touch.clientX, y: touch.clientY };
		hintShown.current = false;
		cancelPress();
		if (!title) return;
		pressTimer.current = window.setTimeout(() => {
			hintShown.current = true;
			window.clearTimeout(hideTimer.current);
			setOpen(true);
			navigator.vibrate?.(8);
		}, LONG_PRESS_MS);
	};

	const onTouchMove = (e: TouchEvent) => {
		childProps.onTouchMove?.(e);
		const origin = pressOrigin.current;
		const touch = e.touches[0];
		if (
			origin &&
			Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) >
				MOVE_TOLERANCE_PX
		) {
			cancelPress();
		}
	};

	const onTouchEnd = (e: TouchEvent) => {
		childProps.onTouchEnd?.(e);
		cancelPress();
		if (hintShown.current) {
			// Swallow the click that would otherwise follow this touch.
			if (e.cancelable) e.preventDefault();
			hideTimer.current = window.setTimeout(
				() => setOpen(false),
				HINT_VISIBLE_MS
			);
		}
	};

	const onTouchCancel = (e: TouchEvent) => {
		childProps.onTouchCancel?.(e);
		cancelPress();
		setOpen(false);
	};

	// Android raises the context menu (link preview / "open in new tab") on
	// the same long-press.
	const onContextMenu = (e: MouseEvent) => {
		childProps.onContextMenu?.(e);
		if (title) e.preventDefault();
	};

	return (
		<Tooltip {...rest} title={title} trigger={[]} open={open && !!title}>
			{cloneElement(children, {
				onTouchStart,
				onTouchMove,
				onTouchEnd,
				onTouchCancel,
				onContextMenu,
			})}
		</Tooltip>
	);
};

// Drop-in replacement for antd's Tooltip: unchanged hover tooltip on
// devices with a mouse, tap-through + long-press hint on touch screens.
const AppTooltip = (props: Props) =>
	isTouchDevice ? <TouchTooltip {...props} /> : <Tooltip {...props} />;

export default AppTooltip;
