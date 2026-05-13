import { Button, Input, Popover } from 'antd';
import type { InputRef } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useChapters } from 'data/use-chapters';

const ContentWrapper = styled.div`
	width: 300px;
	display: flex;
	flex-direction: column;
`;

const SearchWrapper = styled.div`
	padding: 8px 8px 4px;
`;

const ChapterList = styled.div`
	max-height: 240px;
	overflow-y: auto;
`;

const ChapterItem = styled.div<{ $active: boolean }>`
	padding: 5px 12px;
	font-size: 13px;
	cursor: pointer;
	background: ${({ $active }) =>
		$active ? 'rgba(52, 84, 244, 0.12)' : 'transparent'};

	&:hover {
		background: ${({ $active }) =>
			$active ? 'rgba(52, 84, 244, 0.18)' : 'rgba(0, 0, 0, 0.04)'};
	}
`;

interface Props {
	onChangeVerseKey: (id: number, k?: string) => void;
	elementId: number;
	projectTitle?: string;
}

const ChapterSelector: FC<Props> = ({
	onChangeVerseKey,
	elementId,
	projectTitle,
}) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [activeIndex, setActiveIndex] = useState(-1);
	const inputRef = useRef<InputRef>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	const { data: chapterData } = useChapters();

	const filteredChapters = useMemo(() => {
		const q = search.toLowerCase();
		return (chapterData?.chapters || []).filter((c) => {
			if (!q) return true;
			return (
				`${c.id}`.startsWith(q) ||
				c.name_simple.toLowerCase().includes(q) ||
				c.translated_name.name.toLowerCase().includes(q)
			);
		});
	}, [chapterData, search]);

	useEffect(() => {
		setActiveIndex(-1);
	}, [search]);

	useEffect(() => {
		if (open) {
			const firstSegment = projectTitle?.split(' - ')[0] ?? '';
			const match = firstSegment.match(/^Surah\s+(.+)$/i);
			const titleChapter = match ? match[1] : '';
			setSearch(titleChapter);
			setActiveIndex(-1);
			setTimeout(() => {
				inputRef.current?.focus();
				inputRef.current?.select();
			}, 50);
		}
	}, [open]);

	useEffect(() => {
		if (activeIndex >= 0) {
			itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
		}
	}, [activeIndex]);

	const select = (chapterId: number) => {
		onChangeVerseKey(elementId, `${chapterId}:1`);
		setOpen(false);
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		e.stopPropagation();
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, filteredChapters.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === 'Enter' && filteredChapters.length > 0) {
			e.preventDefault();
			select(filteredChapters[activeIndex >= 0 ? activeIndex : 0].id);
		} else if (e.key === 'Escape') {
			setOpen(false);
		}
	};

	return (
		<Popover
			className="binding-item-action"
			placement="bottomRight"
			open={open}
			onOpenChange={setOpen}
			content={
				<ContentWrapper>
					<SearchWrapper>
						<Input
							ref={inputRef}
							size="small"
							placeholder="Search chapter..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={onKeyDown}
						/>
					</SearchWrapper>
					<ChapterList ref={listRef}>
						{filteredChapters.map((c, i) => (
							<ChapterItem
								key={c.id}
								$active={i === activeIndex}
								ref={(el) => {
									itemRefs.current[i] = el;
								}}
								onClick={() => select(c.id)}
							>
								{c.id}: {c.name_simple} {c.name_arabic} (
								{c.translated_name.name})
							</ChapterItem>
						))}
					</ChapterList>
				</ContentWrapper>
			}
			trigger={['click']}
		>
			<Button icon={<PlusCircleOutlined />} size="small" type="link" />
		</Popover>
	);
};

export default ChapterSelector;
