import { Button, Space, Spin } from 'antd';
import { useTranslations } from 'data/use-translations';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';
import LanguageTabs from './language-tabs';
import { capitalizeObjectKeys } from './utils';
import { TranslationFooter } from './styles';

interface TranslationSelectionUIProps {
	compact?: boolean;
}

const TranslationSelectionUI = ({ compact }: TranslationSelectionUIProps) => {
	const { data, isLoading } = useTranslations();
	const { hideArabic, hideTranslations, setHiddenText } =
		useTranslationVisibility();

	if (isLoading || data?.translationsByLang === undefined) {
		return <Spin />;
	}

	const showArabic = !hideArabic;
	const showTranslation = !hideTranslations;

	// Each button toggles its part on or off. The last part still showing
	// can't be turned off, so Arabic and translation are never both hidden.
	const toggleArabic = () => setHiddenText(showArabic ? 'arabic' : 'none');
	const toggleTranslation = () =>
		setHiddenText(showTranslation ? 'translation' : 'none');

	const size = compact ? 'small' : 'middle';
	const visibilitySelector = (
		<Space.Compact size={size}>
			<Button
				type={showArabic ? 'primary' : 'default'}
				aria-pressed={showArabic}
				onClick={showArabic && !showTranslation ? undefined : toggleArabic}
			>
				Arabic
			</Button>
			<Button
				type={showTranslation ? 'primary' : 'default'}
				aria-pressed={showTranslation}
				onClick={showTranslation && !showArabic ? undefined : toggleTranslation}
			>
				Translation
			</Button>
		</Space.Compact>
	);

	return (
		<>
			<LanguageTabs
				data={capitalizeObjectKeys(data?.translationsByLang || {})}
				compact={compact}
				extraTopBarContent={compact ? visibilitySelector : null}
			/>
			{!compact && <TranslationFooter>{visibilitySelector}</TranslationFooter>}
		</>
	);
};

export default TranslationSelectionUI;
