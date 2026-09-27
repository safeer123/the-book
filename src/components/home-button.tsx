import { BookOutlined } from '@ant-design/icons';
import AppTooltip from 'components/app-tooltip';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Same 44px circular treatment as the global theme toggle / UserProfileMenu
// avatar, mirrored to the opposite (top-left) corner, so it reads as the
// same family of chrome control wherever it shows up.
const FloatingWrapper = styled.div`
	position: fixed;
	top: 16px;
	left: 16px;
	z-index: 900;
`;

const HomeLink = styled(Link)`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	color: rgba(0, 0, 0, 0.65);
	font-size: 20px;
	transition: transform 0.15s ease, color 0.15s ease;

	&:hover {
		transform: scale(1.06);
		color: rgb(14, 2, 121);
	}

	[data-theme='dark'] & {
		background: #2a2740;
		color: #c8c0e0;
	}

	[data-theme='dark'] &:hover {
		color: #e8d9c0;
	}
`;

interface Props {
	// Pages with no existing top-left chrome (Home, /suras, Project Manager)
	// float this in the corner; pages with their own top bar (the
	// recitation timeline editor) render it inline instead, since a fixed
	// position would collide with controls already living in that corner.
	floating?: boolean;
}

const HomeButton = ({ floating = true }: Props) => {
	const link = (
		<AppTooltip title="Home" placement="bottom">
			<HomeLink to="/" aria-label="Home">
				<BookOutlined />
			</HomeLink>
		</AppTooltip>
	);

	return floating ? <FloatingWrapper>{link}</FloatingWrapper> : link;
};

export default HomeButton;
