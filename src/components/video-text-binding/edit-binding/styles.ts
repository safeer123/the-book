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
`;

export const ProjectDetailsArea = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
`;

export const InputItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	input {
		width: 200px;
	}
`;

export const InputLabel = styled.span`
	color: #5c5c5c;
	font-size: 12px;
	margin-right: 8px;
`;

export const BindingListItems = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	overflow-y: auto;
	border: 1px solid #727272;
	border-radius: 5px;

	.right-align {
		justify-content: flex-end;
	}
`;

export const BindingItem = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;

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
