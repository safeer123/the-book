import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, Card, Tooltip, Input, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { TranslationData, TranslationItem } from 'data/use-translations';
import { DEFAULT_TRANSLATION_ID } from 'data/constants';
import { getTopHitTranslations, updateHitCount } from './top-hit-translations';

const { TabPane } = Tabs;
const { Search } = Input;

const StyledCard = styled(Card)<{ $selected: boolean }>`
	margin-bottom: 8px;
	background-color: ${({ $selected }) =>
		$selected ? 'rgba(52, 84, 244, 0.149)' : '#FFF'};
	cursor: pointer;
`;

const FooterItems = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const StyledTrButton = styled(Button)`
	font-size: 18px;
	color: rgba(10, 10, 10, 0.604);
	border: 0.8px dashed rgba(10, 10, 10, 0.449);
`;

const TabPaneContent = styled.div`
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

type LanguagesProps = {
	data: TranslationData['translationsByLang'];
};

const LanguageTabs = ({ data }: LanguagesProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeKey, setActiveKey] = useState('');
	const [filteredData, setFilteredData] = useState<
		TranslationData['translationsByLang']
	>({});

	const selectedTrId = useMemo(
		() => +(searchParams.get('tr') || DEFAULT_TRANSLATION_ID),
		[searchParams]
	);

	const topHitTranslations = useMemo(() => {
		return getTopHitTranslations();
	}, [searchParams.get('tr')]);

	const onClickTranslationItem = (item: TranslationItem) => {
		updateHitCount(item);
		setSearchParams((prev) => {
			prev.set('tr', `${item.id}`);
			return prev;
		});
	};

	useEffect(() => {
		const [lang] =
			Object.entries(data || {}).find(([, translations]) => {
				return translations.find((trItem) => trItem.id === selectedTrId);
			}) || [];
		setActiveKey(lang || '');
	}, [selectedTrId, data]);

	useEffect(() => {
		setFilteredData(data);
	}, [data]);

	const onSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const searchKey = e.target.value || '';

		const filtered: TranslationData['translationsByLang'] = {};
		Object.entries(data || {}).forEach(([lang, translations]) => {
			if (lang.toLowerCase().includes(searchKey.toLowerCase())) {
				filtered[lang] = translations;
			}
		});
		setFilteredData(filtered);
		if (!filtered[activeKey]) {
			setActiveKey(Object.entries(filtered || {})?.[0]?.[0] || '');
		}
	};

	if (!filteredData) return <></>;

	return (
		<>
			<Tabs
				onTabClick={(key) => setActiveKey(key)}
				tabPosition="left"
				style={{ height: 300 }}
				tabBarStyle={{ width: 200 }}
				activeKey={activeKey}
			>
				{Object.keys(filteredData).map((language) => (
					<TabPane tab={language} key={language}>
						<TabPaneContent>
							{filteredData[language].map((item, index) => (
								<StyledCard
									$selected={item.id === selectedTrId}
									size="small"
									key={index}
									hoverable
									onClick={() => onClickTranslationItem(item)}
								>
									<div className="tr-item-title">{item.name}</div>
									<div className="tr-item-subtitle">
										Author: {item.author_name}
									</div>
								</StyledCard>
							))}
						</TabPaneContent>
					</TabPane>
				))}
				<TabPane tab={''} key={''}>
					<TabPaneContent />
				</TabPane>
			</Tabs>
			<FooterItems>
				<Search
					placeholder="Search"
					onChange={onSearch}
					style={{ width: 300 }}
				/>
				{topHitTranslations.map((item) => (
					<Tooltip title={`${item.name} (${item.language_name})`} key={item.id}>
						<StyledTrButton
							onClick={() => onClickTranslationItem(item)}
							disabled={item.id === selectedTrId}
						>
							{item.language_name?.[0]?.toUpperCase()}
						</StyledTrButton>
					</Tooltip>
				))}
			</FooterItems>
		</>
	);
};

export default LanguageTabs;
