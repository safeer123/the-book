import { Button } from 'antd';
import styled from 'styled-components';

export const IconBtnLarge = styled(Button)`
	height: 64px;
	width: 64px;
	min-width: 64px;
	border-radius: 50%;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-shrink: 0;
	border: none;
	background: linear-gradient(150deg, #8fdcf5, #4f9fe0);
	box-shadow: 0 4px 14px rgba(79, 159, 224, 0.45);
	transition: transform 0.15s ease, box-shadow 0.15s ease;

	.btn-icon {
		width: 24px;
		height: 24px;
		color: #0e1b33;
	}

	&:hover,
	&:focus {
		background: linear-gradient(150deg, #8fdcf5, #4f9fe0);
		transform: scale(1.06);
		box-shadow: 0 6px 18px rgba(79, 159, 224, 0.6);
	}

	&:active {
		transform: scale(0.96);
	}

	[data-theme='dark'] && {
		background: linear-gradient(150deg, #7ed0ec, #3d8bcf);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);

		&:hover,
		&:focus {
			background: linear-gradient(150deg, #7ed0ec, #3d8bcf);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55);
		}
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
