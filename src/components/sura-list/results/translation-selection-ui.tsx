import { Spin, Switch } from 'antd';
import { useTranslations } from 'data/use-translations';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';
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
`;

interface TranslationSelectionUIProps {
	compact?: boolean;
}

const TranslationSelectionUI = ({ compact }: TranslationSelectionUIProps) => {
	const { data, isLoading } = useTranslations();
	const { hideTranslations, toggleHideTranslations } =
		useTranslationVisibility();

	if (isLoading || data?.translationsByLang === undefined) {
		return <Spin />;
	}

	const hideToggle = compact ? (
		<>
			<CompactToggleLabel>Hide:</CompactToggleLabel>
			<Switch
				size="small"
				checked={hideTranslations}
				onChange={toggleHideTranslations}
			/>
		</>
	) : null;

	return (
		<>
			<LanguageTabs
				data={capitalizeObjectKeys(data?.translationsByLang || {})}
				compact={compact}
				extraTopBarContent={hideToggle}
			/>
			{!compact && (
				<TranslationFooter>
					<HideTranslationsLabel>Hide Translations:</HideTranslationsLabel>
					<Switch
						checked={hideTranslations}
						onChange={toggleHideTranslations}
					/>
				</TranslationFooter>
			)}
		</>
	);
};

export default TranslationSelectionUI;
