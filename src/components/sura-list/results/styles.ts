import styled from 'styled-components';
import { Collapse as CollapseAntd, Button, Card } from 'antd';

export const Collapse = styled(CollapseAntd)`
	border: none;
	background-color: transparent;

	&& .ant-collapse-content {
		background-color: transparent;
		border-top: none;
		border-top: 0.5px dashed #545454;
	}

	&& .ant-collapse-header {
		padding: 0px 0px;
		align-items: center;
	}

	&& .ant-collapse-item {
		border-bottom: none;
		-webkit-box-shadow: -15px 17px 9px -18px rgba(0, 0, 0, 0.75);
		-moz-box-shadow: -15px 17px 9px -18px rgba(0, 0, 0, 0.75);
		box-shadow: -15px 17px 9px -18px rgba(0, 0, 0, 0.75);
	}
`;

export const SpinWrapper = styled.div`
	width: 100%;
	text-align: center;
	height: 100%;
	position: relative;
	.ant-spin {
		margin: 20%;
	}
`;

export const ArabicVerseWrapper = styled.div`
	margin: 16px;
`;

export const ArabicVerseText = styled.span`
	font-family: 'Amiri Quran';
	color: rgb(14, 2, 121);
	font-size: 42px;
	font-weight: 400;
	font-style: normal;

	svg {
		width: 36px;
		cursor: pointer;
		filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));

		&:hover {
			opacity: 0.8;
		}

		@media (min-width: 320px) {
			width: 30px;
			margin-bottom: -16px;
			margin-right: 8px;
		}

		@media (min-width: 961px) {
			width: 36px;
			margin-bottom: -10px;
			margin-right: 16px;
		}
	}
`;

export const BismiWrapper = styled.div`
	margin: 24px 16px;
	font-family: 'Amiri Quran';
	color: rgb(57, 44, 177);
	font-size: 36px;
	font-weight: 400;
`;

export const EngTranslation = styled.div`
	color: rgb(7, 1, 65);
	font-size: 24px;
	letter-spacing: 0.01in;
`;

export const TranslationContainer = styled.div`
	padding: 12px;
	max-width: 400px;
	max-height: 300px;
	overflow-y: auto;
`;

export const TranslationHighlight = styled.span`
	.text-highlight {
		background-color: yellow;
	}
`;

export const TranslationFooter = styled.div`
	margin-top: 10px;
	padding: 8px;
	border-top: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const TranslationSelectorContainer = styled.div`
	display: flex;
	align-items: center;
`;

export const IPopoverWrapper = styled.span`
	margin-left: 8px;
`;

export const BtnLabel = styled.span`
	font-size: 18px;
	color: rgb(14, 2, 121);
	font-weight: 600;
`;

export const StyledCard = styled(Card)<{ $selected: boolean }>`
	margin-bottom: 8px;
	background-color: ${({ $selected }) =>
		$selected ? 'rgba(52, 84, 244, 0.149)' : '#FFF'};
	cursor: pointer;
`;

export const FooterItems = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const StyledTrButton = styled(Button)`
	font-size: 18px;
	color: rgba(10, 10, 10, 0.604);
	border: 0.8px dashed rgba(10, 10, 10, 0.449);
`;

export const TabPaneContent = styled.div`
	height: 300px;
	width: 400px;
	overflow-y: auto;

	.tr-item-title {
		font-size: 16px;
	}

	.tr-item-subtitle {
		font-size: 12px;
	}
`;
