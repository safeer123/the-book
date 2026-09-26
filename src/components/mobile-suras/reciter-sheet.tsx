import { useRef } from 'react';
import styled from 'styled-components';
import { CheckOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useMobilePlayer } from './player-context';
import Sheet from './sheet';
import { savePreferredReciter } from './utils';

const List = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const Row = styled.button<{ $selected: boolean }>`
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	min-height: 64px;
	padding: 10px 14px;
	border-radius: 14px;
	text-align: left;
	cursor: pointer;
	color: inherit;
	border: 1px solid
		${({ $selected }) =>
			$selected ? 'rgba(14, 2, 121, 0.35)' : 'rgba(14, 2, 121, 0.1)'};
	background: ${({ $selected }) =>
		$selected ? 'rgba(14, 2, 121, 0.06)' : 'transparent'};

	&:active {
		background: rgba(14, 2, 121, 0.08);
	}

	[data-theme='dark'] & {
		border-color: ${({ $selected }) =>
			$selected ? 'rgba(156, 142, 224, 0.6)' : 'rgba(156, 142, 224, 0.18)'};
		background: ${({ $selected }) =>
			$selected ? 'rgba(156, 142, 224, 0.14)' : 'transparent'};
	}
`;

const Avatar = styled.span`
	flex-shrink: 0;
	width: 38px;
	height: 38px;
	border-radius: 50%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	background: rgba(14, 2, 121, 0.08);
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		background: rgba(156, 142, 224, 0.18);
		color: #d8d0f8;
	}
`;

const Text = styled.span`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const Name = styled.span`
	font-size: 15px;
	font-weight: 600;
`;

const Sub = styled.span`
	font-size: 12px;
	opacity: 0.6;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

interface Props {
	// Verse to start from once a reciter is picked; the sheet is open while
	// this is set.
	verseKey: string | undefined;
	onClose: () => void;
}

const ReciterSheet = ({ verseKey, onClose }: Props) => {
	const { recitationsByChapter, activeProject, start } = useMobilePlayer();
	// Keep showing the last list while the sheet slides away.
	const lastKeyRef = useRef(verseKey);
	if (verseKey) lastKeyRef.current = verseKey;
	const shownKey = lastKeyRef.current;
	const chapterId = shownKey ? Number(shownKey.split(':')[0]) : 0;
	const recitations = recitationsByChapter.get(chapterId) || [];

	return (
		<Sheet title="Choose a reciter" open={Boolean(verseKey)} onClose={onClose}>
			<List>
				{recitations.map(({ reciter, project }) => (
					<Row
						key={project.videoUrl}
						type="button"
						$selected={activeProject?.videoUrl === project.videoUrl}
						onClick={() => {
							if (!shownKey) return;
							savePreferredReciter(reciter);
							start(project, shownKey);
							onClose();
						}}
					>
						<Avatar>
							<CustomerServiceOutlined />
						</Avatar>
						<Text>
							<Name>{reciter}</Name>
							<Sub>Starts at verse {shownKey?.split(':')[1]}</Sub>
						</Text>
						{activeProject?.videoUrl === project.videoUrl && <CheckOutlined />}
					</Row>
				))}
			</List>
		</Sheet>
	);
};

export default ReciterSheet;
