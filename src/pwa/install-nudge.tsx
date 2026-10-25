import styled, { keyframes } from 'styled-components';
import { Button } from 'antd';

const slideUp = keyframes`
	from {
		opacity: 0;
		transform: translate(-50%, 16px);
	}
	to {
		opacity: 1;
		transform: translate(-50%, 0);
	}
`;

// Floats above the page (and /msuras' player bar) without blocking it, so
// a first-time visitor can still read while deciding.
const Card = styled.div`
	position: fixed;
	left: 50%;
	bottom: calc(16px + env(safe-area-inset-bottom));
	transform: translateX(-50%);
	z-index: 1050;
	box-sizing: border-box;
	width: calc(100vw - 24px);
	max-width: 400px;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	border-radius: 16px;
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	background: #fff;
	border: 1px solid rgba(14, 2, 121, 0.1);
	box-shadow: 0 10px 30px rgba(7, 1, 65, 0.2);
	animation: ${slideUp} 0.25s ease-out;

	[data-theme='dark'] & {
		background: #241f3d;
		border-color: rgba(156, 142, 224, 0.3);
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
	}
`;

const Icon = styled.img`
	flex-shrink: 0;
	width: 44px;
	height: 44px;
	border-radius: 10px;

	/* Leave the text room to breathe on the narrowest phones. */
	@media (max-width: 359px) {
		display: none;
	}
`;

const Text = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;

	strong {
		font-size: 15px;
		font-weight: 650;
		color: rgb(14, 2, 121);
	}

	span {
		font-size: 12px;
		line-height: 1.35;
		color: rgba(7, 1, 65, 0.6);
	}

	[data-theme='dark'] & {
		strong {
			color: #e8e2fa;
		}

		span {
			color: #a89cd8;
		}
	}
`;

const Actions = styled.div`
	flex-shrink: 0;
	display: flex;
	gap: 4px;
`;

interface Props {
	onInstall: () => void;
	onSkip: () => void;
}

const InstallNudge = ({ onInstall, onSkip }: Props) => (
	<Card role="dialog" aria-label="Install The Book">
		<Icon src="/apple-touch-icon.png" alt="" />
		<Text>
			<strong>Install The Book</strong>
			<span>Full-screen, one tap from your home screen, works offline</span>
		</Text>
		<Actions>
			<Button type="text" onClick={onSkip}>
				Skip
			</Button>
			<Button type="primary" onClick={onInstall}>
				Install
			</Button>
		</Actions>
	</Card>
);

export default InstallNudge;
