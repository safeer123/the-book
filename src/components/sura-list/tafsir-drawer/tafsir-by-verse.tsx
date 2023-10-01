import { AutoComplete, Spin } from 'antd';
import { useTafsirs } from 'data/use-tafsirs';
import { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { TafsirConfig, TafsirItem } from 'types';
import sanitizeHtml from 'sanitize-html';

const SpinnerWrapper = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const TafsirContentWrapper = styled.div`
	font-family: 'Amiri Quran';
	color: rgb(7 1 62);
	font-size: 20px;
	line-height: 1.2;
	padding-top: 16px;

	h1,
	h2 {
		font-size: 24px;
		margin-bottom: 16px;
		margin-block-start: 0;
		margin-block-end: 0;
		margin-inline-start: 0;
		margin-inline-end: 0;
	}
`;

interface Props {
	tafsirConfig?: TafsirConfig;
}

const TafsirByVerse: FC<Props> = ({ tafsirConfig }) => {
	const [tafsirSelected, setTafsirSelected] = useState<
		TafsirItem | undefined
	>();
	const { data: tafsirItems, isLoading } = useTafsirs(tafsirConfig);

	const onSelect = (item: unknown) => {
		setTafsirSelected(tafsirItems?.find((t) => t.resource_id === Number(item)));
	};

	const getTafsirTitle = (t?: TafsirItem) => {
		if (!t) return '';
		return `${t?.name} (${t?.language_name})`;
	};

	useEffect(() => {
		if (tafsirItems && tafsirItems?.length > 0) {
			// try to see Tafsir Ibn Kathir is available
			let itemSelected = tafsirItems?.find((t) => t.resource_id === 169);
			// Otherwise search any other english translations
			if (!itemSelected || !itemSelected?.text) {
				itemSelected = tafsirItems?.find(
					(t) => t.language_name === 'english' && t.text
				);
			}
			setTafsirSelected(itemSelected);
		}
	}, [tafsirItems]);

	useEffect(() => {
		if (!tafsirConfig) {
			setTafsirSelected(undefined);
		}
	}, [tafsirConfig]);

	const options = useMemo(() => {
		return (tafsirItems || []).map((t) => ({
			label: getTafsirTitle(t),
			value: t.resource_id,
		}));
	}, [tafsirItems]);

	return (
		<div>
			<AutoComplete
				style={{ width: 400 }}
				value={getTafsirTitle(tafsirSelected)}
				options={options}
				placeholder="Select Tafsir"
				filterOption={(inputValue, option) =>
					option?.label.toUpperCase().indexOf(option.label.toUpperCase()) !== -1
				}
				onSelect={onSelect}
				notFoundContent={isLoading ? <Spin /> : null}
			/>

			<TafsirContentWrapper
				dangerouslySetInnerHTML={{
					__html: sanitizeHtml(tafsirSelected?.text || ''),
				}}
			/>
			{isLoading && (
				<SpinnerWrapper>
					<Spin />
				</SpinnerWrapper>
			)}
		</div>
	);
};

export default TafsirByVerse;
