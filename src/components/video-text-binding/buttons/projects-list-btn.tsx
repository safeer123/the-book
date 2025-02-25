import { UnorderedListOutlined } from '@ant-design/icons';
import { IconBtnMedium } from './icon-btn';

export const ProjectList = ({ onClick }: { onClick?: () => void }) => {
	return (
		<IconBtnMedium
			onClick={onClick}
			icon={<UnorderedListOutlined />}
			type="text"
		/>
	);
};
