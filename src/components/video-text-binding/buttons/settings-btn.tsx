import { SettingOutlined } from '@ant-design/icons';
import { IconBtnMedium } from './icon-btn';

export const Settings = ({ onClick }: { onClick?: () => void }) => {
	return (
		<IconBtnMedium icon={<SettingOutlined />} onClick={onClick} type="text" />
	);
};
