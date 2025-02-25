import { Button } from 'antd';
import styled from 'styled-components';

export const IconBtnLarge = styled(Button)`
	height: 80px;
	width: 80px;
	border-radius: 40px;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	.btn-icon {
		width: 70px;
		height: 70px;
	}
`;

export const IconBtnMedium = styled(Button)`
	box-shadow: 0 0 6px 0 rgb(247, 245, 245);
	border-radius: 16px;
	width: 32px !important;
	height: 32px !important;

	&:hover {
		box-shadow: 0 0 10px 0 rgb(247, 245, 245);
	}

	.ant-btn-icon {
		display: flex;
	}

	svg {
		color: #fff;
	}
`;
