/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography } from 'antd';
import { useUserAuth } from 'auth/auth-context';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f0f2f5;
`;

const FormContainer = styled.div`
	padding: 40px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 400px;
`;

const Title = styled.h2`
	text-align: center;
	margin-bottom: 24px;
	color: rgba(0, 0, 0, 0.85);
`;

const GoogleButton = styled(Button)`
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

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	margin-bottom: 16px;
`;

const SignUpLink = styled.div`
	text-align: center;
	margin-top: 16px;
`;

interface FormValues {
	email: string;
	password: string;
	confirmPassword: string;
}

const SignUpPage = () => {
	const [form] = Form.useForm<FormValues>();
	const [error, setError] = useState<string | null>(null);

	const { googleSignIn, signUp } = useUserAuth();
	const navigate = useNavigate();

	const handleSubmit = async (values: FormValues) => {
		console.log('Signup Form submitted with values:', values);
		try {
			console.log('The user info is : ', values);
			await signUp(values.email, values.password);
			navigate('/');
		} catch (errorObj) {
			setError('Error signing up. Please try again');
			console.log('Error : ', errorObj);
		}
	};

	const handleGoogleSignIn = async () => {
		try {
			await googleSignIn();
			navigate('/');
		} catch (errorObj) {
			setError('Error signing in with Google');
			console.log('Error : ', errorObj);
		}
	};

	return (
		<Container>
			<FormContainer>
				<Title>Sign Up</Title>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<Form
					form={form}
					name="signup"
					initialValues={{ remember: true }}
					onFinish={handleSubmit}
					layout="vertical"
				>
					<Form.Item
						name="email"
						label="Email"
						rules={[
							{ required: true, message: 'Please input your email!' },
							{ type: 'email', message: 'Please enter a valid email!' },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder="Email" />
					</Form.Item>

					<Form.Item
						name="password"
						label="Password"
						rules={[{ required: true, message: 'Please input your password!' }]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Password" />
					</Form.Item>

					<Form.Item
						name="confirmPassword"
						label="Confirm Password"
						dependencies={['password']}
						rules={[
							{ required: true, message: 'Please confirm your password!' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error('The two passwords do not match!')
									);
								},
							}),
						]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder="Confirm Password"
						/>
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Sign Up
						</Button>
					</Form.Item>

					<Form.Item>
						<GoogleButton
							icon={<GoogleOutlined />}
							onClick={handleGoogleSignIn}
						>
							Sign up with Google
						</GoogleButton>
					</Form.Item>
				</Form>

				<SignUpLink>
					<Typography.Text>
						Already have an account?{' '}
						<Link to="/login" style={{ color: '#1890ff' }}>
							Sign In
						</Link>
					</Typography.Text>
				</SignUpLink>
			</FormContainer>
		</Container>
	);
};

export default SignUpPage;
