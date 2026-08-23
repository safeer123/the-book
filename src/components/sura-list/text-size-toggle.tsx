import { Segmented, Tooltip } from 'antd';
import styled from 'styled-components';
import {
	useTranslationVisibility,
	VerseTextSize,
} from '../../context/translation-visibility-context';

const SizeLabel = styled.span<{ $big?: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-family: Georgia, 'Times New Roman', serif;
	font-weight: 700;
	line-height: 1;
	font-size: ${({ $big }) => ($big ? '18px' : '12px')};
	padding: 0 2px;
`;

const TextSizeToggle = () => {
	const { textSize, setTextSize } = useTranslationVisibility();

	return (
		<Segmented
			value={textSize}
			onChange={(value) => setTextSize(value as VerseTextSize)}
			options={[
				{
					value: 'big',
					label: (
						<Tooltip title="Large text">
							<SizeLabel $big>A</SizeLabel>
						</Tooltip>
					),
				},
				{
					value: 'small',
					label: (
						<Tooltip title="Small text">
							<SizeLabel>A</SizeLabel>
						</Tooltip>
					),
				},
			]}
		/>
	);
};

export default TextSizeToggle;
