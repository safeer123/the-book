import { Link, createBrowserRouter, RouterProvider } from 'react-router-dom';
import ApiTest from 'components/api-test';
import SuraList from 'components/sura-list';
import WordGame from 'components/word-game';
import { styled } from 'styled-components';
import VideoTextBinding from 'components/video-text-binding';

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
					<Link to="/api-test">Test APIs</Link>
				</div>
				<div>
					<Link to="/suras">Search in The Book</Link>
				</div>
				<div>
					<Link to="/verse-binding">Recitation-to-verse binding</Link>
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
		path: 'word-game',
		element: <WordGame />,
	},
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
