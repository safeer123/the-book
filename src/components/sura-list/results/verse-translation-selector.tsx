import React from 'react';
import { Button, Tooltip, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { isPhone } from 'utils/device-utils';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';
import CurrentVerseTranslationText from './current-verse-translation-text';
import TranslationSelectionUI from './translation-selection-ui';
import {
	TranslationSelectorContainer,
	IPopoverWrapper,
	BtnLabel,
} from './styles';

const VerseTranslationSelector = ({
	trText,
	searchKey,
}: {
	trText: string;
	searchKey?: string;
}) => {
	const { hideTranslations } = useTranslationVisibility();

	const TButton = (
		<Button className="verse-tr-selector-btn" type="text">
			<BtnLabel>{'T'}</BtnLabel>
		</Button>
	);

	const IButton = (
		<Button
			className="verse-info-selector-btn"
			type="text"
			icon={
				<InfoCircleOutlined
					style={{ fontSize: '18px', color: 'rgb(14, 2, 121)' }}
				/>
			}
		/>
	);

	const TPopover = (
		<Popover trigger={'click'} content={<TranslationSelectionUI />}>
			{isPhone ? (
				TButton
			) : (
				<Tooltip title="Select translation" placement="bottom">
					{TButton}
				</Tooltip>
			)}
		</Popover>
	);

	const IPopover = (
		<Popover
			trigger={'hover'}
			content={
				<CurrentVerseTranslationText trText={trText} searchKey={searchKey} />
			}
		>
			{isPhone ? (
				IButton
			) : (
				<Tooltip title="Current Translation" placement="bottom">
					{IButton}
				</Tooltip>
			)}
		</Popover>
	);

	return (
		<TranslationSelectorContainer>
			{TPopover}
			{hideTranslations && <IPopoverWrapper>{IPopover}</IPopoverWrapper>}
		</TranslationSelectorContainer>
	);
};

export default VerseTranslationSelector;
