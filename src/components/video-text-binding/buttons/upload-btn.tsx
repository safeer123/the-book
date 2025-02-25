import { UploadOutlined } from '@ant-design/icons';
import { IconBtnMedium } from './icon-btn';

export const Upload = ({ onClick }: { onClick?: () => void }) => {
	return (
		<IconBtnMedium onClick={onClick} icon={<UploadOutlined />} type="text" />
	);
};
