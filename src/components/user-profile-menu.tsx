import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Popover, Switch } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useUserAuth } from 'auth/auth-context';
import { DARK_POPOVER_STYLE, useAppTheme } from 'context/theme-context';

// Same fixed top-right slot the global theme toggle occupies — this menu
// takes over that slot (and hides the toggle, see below) once a user is
// signed in, so there's never two controls competing for the same corner.
const FloatingWrapper = styled.div`
	position: fixed;
	top: 16px;
	right: 16px;
	z-index: 900;
`;

// Matches the global ToggleButton's 44px circular footprint/shadow so the
// two controls read as the same "slot" regardless of which one is showing.
const StyledAvatar = styled(Avatar)`
	width: 44px !important;
	height: 44px !important;
	line-height: 44px !important;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const ProfileMenuWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const UserDisplayName = styled.div`
	color: #000;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 8px;

	[data-theme='dark'] & {
		color: #e8e2fa;
	}
`;

const UserEmail = styled.div`
	color: #707070;
	font-size: 12px;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const ThemeSwitchRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding-top: 4px;
	border-top: 1px solid #f0f0f0;
	color: #000;
	font-size: 13px;

	[data-theme='dark'] & {
		color: #e8e2fa;
		border-top-color: rgba(156, 142, 224, 0.2);
	}
`;

interface Props {
	// Some pages (video-text-binding) already position this menu inside
	// their own top toolbar; others (Home, /suras) have no such toolbar and
	// need it floated in the corner like the global toggle it replaces.
	floating?: boolean;
}

const UserProfileMenu = ({ floating = true }: Props) => {
	const { user } = useUserAuth();
	const { mode, toggleTheme } = useAppTheme();
	const navigate = useNavigate();

	// The global toggle would otherwise sit in the exact same corner as this
	// menu; hide it for as long as this menu is mounted and showing a user.
	useEffect(() => {
		if (!user) return undefined;
		const root = document.documentElement;
		root.setAttribute('data-hide-theme-toggle', 'true');
		return () => root.removeAttribute('data-hide-theme-toggle');
	}, [user]);

	if (!user) return null;

	const avatarProps = {
		src: user?.photoURL ? (
			<img src={user.photoURL} referrerPolicy="no-referrer" />
		) : undefined,
	};

	const menu = (
		<Popover
			trigger="hover"
			placement="bottomRight"
			overlayInnerStyle={mode === 'dark' ? DARK_POPOVER_STYLE : undefined}
			content={
				<ProfileMenuWrapper>
					<UserDisplayName>
						<Avatar {...avatarProps}>
							{user?.displayName?.[0]?.toUpperCase()}
						</Avatar>
						{user?.displayName}
					</UserDisplayName>
					<UserEmail>{user?.email}</UserEmail>
					<ThemeSwitchRow>
						{mode === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}
						<Switch
							size="small"
							checked={mode === 'dark'}
							onChange={toggleTheme}
						/>
					</ThemeSwitchRow>
					<Button
						icon={<LogoutOutlined />}
						size="small"
						onClick={() => navigate('/logout')}
					>
						Logout
					</Button>
				</ProfileMenuWrapper>
			}
		>
			<StyledAvatar {...avatarProps}>
				{user?.displayName?.[0]?.toUpperCase()}
			</StyledAvatar>
		</Popover>
	);

	return floating ? <FloatingWrapper>{menu}</FloatingWrapper> : menu;
};

export default UserProfileMenu;
