import styled, { css } from 'styled-components';

export const Panel = styled.div<{ $open?: boolean }>`
	width: ${({ $open }) => ($open ? '380px' : '0px')};
	overflow: hidden;
	transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
`;

export const PanelInner = styled.div`
	width: 380px;
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #fff;
	border-left: 1px solid #e0e0e0;
	box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
		'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
	font-size: 14px;
	color: rgba(0, 0, 0, 0.88);

	[data-theme='dark'] & {
		background-color: #1e1b33;
		border-left-color: rgba(156, 142, 224, 0.2);
		box-shadow: -2px 0 8px rgba(0, 0, 0, 0.35);
		color: #e8e2fa;
	}
`;

export const PanelHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	border-bottom: 1px solid rgba(5, 5, 5, 0.06);
	flex-shrink: 0;
	white-space: nowrap;

	[data-theme='dark'] & {
		border-bottom-color: rgba(156, 142, 224, 0.2);
	}
`;

export const PanelTitle = styled.span`
	font-size: 16px;
	font-weight: 600;
	line-height: 1.5;
	color: rgba(0, 0, 0, 0.88);

	[data-theme='dark'] & {
		color: #e8e2fa;
	}
`;

export const Wrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	.ant-input {
		border-color: transparent;
		background: transparent;
		box-shadow: none !important;
		transition: border-color 0.15s, background-color 0.15s;

		&:hover {
			border-color: #d9d9d9;
		}

		&:focus {
			border-color: #4096ff;
			background: #fff;
		}
	}

	[data-theme='dark'] & .ant-input {
		&:hover {
			border-color: rgba(156, 142, 224, 0.4);
		}

		&:focus {
			border-color: #9c8ee0;
			background: rgba(255, 255, 255, 0.04);
		}
	}
`;

export const ProjectDetailsArea = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px 24px;
`;

export const InputItem = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const InputLabel = styled.span`
	color: rgba(0, 0, 0, 0.45);
	font-size: 13px;
	flex-shrink: 0;
	width: 44px;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

export const UrlErrorText = styled.div`
	color: #ff4d4f;
	font-size: 12px;
	margin-top: -8px;
	padding-left: 52px;
	line-height: 1.4;

	[data-theme='dark'] & {
		color: #ff7875;
	}
`;

export const DurationText = styled.div`
	text-align: right;
	font-size: 11px;
	color: rgba(0, 0, 0, 0.5);
	margin-top: -10px;
	padding-right: 2px;
	font-variant-numeric: tabular-nums;
	font-family: monospace;
	letter-spacing: 0.2px;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

export const InputGroup = styled.div`
	display: flex;
	align-items: center;
	flex: 1;
	gap: 4px;

	.ant-input {
		flex: 1;
	}
`;

export const BindingListContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid #72727299;
	border-radius: 5px;
	margin: 0 24px;

	[data-theme='dark'] & {
		border-color: rgba(156, 142, 224, 0.3);
	}
`;

export const BindingListHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6px 14px 5px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	flex-shrink: 0;

	.label {
		font-size: 11px;
		color: rgba(0, 0, 0, 0.4);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.count {
		font-size: 12px;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.55);
		font-variant-numeric: tabular-nums;
	}

	[data-theme='dark'] & {
		border-bottom-color: rgba(156, 142, 224, 0.2);

		.label {
			color: #a89cd8;
		}

		.count {
			color: #e8e2fa;
		}
	}
`;

export const BindingProgressBar = styled.div<{
	$pct: number;
	$complete: boolean;
}>`
	height: 3px;
	flex-shrink: 0;
	background: linear-gradient(
		to right,
		${({ $complete }) => ($complete ? '#52c41a' : '#4096ff')}
			${({ $pct }) => $pct}%,
		transparent ${({ $pct }) => $pct}%
	);
`;

export const BindingListItems = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 16px 0px;
	overflow-y: auto;

	.right-align {
		justify-content: flex-end;
	}
`;

export const BindingItem = styled.div<{ $active?: boolean }>`
	display: flex;
	gap: 8px;
	align-items: center;
	padding: 4px 8px 4px 12px;
	border-radius: 4px;
	transition: background-color 0.15s;

	&:not(.right-align):nth-child(odd) {
		background-color: #ffffff;
	}

	&:not(.right-align):nth-child(even) {
		background-color: #f5f5f5;
	}

	[data-theme='dark'] &:not(.right-align):nth-child(odd) {
		background-color: transparent;
	}

	[data-theme='dark'] &:not(.right-align):nth-child(even) {
		background-color: rgba(156, 142, 224, 0.08);
	}

	${({ $active }) =>
		$active &&
		css`
			background-color: #e6f4ff !important;

			[data-theme='dark'] & {
				background-color: rgba(64, 150, 255, 0.25) !important;
			}
		`}

	.binding-item-action {
		opacity: 0;
	}

	&:hover {
		.binding-item-action {
			opacity: 1;
		}
	}
`;

export const ActionArea = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px 20px;
`;
