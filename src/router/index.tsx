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

const HomePage = () => (
	<HomeWrapper>
		<div>
			<Link to="/suras">Search in The Book</Link>
		</div>
		<div>
			<Link to="/verse-binding">Recitation-to-verse Editor</Link>
		</div>
		<div>
			<Link to="/qbind">Recitation-to-verse Player</Link>
		</div>
		{isPhone && (
			<div>
				<Link to="/mqbind">📱 Mobile Quran Player</Link>
			</div>
		)}
		<div>
			<Link to="/edit-projects">Project Manager</Link>
		</div>
	</HomeWrapper>
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
