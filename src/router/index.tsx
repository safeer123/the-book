import { Link, createBrowserRouter, RouterProvider } from 'react-router-dom';
import ApiTest from 'components/api-test';
import SuraList from 'components/sura-list';
import WordGame from 'components/word-game';
import { styled } from 'styled-components';
import VideoTextBinding from 'components/video-text-binding';
import AIPromptApp from 'components/ai-prompt-test';

const HomeWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin: 36px;
	position: absolute;
`;
const router = createBrowserRouter([
	{
		path: '/',
		element: (
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
		),
	},
	{
		path: 'dev',
		element: (
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
			</HomeWrapper>
		),
	},
	{
		path: 'api-test',
		element: <ApiTest />,
	},
	{
		path: 'suras',
		element: <SuraList />,
	},
	{
		path: 'verse-binding',
		element: <VideoTextBinding />,
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
	{
		path: 'ai-prompt-app',
		element: <AIPromptApp />,
	},
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
