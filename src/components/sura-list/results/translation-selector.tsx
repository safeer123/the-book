import { Button, Popover, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import sanitizeHtml from 'sanitize-html';
import { isPhone } from 'utils/device-utils';
import styled from 'styled-components';
import { DARK_POPOVER_STYLE, useAppTheme } from 'context/theme-context';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';
import TranslationSelectionUI from './translation-selection-ui';

const BtnLabel = styled.span`
	font-size: 18px;
	font-weight: 600;
`;

const TranslationContainer = styled.div`
	padding: 12px;
	max-width: 400px;
	max-height: 300px;
	overflow-y: auto;
`;

const TranslationHighlight = styled.span`
	.text-highlight {
		background-color: yellow;
	}
`;

const CompactPopoverContent = styled.div`
	width: 420px;
`;

const CurrentVerseTranslationText = ({
	trText,
	searchKey,
}: {
	trText: string;
	searchKey?: string;
}) => {
	const getSanitizedHtml = (text: string, key?: string) => {
		let htmlOut = sanitizeHtml(text);
		if (key && key.trim()) {
			const index = htmlOut.toLowerCase().indexOf(key.toLowerCase());
			if (index !== -1) {
				htmlOut =
					htmlOut.substring(0, index) +
					"<span class='text-highlight'>" +
					htmlOut.substring(index, index + key.length) +
					'</span>' +
					htmlOut.substring(index + key.length);
			}
		}
		return htmlOut;
	};

	return (
		<TranslationContainer>
			<TranslationHighlight
				dangerouslySetInnerHTML={{
					__html: getSanitizedHtml(trText, searchKey),
				}}
			/>
		</TranslationContainer>
	);
};

const TranslationSelectorContainer = styled.div`
	display: flex;
	align-items: center;
`;

const IPopoverWrapper = styled.span`
	margin-left: 8px;
`;

const InfoIcon = styled(InfoCircleOutlined)`
	font-size: 18px;
`;

export const VerseTranslationSelector = ({
	trText,
	searchKey,
}: {
	trText: string;
	searchKey?: string;
}) => {
	const { hideTranslations } = useTranslationVisibility();
	const { mode } = useAppTheme();

	const TButton = (
		<Button className="verse-tr-selector-btn" type="text">
			<BtnLabel>{'T'}</BtnLabel>
		</Button>
	);

	const IButton = (
		<Button
			className="verse-info-selector-btn"
			type="text"
			icon={<InfoIcon />}
		/>
	);

	const TPopover = (
		<Popover
			trigger={'click'}
			placement="bottomLeft"
			overlayInnerStyle={mode === 'dark' ? DARK_POPOVER_STYLE : undefined}
			content={
				<CompactPopoverContent>
					<TranslationSelectionUI compact />
				</CompactPopoverContent>
			}
		>
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
			placement="bottom"
			overlayInnerStyle={mode === 'dark' ? DARK_POPOVER_STYLE : undefined}
			content={
				<CurrentVerseTranslationText trText={trText} searchKey={searchKey} />
			}
		>
			{IButton}
		</Popover>
	);

	return (
		<TranslationSelectorContainer>
			{TPopover}
			{hideTranslations && <IPopoverWrapper>{IPopover}</IPopoverWrapper>}
		</TranslationSelectorContainer>
	);
};
