import { Segmented } from 'antd';
import AppTooltip from 'components/app-tooltip';
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
						<AppTooltip title="Large text">
							<SizeLabel $big>A</SizeLabel>
						</AppTooltip>
					),
				},
				{
					value: 'small',
					label: (
						<AppTooltip title="Small text">
							<SizeLabel>A</SizeLabel>
						</AppTooltip>
					),
				},
			]}
		/>
	);
};

export default TextSizeToggle;
