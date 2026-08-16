/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-console */
import { LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography } from 'antd';
import { useUserAuth } from 'auth/auth-context';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
	Container,
	ErrorMessage,
	FormContainer,
	GoogleButton,
	SignUpLink,
	Title,
} from './styles';

interface FormValues {
	email: string;
	password: string;
}

const SignInPage = () => {
	const [form] = Form.useForm<FormValues>();
	const [error, setError] = useState<string | null>(null);

	const { googleSignIn, logIn } = useUserAuth();
	const navigate = useNavigate();

	const handleSubmit = async (values: FormValues) => {
		try {
			await logIn(values.email, values.password);
			navigate('/');
		} catch (errorObj) {
			setError('Error signing in. Please check your email and password');
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
				<Title>Sign In</Title>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<Form
					form={form}
					name="signin"
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

					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Sign In
						</Button>
					</Form.Item>

					<Form.Item>
						<GoogleButton
							icon={<GoogleOutlined />}
							onClick={handleGoogleSignIn}
						>
							Sign in with Google
						</GoogleButton>
					</Form.Item>
				</Form>

				<SignUpLink>
					<Typography.Text>
						Don&apos;t have an account?{' '}
						<Link to="/signup" style={{ color: '#1890ff' }}>
							Sign Up
						</Link>
					</Typography.Text>
				</SignUpLink>
			</FormContainer>
		</Container>
	);
};

export default SignInPage;
