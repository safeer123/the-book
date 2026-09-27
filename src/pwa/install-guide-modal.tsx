import { ReactElement, useState } from 'react';
import { Button, Modal } from 'antd';
import {
	CloudDownloadOutlined,
	MoreOutlined,
	PlusSquareOutlined,
	ThunderboltOutlined,
	ExpandOutlined,
	AppstoreAddOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import {
	isAndroid,
	isInAppBrowser,
	isIOS,
	isIOSSafari,
	isMacSafari,
} from 'utils/device-utils';
import { promptInstall, useInstallState } from './install-prompt';

const Header = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	gap: 6px;
	padding-top: 8px;
`;

const AppIcon = styled.img`
	width: 68px;
	height: 68px;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(14, 2, 121, 0.18);
	margin-bottom: 6px;
`;

const Title = styled.h2`
	margin: 0;
	font-size: 20px;
	font-weight: 650;
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		color: #e8e2fa;
	}
`;

const Subtitle = styled.p`
	margin: 0;
	font-size: 14px;
	color: rgba(7, 1, 65, 0.6);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const Benefits = styled.ul`
	list-style: none;
	margin: 18px 0 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

const Benefit = styled.li`
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 14px;
	color: rgba(7, 1, 65, 0.85);

	.anticon {
		font-size: 18px;
		color: #1677ff;
	}

	[data-theme='dark'] & {
		color: #d8d0f0;

		.anticon {
			color: #9c8ee0;
		}
	}
`;

const StepsCard = styled.div`
	margin-top: 18px;
	padding: 14px 16px;
	border-radius: 12px;
	background: rgba(14, 2, 121, 0.04);
	border: 1px solid rgba(14, 2, 121, 0.08);

	[data-theme='dark'] & {
		background: rgba(156, 142, 224, 0.08);
		border-color: rgba(156, 142, 224, 0.18);
	}
`;

const StepsTitle = styled.div`
	font-size: 13px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	margin-bottom: 10px;
	color: rgba(7, 1, 65, 0.55);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const Steps = styled.ol`
	margin: 0;
	padding: 0;
	list-style: none;
	counter-reset: step;
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const Step = styled.li`
	counter-increment: step;
	display: flex;
	align-items: flex-start;
	gap: 12px;
	font-size: 14px;
	line-height: 1.45;
	color: rgba(7, 1, 65, 0.9);

	&::before {
		content: counter(step);
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 600;
		color: #fff;
		background: #1677ff;
		margin-top: 1px;
	}

	[data-theme='dark'] & {
		color: #e8e2fa;

		&::before {
			background: #6d5fc7;
		}
	}
`;

// Inline "button" glyph so the step shows exactly what to look for.
const Glyph = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	vertical-align: -4px;
	width: 24px;
	height: 22px;
	margin: 0 2px;
	border-radius: 6px;
	font-size: 15px;
	color: #1677ff;
	background: rgba(22, 119, 255, 0.1);

	svg {
		width: 16px;
		height: 16px;
	}

	[data-theme='dark'] & {
		color: #b8acf0;
		background: rgba(156, 142, 224, 0.18);
	}
`;

const Note = styled.div`
	margin-top: 10px;
	font-size: 12px;
	color: rgba(7, 1, 65, 0.5);

	[data-theme='dark'] & {
		color: #8f84bd;
	}
`;

