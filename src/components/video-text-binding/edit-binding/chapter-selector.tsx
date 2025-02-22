import { Button, Popover, AutoComplete } from 'antd';
import { CheckOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useChapters } from 'data/use-chapters';

const ContentWrapper = styled.div`
	width: 260px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;

	button {
		align-self: flex-end;
	}
`;

interface Props {
	onChangeVerseKey: (id: number, k?: string) => void;
	elementId: number;
}

const ChapterSelector: FC<Props> = ({ onChangeVerseKey, elementId }) => {
	const [selectedChapter, setSelectedChapter] = useState<string | undefined>();
	const [chapterSelectorOpen, setChapterSelectorOpen] = useState(false);

	const { data: chapterData } = useChapters();

	const chapterOptions = useMemo(() => {
		return (chapterData?.chapters || []).map((c) => ({
			value: `${c.id}`,
			label: `${c.id}: ${c.name_simple} ${c.name_arabic} (${c.translated_name.name})`,
		}));
	}, [chapterData]);

	useEffect(() => {
		if (!chapterSelectorOpen) {
			setSelectedChapter(undefined);
		}
	}, [chapterSelectorOpen]);

	return (
		<Popover
			className="binding-item-action"
			placement="bottomRight"
			open={chapterSelectorOpen}
			onOpenChange={setChapterSelectorOpen}
			content={
				<ContentWrapper>
					<AutoComplete
						size="small"
						filterOption={(inputValue, option) =>
							option?.label.toUpperCase().indexOf(inputValue.toUpperCase()) !==
							-1
						}
						allowClear
						placeholder="Search chapter.."
						popupMatchSelectWidth={400}
						options={chapterOptions}
						onChange={(value) => {
							setSelectedChapter(value);
						}}
						value={selectedChapter}
					/>
					{selectedChapter && (
						<>
							<span>
								{
									chapterOptions?.find(
										(chOpt) => chOpt.value === selectedChapter
									)?.label
								}
							</span>
							<Button
								size="small"
								type="primary"
								icon={<CheckOutlined />}
								onClick={() => {
									setChapterSelectorOpen(false);
									if (selectedChapter) {
										onChangeVerseKey(elementId, `${selectedChapter}:1`);
									}
								}}
							>
								Select
							</Button>
						</>
					)}
				</ContentWrapper>
			}
			trigger={['click']}
		>
			<Button icon={<PlusCircleOutlined />} size="small" type="link" />
		</Popover>
	);
};

export default ChapterSelector;
