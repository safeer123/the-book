import { Link, createBrowserRouter, RouterProvider } from 'react-router-dom';
import ApiTest from 'components/api-test';
import SuraList from 'components/sura-list';
import WordGame from 'components/word-game';
import { styled } from 'styled-components';

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
					<Link to="/api-test">Home</Link>
				</div>
				<div>
					<Link to="/suras">Sura List</Link>
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
		path: 'word-game',
		element: <WordGame />,
	},
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
