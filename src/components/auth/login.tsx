/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-console */
import { LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
// antd's ConfigProvider type declaration fails to parse under this repo's
// pinned TypeScript version, tripping a false-positive import/named error
// even though the export exists at runtime (see theme-context.tsx).
/* eslint-disable import/named */
import {
	Button,
	ConfigProvider,
	Form,
	theme as antdTheme,
	Typography,
} from 'antd';
/* eslint-enable import/named */
import { useUserAuth } from 'auth/auth-context';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
	Brand,
	BrandSubtitle,
	BrandTitle,
	CompactFormWrapper,
	Container,
	Divider,
	ErrorMessage,
	FormContainer,
	GoogleButton,
	SignUpLink,
	StyledInput,
	StyledPasswordInput,
	Title,
} from './styles';
import { useForceLightTheme } from './use-force-light-theme';
import { useReturnTo, withReturnTo } from 'auth/return-to';

const PRIMARY_COLOR = 'rgb(14, 2, 121)';

interface FormValues {
	email: string;
	password: string;
}

const SignInPage = () => {
	const [form] = Form.useForm<FormValues>();
	const [error, setError] = useState<string | null>(null);

	const { googleSignIn, logIn } = useUserAuth();
	const navigate = useNavigate();
	const returnTo = useReturnTo();
	useForceLightTheme();

	const handleSubmit = async (values: FormValues) => {
		try {
			await logIn(values.email, values.password);
			navigate(returnTo, { replace: true });
		} catch (errorObj) {
			setError('Error signing in. Please check your email and password');
			console.log('Error : ', errorObj);
		}
	};

	const handleGoogleSignIn = async () => {
		try {
			await googleSignIn();
			navigate(returnTo, { replace: true });
		} catch (errorObj) {
			setError('Error signing in with Google');
			console.log('Error : ', errorObj);
		}
	};

	return (
		<ConfigProvider
			theme={{
				algorithm: antdTheme.defaultAlgorithm,
				token: { colorPrimary: PRIMARY_COLOR },
			}}
		>
			<Container>
				<Brand>
					<BrandTitle>The Book</BrandTitle>
					<BrandSubtitle>Read, listen, and study the Quran</BrandSubtitle>
				</Brand>
				<FormContainer>
					<Title>Sign in to The Book</Title>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<CompactFormWrapper>
						<Form
							form={form}
							name="signin"
							initialValues={{ remember: true }}
							onFinish={handleSubmit}
							layout="vertical"
							requiredMark={false}
						>
							<Form.Item
								name="email"
								label="Email"
								rules={[
									{ required: true, message: 'Please input your email!' },
									{ type: 'email', message: 'Please enter a valid email!' },
								]}
							>
								<StyledInput prefix={<MailOutlined />} placeholder="Email" />
							</Form.Item>

							<Form.Item
								name="password"
								label="Password"
								rules={[
									{ required: true, message: 'Please input your password!' },
								]}
							>
								<StyledPasswordInput
									prefix={<LockOutlined />}
									placeholder="Password"
								/>
							</Form.Item>

							<Form.Item>
								<Button type="primary" htmlType="submit" block>
									Sign In
								</Button>
							</Form.Item>

							<Divider>or</Divider>

							<Form.Item>
								<GoogleButton
									icon={<GoogleOutlined />}
									onClick={handleGoogleSignIn}
								>
									Sign in with Google
								</GoogleButton>
							</Form.Item>
						</Form>
					</CompactFormWrapper>

					<SignUpLink>
						<Typography.Text>
							Don&apos;t have an account?{' '}
							<Link
								to={withReturnTo('/signup', returnTo)}
								style={{ color: PRIMARY_COLOR }}
							>
								Sign Up
							</Link>
						</Typography.Text>
					</SignUpLink>
				</FormContainer>
			</Container>
		</ConfigProvider>
	);
};

export default SignInPage;
