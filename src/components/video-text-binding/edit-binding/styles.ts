import styled from 'styled-components';
import { Drawer as AntDrawer } from 'antd';

export const Drawer = styled(AntDrawer)`
	&& .ant-drawer-wrapper-body {
		position: relative;
		background-color: rgba(255, 255, 255, 0.651);
		background-image: url(https://www.transparenttextures.com/patterns/textured-paper.png);
	}
`;

export const Wrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	height: calc(100% - 16px);

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
`;

export const ProjectDetailsArea = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
`;

export const InputItem = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const InputLabel = styled.span`
	color: #5c5c5c;
	font-size: 12px;
	flex-shrink: 0;
	width: 44px;
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

export const BindingListItems = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 16px 0px;
	overflow-y: auto;
	border: 1px solid #72727299;
	border-radius: 5px;

	.right-align {
		justify-content: flex-end;
	}
`;

export const BindingItem = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;
	padding: 4px 16px;
	border-radius: 4px;

	&:not(.right-align):nth-child(odd) {
		background-color: #ffffff;
	}

	&:not(.right-align):nth-child(even) {
		background-color: #f5f5f5;
	}

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
	gap: 16px;
	padding: 16px;
	padding-bottom: 0;
	justify-content: flex-end;
`;
