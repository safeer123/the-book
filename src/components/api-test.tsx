/* eslint-disable react/jsx-key */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import axios from 'axios';
import { useMemo, useState } from 'react';
import { Button, Collapse as CollapseAntd } from 'antd';
import { styled } from 'styled-components';

const Collapse = styled(CollapseAntd)`
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

const TestItemsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	text-align: left;
`;

const ContentWrapper = styled.div`
	display: flex;
	overflow-y: auto;
`;

const TestInput = styled.input`
	width: 50vw;
	height: 30px;
	margin: 16px;
	background-color: transparent;
	border: none;

	&:focus {
		background-color: #dfe3eec5;
		border: 1px solid #ed0000;
		border-radius: 3px;
	}
`;

const ItemHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 16px 0;
	align-items: center;
`;

const ItemHeaderLeft = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;
`;

const ItemHeaderRight = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;
	padding-right: 32px;
`;

const NewTestButton = styled(Button)`
	margin: 16px;
`;

interface EndpointItem {
	id: number;
	url: string;
}

const initValues = [
	{
		id: 1,
		url: 'https://api.quran.com/api/v4/quran/verses/uthmani',
	},
	{
		id: 2,
		url: 'https://api.quran.com/api/v4/resources/translations',
	},
	{
		id: 3,
		url: 'https://api.quran.com/api/v4/quran/translations/131',
	},
	{
		id: 4,
		url: 'https://api.quran.com/api/v4/resources/tafsirs',
	},
	{
		id: 5,
		url: 'https://api.quran.com/api/v4/quran/tafsirs/164?verse_key=114:1',
	},
];

export default function App() {
	const [endpointList, setEndpointList] = useState<EndpointItem[]>(initValues);
	const [dataContent, setDataContent] = useState<{ [key: number]: string }>({});

	const fetchData = (ep: EndpointItem) => {
		if (ep?.url?.trim()) {
			console.log('fetching --> ', ep?.url);
			setDataContent({
				...dataContent,
				[ep.id]: '-loading-',
			});
			axios
				.get(ep?.url, {
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				})
				.then((resp) => {
					setDataContent({
						...dataContent,
						[ep.id]: JSON.stringify(resp?.data || {}, null, 2),
					});
				});
		}
	};

	const removeEpItem = (ep: EndpointItem) => {
		setEndpointList((epList) => epList.filter((e) => e.id !== ep.id));
		setDataContent((dc) => {
			delete dc[ep.id];
			return { ...dc };
		});
	};

	const newTestItem = () => {
		setEndpointList((epList) => {
			const newItem = {
				id: (epList?.[epList.length - 1]?.id || 0) + 1,
				url: '',
			};
			return [...epList, newItem];
		});
	};

	const items = useMemo(() => {
		return endpointList.map((ep) => {
			let statusInfo = '';
			if (dataContent[ep.id] === '-loading-') {
				statusInfo = '⚙️';
			} else if (dataContent[ep.id]) {
				statusInfo = '✔️';
			}

			return {
				key: ep.id,
				label: (
					<ItemHeader>
						<ItemHeaderLeft>
							<TestInput
								type="text"
								onChange={(e) => {
									setEndpointList((epList) =>
										epList.map((epItem) => {
											if (epItem.id === ep.id) {
												return {
													...ep,
													url: e.target.value,
												};
											}
											return epItem;
										})
									);
								}}
								value={ep.url}
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(event) => {
									if (event.key === 'Enter') {
										fetchData(ep);
									}
									event.stopPropagation();
								}}
							/>
							<span>{statusInfo}</span>
						</ItemHeaderLeft>
						<ItemHeaderRight>
							<Button type="text" onClick={() => removeEpItem(ep)}>
								⛔
							</Button>
						</ItemHeaderRight>
					</ItemHeader>
				),
				children: (
					<ContentWrapper>
						<textarea
							value={dataContent[ep.id] || ''}
							className="response-area"
						/>
					</ContentWrapper>
				),
			};
		});
	}, [endpointList, dataContent]);

	return (
		<div className="App">
			<TestItemsWrapper>
				<Collapse items={items} />
			</TestItemsWrapper>
			<NewTestButton type="primary" onClick={newTestItem}>
				+ New Test
			</NewTestButton>
		</div>
	);
}
