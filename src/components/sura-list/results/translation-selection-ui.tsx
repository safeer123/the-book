import { Segmented, Spin } from 'antd';
import { useTranslations } from 'data/use-translations';
import {
	HiddenVerseText,
	useTranslationVisibility,
} from '../../../context/translation-visibility-context';
import LanguageTabs from './language-tabs';
import { capitalizeObjectKeys } from './utils';
import { TranslationFooter } from './styles';
import styled from 'styled-components';

const HideTranslationsLabel = styled.span`
	margin-right: 8px;
`;

const CompactToggleLabel = styled.span`
	font-size: 11px;
	color: rgba(0, 0, 0, 0.45);
	white-space: nowrap;
	margin-left: 4px;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

interface TranslationSelectionUIProps {
	compact?: boolean;
}

const TranslationSelectionUI = ({ compact }: TranslationSelectionUIProps) => {
	const { data, isLoading } = useTranslations();
	const { hiddenText, setHiddenText } = useTranslationVisibility();

	if (isLoading || data?.translationsByLang === undefined) {
		return <Spin />;
	}

	const hideSelector = (
		<Segmented
			size={compact ? 'small' : 'middle'}
			value={hiddenText}
			onChange={(value) => setHiddenText(value as HiddenVerseText)}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'arabic', label: 'Arabic' },
				{ value: 'translation', label: 'Translation' },
			]}
		/>
	);

	return (
		<>
			<LanguageTabs
				data={capitalizeObjectKeys(data?.translationsByLang || {})}
				compact={compact}
				extraTopBarContent={
					compact ? (
						<>
							<CompactToggleLabel>Hide:</CompactToggleLabel>
							{hideSelector}
						</>
					) : null
				}
			/>
			{!compact && (
				<TranslationFooter>
					<HideTranslationsLabel>Hide:</HideTranslationsLabel>
					{hideSelector}
				</TranslationFooter>
			)}
		</>
	);
};

export default TranslationSelectionUI;
