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

const TranslationSelectionUI = () => {
	const { data, isLoading } = useTranslations();
	const { hideTranslations, toggleHideTranslations } =
		useTranslationVisibility();

	if (isLoading || data?.translationsByLang === undefined) {
		return <Spin />;
	}

	return (
		<>
			<LanguageTabs
				data={capitalizeObjectKeys(data?.translationsByLang || {})}
			/>
			<TranslationFooter>
				<HideTranslationsLabel>Hide Translations:</HideTranslationsLabel>
				<Switch checked={hideTranslations} onChange={toggleHideTranslations} />
			</TranslationFooter>
		</>
	);
};

export default TranslationSelectionUI;
