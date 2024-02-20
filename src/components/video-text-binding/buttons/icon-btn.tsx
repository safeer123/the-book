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
	height: 36px !important;
	width: 36px;
	border-radius: 18px;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: transparent;
	border: none;

	.btn-icon {
		width: 32px;
		height: 32px;
	}

	:hover {
		opacity: 0.95;
	}
`;
