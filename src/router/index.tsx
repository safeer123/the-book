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
import { styled } from 'styled-components';

const HomeWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin: 36px;
	position: absolute;
`;

const home = (
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
				element: home,
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
		path: 'word-game',
		element: <WordGame />,
	},
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
