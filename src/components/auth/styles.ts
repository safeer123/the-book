import { Button } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f0f2f5;
`;

export const FormContainer = styled.div`
	padding: 40px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 400px;
`;

export const Title = styled.h2`
	text-align: center;
	margin-bottom: 24px;
	color: rgba(0, 0, 0, 0.85);
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
`;

export const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	margin-bottom: 16px;
`;

export const SignUpLink = styled.div`
	text-align: center;
	margin-top: 16px;
`;