const Actions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 20px;
`;

// The iOS share icon (square with an up arrow) — not in antd's icon set.
const IOSShareIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M12 3v12M12 3 8 7M12 3l4 4"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

const ShareGlyph = () => (
	<Glyph aria-label="Share">
		<IOSShareIcon />
	</Glyph>
);

const Instructions = (): ReactElement => {
	if (isInAppBrowser) {
		const browser = isIOS ? 'Safari' : 'Chrome';
		return (
			<StepsCard>
				<StepsTitle>First, open in {browser}</StepsTitle>
				<Steps>
					<Step>
						<span>
							Tap the <Glyph aria-label="menu">•••</Glyph> menu of this app
						</span>
					</Step>
					<Step>
						<span>
							Choose <strong>Open in {browser}</strong> (or Open in browser)
						</span>
					</Step>
					<Step>
						<span>Come back to this screen there to install</span>
					</Step>
				</Steps>
			</StepsCard>
		);
	}

	if (isIOS) {
		return (
			<StepsCard>
				<StepsTitle>Add to Home Screen</StepsTitle>
				<Steps>
					<Step>
						<span>
							Tap <ShareGlyph />{' '}
							{isIOSSafari ? (
								<>
									<strong>Share</strong> in the toolbar (bottom of the screen,
									or top-right on iPad)
								</>
							) : (
								<>
									<strong>Share</strong> in the address bar
								</>
							)}
						</span>
					</Step>
					<Step>
						<span>
							Scroll down and tap{' '}
							<Glyph>
								<PlusSquareOutlined />
							</Glyph>{' '}
							<strong>Add to Home Screen</strong>
						</span>
					</Step>
					<Step>
						<span>
							Tap <strong>Add</strong> in the top-right corner
						</span>
					</Step>
				</Steps>
				{!isIOSSafari && (
					<Note>
						Don&apos;t see it? Open this page in Safari and try again.
					</Note>
				)}
			</StepsCard>
		);
	}

	if (isAndroid) {
		return (
			<StepsCard>
				<StepsTitle>Add to Home screen</StepsTitle>
				<Steps>
					<Step>
						<span>
							Tap the{' '}
							<Glyph>
								<MoreOutlined />
							</Glyph>{' '}
							browser menu (top-right)
						</span>
					</Step>
					<Step>
						<span>
							Tap <strong>Install app</strong> or{' '}
							<strong>Add to Home screen</strong>
						</span>
					</Step>
					<Step>
						<span>
							Confirm with <strong>Install</strong>
						</span>
					</Step>
				</Steps>
			</StepsCard>
		);
	}

	if (isMacSafari) {
		return (
			<StepsCard>
				<StepsTitle>Add to Dock</StepsTitle>
				<Steps>
					<Step>
						<span>
							Open the <strong>File</strong> menu (or tap <ShareGlyph />)
						</span>
					</Step>
					<Step>
						<span>
							Choose <strong>Add to Dock…</strong> and confirm
						</span>
					</Step>
				</Steps>
			</StepsCard>
		);
	}

	return (
		<StepsCard>
			<StepsTitle>Install</StepsTitle>
			<Steps>
				<Step>
					<span>
						Look for the{' '}
						<Glyph>
							<AppstoreAddOutlined />
						</Glyph>{' '}
						install icon in the address bar, or open the browser menu
					</span>
				</Step>
				<Step>
					<span>
						Choose <strong>Install The Book</strong>
					</span>
				</Step>
			</Steps>
		</StepsCard>
	);
};

interface Props {
	open: boolean;
	onClose: () => void;
}

const InstallGuideModal = ({ open, onClose }: Props) => {
	const { canPrompt } = useInstallState();
	const [installing, setInstalling] = useState(false);

	const install = async () => {
		setInstalling(true);
		try {
			const accepted = await promptInstall();
			if (accepted) onClose();
		} finally {
			setInstalling(false);
		}
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			centered
			width={400}
			destroyOnClose
		>
			<Header>
				<AppIcon src="/apple-touch-icon.png" alt="" />
				<Title>Install The Book</Title>
				<Subtitle>Get the full app experience on this device</Subtitle>
			</Header>

			<Benefits>
				<Benefit>
					<ExpandOutlined />
					Opens full-screen, like a native app
				</Benefit>
				<Benefit>
					<AppstoreAddOutlined />
					One tap from your home screen
				</Benefit>
				<Benefit>
					<ThunderboltOutlined />
					Loads faster, and suras you&apos;ve read open offline
				</Benefit>
			</Benefits>

			{/* The browser's own dialog does the work when it's available. */}
			{!canPrompt && <Instructions />}

			<Actions>
				{canPrompt ? (
					<Button
						type="primary"
						size="large"
						block
						icon={<CloudDownloadOutlined />}
						loading={installing}
						onClick={() => {
							install().catch(() => undefined);
						}}
					>
						Install app
					</Button>
				) : (
					<Button type="primary" size="large" block onClick={onClose}>
						Got it
					</Button>
				)}
				<Button type="text" block onClick={onClose}>
					{canPrompt ? 'Not now' : 'Maybe later'}
				</Button>
			</Actions>
		</Modal>
	);
};

export default InstallGuideModal;
