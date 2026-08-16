import { Button } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f0f2f5;

	[data-theme='dark'] & {
		background-color: #151225;
	}
`;

export const FormContainer = styled.div`
	padding: 40px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 400px;

	[data-theme='dark'] & {
		background: #1e1b33;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(156, 142, 224, 0.2);
	}
`;

export const Title = styled.h2`
	text-align: center;
	margin-bottom: 24px;
	color: rgba(0, 0, 0, 0.85);

	[data-theme='dark'] & {
		color: #e8e2fa;
	}
`;

export const GoogleButton = styled(Button)`
	width: 100%;
	background-color: #fff;
	color: rgba(0, 0, 0, 0.85);
	border-color: #d9d9d9;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background-color: #fff;
		color: #1890ff;
		border-color: #1890ff;
	}

	svg {
		margin-right: 8px;
	}

	[data-theme='dark'] && {
		background-color: #241f3d;
		color: #e8e2fa;
		border-color: rgba(156, 142, 224, 0.35);

		&:hover {
			background-color: #241f3d;
			color: #9c8ee0;
			border-color: #9c8ee0;
		}
	}
`;

export const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	margin-bottom: 16px;

	[data-theme='dark'] & {
		color: #ff7875;
	}
`;

export const SignUpLink = styled.div`
	text-align: center;
	margin-top: 16px;
`;
