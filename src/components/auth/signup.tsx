/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
// antd's ConfigProvider type declaration fails to parse under this repo's
// pinned TypeScript version, tripping a false-positive import/named error
// even though the export exists at runtime (see theme-context.tsx).
/* eslint-disable import/named */
import {
	Button,
	ConfigProvider,
	Form,
	Input,
	theme as antdTheme,
	Typography,
} from 'antd';
/* eslint-enable import/named */
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
import { useForceLightTheme } from './use-force-light-theme';

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
	useForceLightTheme();

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
		<ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
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
							rules={[
								{ required: true, message: 'Please input your password!' },
							]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Password"
							/>
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
		</ConfigProvider>
	);
};

export default SignUpPage;
