/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-console */
import {
	FC,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Button, Input, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import {
	CheckOutlined,
	DeleteOutlined,
	DownloadOutlined,
	ExclamationOutlined,
	LinkOutlined,
	LoadingOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { ChapterItem, ProjectConfig, VerseBindingElement } from 'types';
import { getData, updateData } from 'utils/firestore-utils';
import { useVerseBindSaveEnabled } from 'data/use-verse-bind-save-enabled';
import { useChapters } from 'data/use-chapters';
import { useNavigate } from 'react-router-dom';

const PROJECTS_KEY = 'verse-binding-projects';

// ── Styles ─────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding: 24px;
	gap: 16px;
	background: #f5f5f5;
	box-sizing: border-box;
`;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ToolbarRow = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const ProjectCount = styled.span`
	color: #8c8c8c;
	font-size: 13px;
`;

const UnsavedBadge = styled.span`
	color: #faad14;
	font-size: 13px;
`;

const TableWrapper = styled.div`
	flex: 1;
	overflow: hidden;
	background: white;
	border-radius: 8px;
	border: 1px solid #f0f0f0;

	.ant-table-wrapper {
		height: 100%;
	}
`;

const CellInput = styled(Input)`
	&&& {
		border-color: transparent;
		background: transparent;
		box-shadow: none;
		padding: 2px 4px;
		font-size: 13px;

		&:hover {
			border-color: #d9d9d9;
		}

		&:focus {
			border-color: #4096ff;
			background: #fff;
		}
	}
`;

const BindingsContainer = styled.div`
	padding: 12px 48px;
	background: #fafafa;
`;

const BindingsList = styled.div`
	max-height: 320px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-bottom: 12px;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	padding: 4px;
`;

const BindingRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 3px 6px;
	border-radius: 4px;

	&:nth-child(odd) {
		background: #fff;
	}

	&:nth-child(even) {
		background: #f5f5f5;
	}

	.delete-btn {
		opacity: 0;
	}

	&:hover .delete-btn {
		opacity: 1;
	}
`;

const BindingIndex = styled.span`
	color: #bfbfbf;
	font-size: 11px;
	width: 28px;
	flex-shrink: 0;
	text-align: right;
`;

const BindingActionsRow = styled.div`
	display: flex;
	gap: 8px;
	padding-top: 4px;
`;

const EmptyBindings = styled.div`
	color: #bfbfbf;
	font-size: 12px;
	padding: 8px;
	text-align: center;
`;

const PageFooter = styled.div`
	display: flex;
	justify-content: center;
	padding-bottom: 4px;
`;

const FooterLink = styled.button`
	background: none;
	border: none;
	color: #8c8c8c;
	font-size: 12px;
	cursor: pointer;
	padding: 0;
	text-decoration: underline;
	text-underline-offset: 2px;

	&:hover {
		color: #4096ff;
	}
`;

const MissingSuraRow = styled.div`
	display: flex;
	align-items: baseline;
	gap: 8px;
	padding: 6px 0;
	border-bottom: 1px solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}
`;

const SuraNumber = styled.span`
	color: #bfbfbf;
	font-size: 11px;
	width: 28px;
	flex-shrink: 0;
	text-align: right;
`;

const SuraNameEn = styled.span`
	font-size: 13px;
	flex: 1;
`;

const SuraNameAr = styled.span`
	font-size: 15px;
	color: #595959;
	font-family: 'Amiri', serif;
`;

const SuraVerseCount = styled.span`
	font-size: 11px;
	color: #8c8c8c;
	flex-shrink: 0;
`;

// ── BindingsEditor ──────────────────────────────────────────────────────────

interface BindingsEditorProps {
	project: ProjectConfig;
	onUpdate: (id: string, updates: Partial<ProjectConfig>) => void;
}

const BindingsEditor: FC<BindingsEditorProps> = ({ project, onUpdate }) => {
	const { bindingConfig = [] } = project;

	const [chapter, verse] = useMemo(() => {
		let i = 1;
		while (
			!bindingConfig.at(-i)?.k?.includes(':') &&
			i < bindingConfig.length
		) {
			i++;
		}
		const last = bindingConfig.at(-i);
		if (last?.k?.includes(':')) return last.k.split(':');
		return ['1', '1'];
	}, [bindingConfig]);

	const set = useCallback(
		(newConfig: VerseBindingElement[]) => {
			onUpdate(project.id, { bindingConfig: newConfig });
		},
		[project.id, onUpdate]
	);

	const addNext = () =>
		set([
			...bindingConfig,
			{
				t: 0,
				k: `${chapter}:${Number(verse) + 1}`,
				id: (bindingConfig.at(-1)?.id || 0) + 1,
			},
		]);

	const addBlank = () =>
		set([
			...bindingConfig,
			{ t: 0, k: '', id: (bindingConfig.at(-1)?.id || 0) + 1 },
		]);

	const changeTime = (id: number, t: number) =>
		set(bindingConfig.map((c) => (c.id === id ? { ...c, t } : c)));

	const changeKey = (id: number, k: string) =>
		set(bindingConfig.map((c) => (c.id === id ? { ...c, k } : c)));

	const remove = (index: number) =>
		set(bindingConfig.filter((_, i) => i !== index));

	return (
		<BindingsContainer>
			<BindingsList>
				{bindingConfig.length === 0 && (
					<EmptyBindings>No bindings yet</EmptyBindings>
				)}
				{bindingConfig.map((el, index) => (
					<BindingRow key={el.id}>
						<BindingIndex>{index + 1}</BindingIndex>
						<Input
							size="small"
							type="number"
							value={el.t}
							step={0.1}
							style={{ width: 90 }}
							onChange={(e) => changeTime(el.id, Number(e.target.value))}
						/>
						<Input
							size="small"
							type="text"
							value={el.k}
							style={{ width: 80 }}
							placeholder="2:255"
							onChange={(e) => changeKey(el.id, e.target.value)}
						/>
						<Button
							className="delete-btn"
							size="small"
							type="link"
							danger
							icon={<DeleteOutlined />}
							onClick={() => remove(index)}
						/>
					</BindingRow>
				))}
			</BindingsList>
			<BindingActionsRow>
				<Button size="small" type="primary" onClick={addNext}>
					{`+ Next (${chapter}:${Number(verse) + 1})`}
				</Button>
				<Button size="small" onClick={addBlank}>
					+ Blank
				</Button>
			</BindingActionsRow>
		</BindingsContainer>
	);
};

// ── EditProjects ────────────────────────────────────────────────────────────

const EditProjects: FC = () => {
	const verseBindSaveEnabled = useVerseBindSaveEnabled();
	const navigate = useNavigate();
	const { data: chaptersData } = useChapters();

	const [projects, setProjects] = useState<ProjectConfig[]>([]);
	const [savedSnapshot, setSavedSnapshot] = useState('');
	const [search, setSearch] = useState('');
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
	const [saveIcon, setSaveIcon] = useState<ReactNode | undefined>();
	const [saving, setSaving] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<ProjectConfig | null>(null);
	const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
	const [missingSurasOpen, setMissingSurasOpen] = useState(false);

	useEffect(() => {
		if (verseBindSaveEnabled === false) {
			navigate('/');
		}
	}, [verseBindSaveEnabled, navigate]);

	useEffect(() => {
		const stored = localStorage.getItem(PROJECTS_KEY);
		if (stored) {
			try {
				const map = JSON.parse(stored) as { [key: string]: ProjectConfig };
				const list = Object.values(map).sort(
					(a, b) => (a.verseId || 0) - (b.verseId || 0)
				);
				setProjects(list);
				setSavedSnapshot(stored);
			} catch (e) {
				console.error(e);
			}
		}

		getData().then((data) => {
			if (data?.projects) {
				const map = data.projects as unknown as {
					[key: string]: ProjectConfig;
				};
				const list = Object.values(map).sort(
					(a, b) => (a.verseId || 0) - (b.verseId || 0)
				);
				setProjects(list);
				const str = JSON.stringify(map);
				setSavedSnapshot(str);
				localStorage.setItem(PROJECTS_KEY, str);
			}
		});
	}, []);

	const hasUnsavedChanges = useMemo(() => {
		const currentMap: { [key: string]: ProjectConfig } = {};
		projects.forEach((p) => {
			currentMap[p.videoUrl] = p;
		});
		return JSON.stringify(currentMap) !== savedSnapshot;
	}, [projects, savedSnapshot]);

	const filteredProjects = useMemo(() => {
		if (!search.trim()) return projects;
		const q = search.toLowerCase();
		return projects.filter((p) => p.title?.toLowerCase().includes(q));
	}, [projects, search]);

	const missingChapters = useMemo((): ChapterItem[] => {
		if (!chaptersData?.chapters) return [];
		const covered = new Set<number>();
		projects.forEach((p) => {
			p.bindingConfig?.forEach((b) => {
				const ch = Number(b.k.split(':')[0]);
				if (!isNaN(ch) && ch > 0) covered.add(ch);
			});
			if (p.verseId) covered.add(p.verseId);
		});
		return chaptersData.chapters.filter((ch) => !covered.has(ch.id));
	}, [projects, chaptersData]);

	const toggleExpand = useCallback((id: string) => {
		setExpandedRowKeys((prev) =>
			prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
		);
	}, []);

	const updateProject = useCallback(
		(id: string, updates: Partial<ProjectConfig>) => {
			setProjects((prev) =>
				prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
			);
		},
		[]
	);

	const deleteProject = useCallback((project: ProjectConfig) => {
		setProjects((prev) => prev.filter((p) => p.id !== project.id));
		setDeleteTarget(null);
	}, []);

	const bulkDelete = useCallback(() => {
		setProjects((prev) => prev.filter((p) => !selectedKeys.includes(p.id)));
		setSelectedKeys([]);
		setBulkDeleteOpen(false);
	}, [selectedKeys]);

	const saveAll = useCallback(async () => {
		setSaving(true);
		setSaveIcon(<LoadingOutlined />);
		try {
			const map: { [key: string]: ProjectConfig } = {};
			projects.forEach((p) => {
				const saved: ProjectConfig = {
					...p,
					id: [...p.title.split(' '), p.videoUrl].join('-'),
				};
				let verseId: number | undefined;
				saved.bindingConfig?.find((b) => {
					const verseNum = b.k.split(':')?.[0];
					if (Number.isInteger(+verseNum) && +verseNum > 1) {
						verseId = +verseNum;
						return true;
					}
					return false;
				});
				if (verseId) saved.verseId = verseId;
				map[saved.videoUrl] = saved;
			});

			await updateData({ projects: map });
			const str = JSON.stringify(map);
			localStorage.setItem(PROJECTS_KEY, str);
			setSavedSnapshot(str);
			setProjects(
				Object.values(map).sort((a, b) => (a.verseId || 0) - (b.verseId || 0))
			);
			setSaveIcon(<CheckOutlined />);
		} catch (e) {
			console.error(e);
			setSaveIcon(<ExclamationOutlined />);
		} finally {
			setSaving(false);
			setTimeout(() => setSaveIcon(undefined), 3000);
		}
	}, [projects]);

	const downloadAsJson = useCallback(() => {
		const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
			JSON.stringify({ projects })
		)}`;
		const link = document.createElement('a');
		link.href = jsonString;
		link.download = 'verse-binding-projects.json';
		link.click();
	}, [projects]);

	const rowSelection: TableRowSelection<ProjectConfig> = {
		selectedRowKeys: selectedKeys,
		onChange: (keys) => setSelectedKeys(keys as string[]),
	};

	const columns: ColumnsType<ProjectConfig> = [
		{
			title: 'Sura',
			dataIndex: 'verseId',
			key: 'verseId',
			width: 56,
			align: 'center' as const,
			render: (verseId: number | undefined) => (
				<span style={{ color: '#8c8c8c', fontSize: 12 }}>{verseId ?? '—'}</span>
			),
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			width: '38%',
			render: (title: string, record) => (
				<CellInput
					value={title}
					onChange={(e) => updateProject(record.id, { title: e.target.value })}
					onKeyDown={(e) => e.stopPropagation()}
					size="small"
				/>
			),
		},
		{
			title: 'Video URL',
			dataIndex: 'videoUrl',
			key: 'videoUrl',
			width: '46%',
			render: (url: string, record) => (
				<CellInput
					value={url}
					onChange={(e) =>
						updateProject(record.id, { videoUrl: e.target.value })
					}
					onKeyDown={(e) => e.stopPropagation()}
					size="small"
				/>
			),
		},
		{
			title: 'Bindings',
			key: 'bindings',
			width: 80,
			align: 'center' as const,
			render: (_: unknown, record: ProjectConfig) => (
				<Tag
					style={{ cursor: 'pointer' }}
					onClick={() => toggleExpand(record.id)}
					color={expandedRowKeys.includes(record.id) ? 'blue' : undefined}
				>
					{record.bindingConfig?.length ?? 0}
				</Tag>
			),
		},
		{
			title: '',
			key: 'player',
			width: 36,
			render: (_: unknown, record: ProjectConfig) =>
				record.videoUrl ? (
					<a
						href={`/qbind/${encodeURIComponent(record.videoUrl)}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button
							size="small"
							type="text"
							icon={<LinkOutlined />}
							title="Open in player"
						/>
					</a>
				) : null,
		},
		{
			title: '',
			key: 'actions',
			width: 48,
			render: (_: unknown, record: ProjectConfig) => (
				<Button
					size="small"
					type="text"
					danger
					icon={<DeleteOutlined />}
					onClick={() => setDeleteTarget(record)}
				/>
			),
		},
	];

	return (
		<PageWrapper>
			<PageHeader>
				<Typography.Title level={4} style={{ margin: 0 }}>
					Project Manager
				</Typography.Title>
				<HeaderActions>
					{hasUnsavedChanges && <UnsavedBadge>● unsaved changes</UnsavedBadge>}
					<Button
						size="small"
						icon={<DownloadOutlined />}
						onClick={downloadAsJson}
					>
						Export
					</Button>
					<Button
						type="primary"
						size="small"
						icon={saveIcon || <SaveOutlined />}
						onClick={async () => {
							await saveAll();
						}}
						loading={saving}
						disabled={!hasUnsavedChanges}
					>
						Save All
					</Button>
				</HeaderActions>
			</PageHeader>

			<ToolbarRow>
				<Input.Search
					placeholder="Search by title..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					allowClear
					style={{ width: 320 }}
					size="small"
				/>
				<ProjectCount>
					{filteredProjects.length} / {projects.length} projects
				</ProjectCount>
				{selectedKeys.length > 0 && (
					<Button
						danger
						size="small"
						icon={<DeleteOutlined />}
						onClick={() => setBulkDeleteOpen(true)}
					>
						Delete selected ({selectedKeys.length})
					</Button>
				)}
			</ToolbarRow>

			<TableWrapper>
				<Table
					rowKey="id"
					dataSource={filteredProjects}
					columns={columns}
					rowSelection={rowSelection}
					expandable={{
						expandedRowKeys,
						onExpandedRowsChange: (keys) =>
							setExpandedRowKeys(keys as string[]),
						expandedRowRender: (record) => (
							<BindingsEditor project={record} onUpdate={updateProject} />
						),
					}}
					size="small"
					pagination={false}
					scroll={{ y: 'calc(100vh - 220px)' }}
				/>
			</TableWrapper>

			<PageFooter>
				<FooterLink onClick={() => setMissingSurasOpen(true)}>
					Missing Suras ({missingChapters.length})
				</FooterLink>
			</PageFooter>

			<Modal
				open={missingSurasOpen}
				title={`Missing Suras — ${missingChapters.length} of 114`}
				onCancel={() => setMissingSurasOpen(false)}
				footer={null}
				width={480}
				styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
			>
				{missingChapters.map((ch) => (
					<MissingSuraRow key={ch.id}>
						<SuraNumber>{ch.id}</SuraNumber>
						<SuraNameEn>{ch.name_simple}</SuraNameEn>
						<SuraNameAr>{ch.name_arabic}</SuraNameAr>
						<SuraVerseCount>{ch.verses_count}v</SuraVerseCount>
					</MissingSuraRow>
				))}
				{missingChapters.length === 0 && (
					<EmptyBindings>All 114 suras are covered 🎉</EmptyBindings>
				)}
			</Modal>

			<Modal
				open={!!deleteTarget}
				title="Delete project"
				onCancel={() => setDeleteTarget(null)}
				footer={[
					<Button key="cancel" onClick={() => setDeleteTarget(null)}>
						Cancel
					</Button>,
					<Button
						key="delete"
						type="primary"
						danger
						onClick={() => deleteTarget && deleteProject(deleteTarget)}
					>
						Delete
					</Button>,
				]}
			>
				Deleting <strong>{deleteTarget?.title}</strong> permanently. Are you
				sure?
			</Modal>

			<Modal
				open={bulkDeleteOpen}
				title="Delete selected projects"
				onCancel={() => setBulkDeleteOpen(false)}
				footer={[
					<Button key="cancel" onClick={() => setBulkDeleteOpen(false)}>
						Cancel
					</Button>,
					<Button key="delete" type="primary" danger onClick={bulkDelete}>
						Delete {selectedKeys.length} projects
					</Button>,
				]}
			>
				Delete <strong>{selectedKeys.length}</strong> selected projects
				permanently?
			</Modal>
		</PageWrapper>
	);
};

export default EditProjects;
