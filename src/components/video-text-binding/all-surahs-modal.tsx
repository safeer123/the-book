import { Input, Modal, Tag, Tooltip, Table, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { useChapters } from 'data/use-chapters';
import { ChapterItem, ProjectConfig } from 'types';
import { isFullSurah } from 'utils/project-utils';
import { formatDuration } from './utils';

interface Props {
	open: boolean;
	onClose: () => void;
	projects: ProjectConfig[];
}

interface Recitation {
	reciter: string;
	videoUrl: string;
	duration?: number;
}

type PlaceFilter = 'all' | 'makkah' | 'madinah';

const Toolbar = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 0 24px 12px;
`;

const FilterGroup = styled.div`
	display: flex;
	border: 1px solid #d9d9d9;
	border-radius: 6px;
	overflow: hidden;
	flex-shrink: 0;
`;

const FilterBtn = styled.button<{ $active: boolean }>`
	background: ${({ $active }) => ($active ? '#1677ff' : '#fff')};
	color: ${({ $active }) => ($active ? '#fff' : 'rgba(0,0,0,0.65)')};
	border: none;
	padding: 0 10px;
	height: 24px;
	font-size: 12px;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
	border-right: 1px solid #d9d9d9;

	&:last-child {
		border-right: none;
	}

	&:hover {
		background: ${({ $active }) => ($active ? '#1677ff' : '#f0f4ff')};
	}
`;

const getChapterId = (p: ProjectConfig): number | undefined => {
	if (p.verseId && p.verseId >= 1 && p.verseId <= 114) return p.verseId;
	for (const b of p.bindingConfig || []) {
		const chNum = Number(b.k.split(':')[0]);
		if (Number.isInteger(chNum) && chNum >= 1 && chNum <= 114) return chNum;
	}
	return undefined;
};

const AllSurahsModal = ({ open, onClose, projects }: Props) => {
	const [search, setSearch] = useState('');
	const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('all');
	const { data: chaptersData } = useChapters();

	// Build map: chapterId → recitations (matched by numeric ID, not title)
	const recitationsMap = useMemo(() => {
		const map = new Map<number, Recitation[]>();
		for (const p of projects) {
			if (!isFullSurah(p.title)) continue;
			const chapterId = getChapterId(p);
			if (!chapterId) continue;
			const dashIdx = p.title.indexOf(' - ');
			const reciter =
				dashIdx !== -1 ? p.title.slice(dashIdx + 3).trim() : p.title.trim();
			if (!reciter) continue;
			const existing = map.get(chapterId) ?? [];
			existing.push({ reciter, videoUrl: p.videoUrl, duration: p.duration });
			map.set(chapterId, existing);
		}
		return map;
	}, [projects]);

	const filteredChapters = useMemo(() => {
		let chapters = chaptersData?.chapters || [];

		if (placeFilter !== 'all') {
			chapters = chapters.filter((c) => c.revelation_place === placeFilter);
		}

		if (!search.trim()) return chapters;
		const q = search.toLowerCase();
		return chapters.filter((c) => {
			if (
				c.name_simple.toLowerCase().includes(q) ||
				c.translated_name.name.toLowerCase().includes(q) ||
				String(c.id).includes(q) ||
				c.name_arabic.includes(q)
			)
				return true;
			// also match reciter names
			return (recitationsMap.get(c.id) || []).some((r) =>
				r.reciter.toLowerCase().includes(q)
			);
		});
	}, [chaptersData, search, placeFilter, recitationsMap]);

	const columns: ColumnsType<ChapterItem> = [
		{
			title: '#',
			dataIndex: 'id',
			width: 48,
			sorter: (a, b) => a.id - b.id,
			defaultSortOrder: 'ascend',
			sortDirections: ['ascend', 'descend'],
			render: (id: number) => (
				<span style={{ color: '#8c8c8c', fontSize: 12 }}>{id}</span>
			),
		},
		{
			title: 'Surah',
			key: 'name',
			render: (_, c) => (
				<div>
					<div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
						<span style={{ fontWeight: 500, fontSize: 13 }}>
							{c.name_simple}
						</span>
						<span
							style={{ fontFamily: 'serif', fontSize: 16, color: '#595959' }}
						>
							{c.name_arabic}
						</span>
					</div>
					<div style={{ fontSize: 11, color: '#8c8c8c' }}>
						{c.translated_name.name}
					</div>
				</div>
			),
		},
		{
			title: 'V',
			dataIndex: 'verses_count',
			width: 52,
			sorter: (a, b) => a.verses_count - b.verses_count,
			sortDirections: ['ascend', 'descend'],
			render: (v: number) => (
				<span style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</span>
			),
		},
		{
			dataIndex: 'revelation_place',
			width: 76,
			render: (place: string) => (
				<Tag
					color={place === 'makkah' ? 'gold' : 'geekblue'}
					style={{ fontSize: 10, marginRight: 0 }}
				>
					{place === 'makkah' ? 'Makkah' : 'Madinah'}
				</Tag>
			),
		},
		{
			title: 'Recitations',
			key: 'recitations',
			render: (_, c) => {
				const recitations = recitationsMap.get(c.id) || [];
				if (!recitations.length)
					return <span style={{ color: '#d9d9d9', fontSize: 12 }}>—</span>;
				return (
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
						{recitations.map((r) => (
							<Tooltip
								key={r.videoUrl}
								title={r.duration ? formatDuration(r.duration) : undefined}
							>
								<a
									href={`/qbind/${encodeURIComponent(r.videoUrl)}`}
									target="_blank"
									rel="noreferrer"
								>
									<Tag
										color="blue"
										style={{
											cursor: 'pointer',
											marginBottom: 0,
											fontSize: 11,
										}}
									>
										{r.reciter}
									</Tag>
								</a>
							</Tooltip>
						))}
					</div>
				);
			},
		},
	];

	const covered = recitationsMap.size;

	return (
		<Modal
			open={open}
			title={
				<span>
					All Surahs
					<span
						style={{
							fontWeight: 400,
							color: '#8c8c8c',
							marginLeft: 8,
							fontSize: 13,
						}}
					>
						{covered} / 114 covered
					</span>
				</span>
			}
			onCancel={onClose}
			footer={null}
			width={820}
			styles={{ body: { padding: '12px 0 0' } }}
		>
			<Toolbar>
				<Input
					prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
					placeholder="Search name, translation, number, or reciter…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					allowClear
					size="small"
					style={{ flex: 1 }}
				/>
				<FilterGroup>
					<FilterBtn
						$active={placeFilter === 'all'}
						onClick={() => setPlaceFilter('all')}
					>
						All
					</FilterBtn>
					<FilterBtn
						$active={placeFilter === 'makkah'}
						onClick={() => setPlaceFilter('makkah')}
					>
						Makkah
					</FilterBtn>
					<FilterBtn
						$active={placeFilter === 'madinah'}
						onClick={() => setPlaceFilter('madinah')}
					>
						Madinah
					</FilterBtn>
				</FilterGroup>
				{(search || placeFilter !== 'all') && (
					<Button
						size="small"
						type="link"
						style={{ padding: 0, fontSize: 12 }}
						onClick={() => {
							setSearch('');
							setPlaceFilter('all');
						}}
					>
						Clear
					</Button>
				)}
			</Toolbar>
			<Table
				columns={columns}
				dataSource={filteredChapters}
				rowKey="id"
				size="small"
				pagination={false}
				scroll={{ y: 440 }}
			/>
		</Modal>
	);
};

export default AllSurahsModal;
