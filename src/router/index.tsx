import { Link, createBrowserRouter, RouterProvider } from 'react-router-dom';
import ApiTest from 'components/api-test';
import SuraList from 'components/sura-list';
import WordGame from 'components/word-game';
import VideoTextBinding from 'components/video-text-binding';
import AIPromptApp from 'components/ai-prompt-test';
import SignInPage from 'components/auth/login';
import SignUpPage from 'components/auth/signup';
import ProtectedRoutes from './protected-routes';
import SignOutPage from 'components/auth/logout';
import { Playground } from 'components/playground';
import EditProjects from 'components/edit-projects';
import MobileQBind from 'components/mobile-qbind';
import { styled } from 'styled-components';
import { isPhone } from 'utils/device-utils';

const HomeWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin: 36px;
	position: absolute;
`;

const HomePageWrapper = styled.div`
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 40px;
	padding: 24px;
	overflow-y: auto;
`;

const HomeHeading = styled.div`
	text-align: center;
`;

const HomeTitle = styled.h1`
	margin: 0;
	font-family: 'Amiri Quran', serif;
	font-size: 48px;
	font-weight: 400;
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		color: #e8d9c0;
	}
`;

const HomeSubtitle = styled.p`
	margin: 8px 0 0;
	font-size: 15px;
	color: rgba(7, 1, 65, 0.6);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const LinkGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
	gap: 16px;
	width: 100%;
	max-width: 720px;
`;

const LinkCard = styled(Link)`
	display: flex;
	align-items: flex-start;
	gap: 14px;
	padding: 18px 20px;
	border-radius: 14px;
	text-decoration: none;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(14, 2, 121, 0.12);
	box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
	transition: transform 0.15s ease, box-shadow 0.15s ease,
		border-color 0.15s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
		border-color: rgba(14, 2, 121, 0.28);
	}

	[data-theme='dark'] & {
		background: #1e1b33;
		border-color: rgba(156, 142, 224, 0.2);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
	}

	[data-theme='dark'] &:hover {
		border-color: rgba(156, 142, 224, 0.5);
		box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5);
	}
`;

const LinkIcon = styled.span`
	font-size: 26px;
	line-height: 1;
`;

const LinkText = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const LinkTitle = styled.span`
	font-size: 16px;
	font-weight: 600;
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		color: #e8e2fa;
	}
`;

const LinkDescription = styled.span`
	font-size: 13px;
	color: rgba(7, 1, 65, 0.55);
	line-height: 1.4;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const homeLinks = [
	{
		to: '/suras',
		icon: '📖',
		title: 'Read & Search',
		description: 'Browse chapters, search verses, and listen along.',
	},
	{
		to: '/verse-binding',
		icon: '🎬',
		title: 'Recitation Timeline Editor',
		description: 'Bind a recitation video to verses, timestamp by timestamp.',
	},
	{
		to: '/qbind',
		icon: '▶️',
		title: 'Watch & Follow',
		description: 'Play a bound recitation video with verses following along.',
	},
	{
		to: '/edit-projects',
		icon: '🗂️',
		title: 'Project Manager',
		description: 'Organize and manage your recitation-to-verse projects.',
	},
];

const mobileHomeLink = {
	to: '/mqbind',
	icon: '📱',
	title: 'Mobile Quran Player',
	description: 'A pocket-friendly recitation player for on-the-go listening.',
};

const HomePage = () => (
	<HomePageWrapper>
		<HomeHeading>
			<HomeTitle>The Book</HomeTitle>
			<HomeSubtitle>Read, listen, and study the Quran</HomeSubtitle>
		</HomeHeading>
		<LinkGrid>
			{[...homeLinks, ...(isPhone ? [mobileHomeLink] : [])].map((link) => (
				<LinkCard to={link.to} key={link.to}>
					<LinkIcon>{link.icon}</LinkIcon>
					<LinkText>
						<LinkTitle>{link.title}</LinkTitle>
						<LinkDescription>{link.description}</LinkDescription>
					</LinkText>
				</LinkCard>
			))}
		</LinkGrid>
	</HomePageWrapper>
);

const devHome = (
	<HomeWrapper>
		<div>
			<Link to="/">🏠 Home</Link>
		</div>
		<div>
			<Link to="/api-test">Test Quran APIs</Link>
		</div>
		<div>
			<Link to="/ai-prompt-app">AI Prompt App</Link>
		</div>
		<div>
			<Link to="/playground-fb-db">Firebase DB CRUD Test</Link>
		</div>
	</HomeWrapper>
);

const router = createBrowserRouter([
	{
		element: <ProtectedRoutes />,
		children: [
			{
				path: '/',
				element: <HomePage />,
			},
			{
				path: 'dev',
				element: devHome,
			},
			{
				path: 'verse-binding',
				element: <VideoTextBinding />,
			},
			{
				path: 'verse-binding/:pid',
				element: <VideoTextBinding />,
			},
			{
				path: 'ai-prompt-app',
				element: <AIPromptApp />,
			},
			{
				path: 'api-test',
				element: <ApiTest />,
			},
			{
				path: 'playground-fb-db',
				element: <Playground />,
			},
			{
				path: 'edit-projects',
				element: <EditProjects />,
			},
		],
	},

	{
		path: 'login',
		element: <SignInPage />,
	},
	{
		path: 'signup',
		element: <SignUpPage />,
	},
	{
		path: 'logout',
		element: <SignOutPage />,
	},
	{
		path: 'suras',
		element: <SuraList />,
	},
	{
		path: 'qbind',
		element: <VideoTextBinding viewerMode />,
	},
	{
		path: 'qbind/:pid',
		element: <VideoTextBinding viewerMode />,
	},
	{
		path: 'mqbind',
		element: <MobileQBind />,
	},
	{
		path: 'mqbind/:pid',
		element: <MobileQBind />,
	},
	{
		path: 'word-game',
		element: <WordGame />,
	},
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
