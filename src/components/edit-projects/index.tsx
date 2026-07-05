/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-console */
import {
	FC,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Button,
	Input,
	Modal,
	Popover,
	Progress,
	Table,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import {
	CheckOutlined,
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	ExclamationOutlined,
	LinkOutlined,
	LoadingOutlined,
	PlusCircleOutlined,
	SaveOutlined,
	SwapOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { ChapterItem, ProjectConfig, VerseBindingElement } from 'types';
import { getData, updateData } from 'utils/firestore-utils';
import { useVerseBindSaveEnabled } from 'data/use-verse-bind-save-enabled';
import { useChapters } from 'data/use-chapters';
import { Link, useNavigate } from 'react-router-dom';
import { isFullSurah } from 'utils/project-utils';
import TitleBuilderModal from 'components/video-text-binding/edit-binding/title-builder-modal';
import AllSurahsModal from 'components/video-text-binding/all-surahs-modal';

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

	.ant-table-tbody > tr.row-incomplete > td {
		background: #fffbe6;
	}

	.ant-table-tbody > tr.row-incomplete:hover > td {
		background: #fff3cd !important;
	}

	.ant-table-tbody > tr > td.col-action {
		opacity: 0;
		transition: opacity 0.15s;
	}

	.ant-table-tbody > tr:hover > td.col-action {
		opacity: 1;
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

const ReciterRow = styled.div`
	padding: 10px 0;
	border-bottom: 1px solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}
`;

const ReciterHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 6px;
`;

const ReciterName = styled.span`
	font-size: 13px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.85);
	flex: 1;
`;

const ReciterCount = styled.span`
	font-size: 11px;
	color: #8c8c8c;
	background: #f5f5f5;
	padding: 1px 6px;
	border-radius: 10px;
`;

const SuraTagsList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
`;

const SuraTag = styled.a`
	font-size: 11px;
	color: #4096ff;
	background: #e6f4ff;
	border: 1px solid #91caff;
	padding: 1px 6px;
	border-radius: 4px;
	line-height: 18px;
	text-decoration: none;
	cursor: pointer;

	&:hover {
		background: #bae0ff;
		border-color: #4096ff;
		color: #0958d9;
	}
`;

const FindReplaceBar = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: #fff;
	border-radius: 8px;
	border: 1px solid #e0e0e0;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const FindMatchCount = styled.span`
	font-size: 12px;
	color: #8c8c8c;
	white-space: nowrap;
	min-width: 72px;
`;

const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSnapshot = (list: ProjectConfig[]) => {
	const map: { [key: string]: ProjectConfig } = {};
	list.forEach((p) => {
		map[p.videoUrl] = p;
	});
	return JSON.stringify(map);
};

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
	const [recitersOpen, setRecitersOpen] = useState(false);
	const [allSurahsOpen, setAllSurahsOpen] = useState(false);
	const [incompleteFilter, setIncompleteFilter] = useState(false);
	const [findReplaceOpen, setFindReplaceOpen] = useState(false);
	const [findText, setFindText] = useState('');
	const [replaceText, setReplaceText] = useState('');
	const [matchCase, setMatchCase] = useState(false);
	const [focusedTitleRowId, setFocusedTitleRowId] = useState<string | null>(
		null
	);
	const [titleBuilderRowId, setTitleBuilderRowId] = useState<string | null>(
		null
	);
	const titleBlurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
				setSavedSnapshot(buildSnapshot(list));
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
				const str = buildSnapshot(list);
				setSavedSnapshot(str);
				localStorage.setItem(PROJECTS_KEY, str);
			}
		});
	}, []);

	const hasUnsavedChanges = useMemo(
		() => buildSnapshot(projects) !== savedSnapshot,
		[projects, savedSnapshot]
	);

	const filteredProjects = useMemo(() => {
		let list = projects;
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((p) => p.title?.toLowerCase().includes(q));
		}
		if (incompleteFilter) {
			list = list.filter((p) => {
				const ch = chaptersData?.suraByKey[p.verseId ?? 0];
				if (!ch) return false;
				if (!isFullSurah(p.title)) return false;
				return (p.bindingConfig?.length ?? 0) < ch.verses_count;
			});
		}
		return list;
	}, [projects, search, incompleteFilter, chaptersData]);

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

	const recitersData = useMemo(() => {
		const map: Record<
			string,
			{ surah: string; verseId: number; videoUrl: string }[]
		> = {};
		projects.forEach((p) => {
			if (!isFullSurah(p.title)) return;
			const dashIdx = p.title.indexOf(' - ');
			if (dashIdx === -1) return;
			const surahPart = p.title.slice(0, dashIdx).trim();
			const reciter = p.title.slice(dashIdx + 3).trim();
			if (!reciter) return;
			if (!map[reciter]) map[reciter] = [];
			map[reciter].push({
				surah: surahPart,
				verseId: p.verseId ?? 0,
				videoUrl: p.videoUrl,
			});
		});
		return Object.entries(map)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([name, suras]) => ({
				name,
				suras: suras.sort((a, b) => a.verseId - b.verseId),
			}));
	}, [projects]);

	const matchCount = useMemo(() => {
		if (!findText) return 0;
		const find = matchCase ? findText : findText.toLowerCase();
		return projects.filter((p) => {
			const title = matchCase ? p.title : p.title?.toLowerCase();
			return title?.includes(find);
		}).length;
	}, [projects, findText, matchCase]);

	const replaceAll = useCallback(() => {
		if (!findText) return;
		const regex = new RegExp(escapeForRegex(findText), matchCase ? 'g' : 'gi');
		setProjects((prev) =>
			prev.map((p) =>
				regex.test(p.title)
					? {
							...p,
							title: p.title.replace(
								new RegExp(escapeForRegex(findText), matchCase ? 'g' : 'gi'),
								replaceText
							),
					  }
					: p
			)
		);
	}, [findText, replaceText, matchCase]);

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
			const savedList = Object.values(map).sort(
				(a, b) => (a.verseId || 0) - (b.verseId || 0)
			);
			const str = buildSnapshot(savedList);
			localStorage.setItem(PROJECTS_KEY, str);
			setSavedSnapshot(str);
			setProjects(savedList);
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
			title: '#',
			dataIndex: 'verseId',
			key: 'verseId',
			width: 80,
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
			render: (title: string, record) => {
				const isMatch =
					findReplaceOpen &&
					!!findText &&
					(matchCase ? title : title?.toLowerCase() ?? '').includes(
						matchCase ? findText : findText.toLowerCase()
					);
				const isFocused = focusedTitleRowId === record.id;
				return (
					<Popover
						open={isFocused}
						placement="topRight"
						arrow={false}
						content={
							<Button
								type="text"
								size="small"
								icon={<PlusCircleOutlined />}
								onMouseDown={(e) => {
									e.preventDefault();
									if (titleBlurTimerRef.current)
										clearTimeout(titleBlurTimerRef.current);
									setTitleBuilderRowId(record.id);
									setFocusedTitleRowId(null);
								}}
							>
								Build title
							</Button>
						}
					>
						<CellInput
							value={title}
							onChange={(e) =>
								updateProject(record.id, { title: e.target.value })
							}
							onKeyDown={(e) => e.stopPropagation()}
							onFocus={() => {
								if (titleBlurTimerRef.current)
									clearTimeout(titleBlurTimerRef.current);
								setFocusedTitleRowId(record.id);
							}}
							onBlur={() => {
								titleBlurTimerRef.current = setTimeout(
									() => setFocusedTitleRowId(null),
									150
								);
							}}
							size="small"
							style={
								isMatch
									? {
											borderColor: '#1677ff',
											background: '#e6f4ff',
											boxShadow: 'none',
									  }
									: undefined
							}
						/>
					</Popover>
				);
			},
		},
		{
			title: 'Video URL',
			dataIndex: 'videoUrl',
			key: 'videoUrl',
			width: '46%',
			render: (url: string, record) => {
				const duplicate = url
					? projects.find((p) => p.videoUrl === url && p.id !== record.id)
					: undefined;
				return (
					<Tooltip
						title={
							duplicate ? `Already used by "${duplicate.title}"` : undefined
						}
						color="#ff4d4f"
						open={!!duplicate || undefined}
					>
						<CellInput
							value={url}
							onChange={(e) =>
								updateProject(record.id, { videoUrl: e.target.value })
							}
							onKeyDown={(e) => e.stopPropagation()}
							size="small"
							status={duplicate ? 'error' : undefined}
						/>
					</Tooltip>
				);
			},
		},
		{
			title: 'Bindings',
			key: 'bindings',
			width: 96,
			align: 'center' as const,
			render: (_: unknown, record: ProjectConfig) => {
				const bindingCount = record.bindingConfig?.length ?? 0;
				const chapter = chaptersData?.suraByKey[record.verseId ?? 0];
				const versesCount = chapter?.verses_count;
				const pct = versesCount
					? Math.min(100, Math.round((bindingCount / versesCount) * 100))
					: null;
				return (
					<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
						<Tag
							style={{ cursor: 'pointer', margin: 0, flexShrink: 0 }}
							onClick={() => toggleExpand(record.id)}
							color={expandedRowKeys.includes(record.id) ? 'blue' : undefined}
						>
							{bindingCount}
						</Tag>
						{pct !== null && isFullSurah(record.title) && (
							<Tooltip
								title={`${bindingCount}/${versesCount ?? 0} bound (${
									pct ?? 0
								}%)`}
							>
								<Progress
									percent={pct}
									size="small"
									showInfo={false}
									style={{ width: 40, margin: 0 }}
									strokeColor={pct >= 100 ? '#52c41a' : '#faad14'}
								/>
							</Tooltip>
						)}
					</div>
				);
			},
		},
		{
			title: '',
			key: 'player',
			width: 36,
			onCell: () => ({ className: 'col-action' }),
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
			key: 'edit',
			width: 36,
			onCell: () => ({ className: 'col-action' }),
			render: (_: unknown, record: ProjectConfig) =>
				record.videoUrl ? (
					<Tooltip title="Edit in verse binding editor">
						<Link to={`/verse-binding/${encodeURIComponent(record.videoUrl)}`}>
							<Button size="small" type="text" icon={<EditOutlined />} />
						</Link>
					</Tooltip>
				) : null,
		},
		{
			title: '',
			key: 'actions',
			width: 48,
			onCell: () => ({ className: 'col-action' }),
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
						icon={<SwapOutlined />}
						type={findReplaceOpen ? 'primary' : 'default'}
						onClick={() => {
							setFindReplaceOpen((p) => !p);
							setFindText('');
							setReplaceText('');
						}}
					>
						Find & Replace
					</Button>
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

			{findReplaceOpen && (
				<FindReplaceBar>
					<Input
						placeholder="Find in titles..."
						value={findText}
						onChange={(e) => setFindText(e.target.value)}
						size="small"
						allowClear
						style={{ width: 220 }}
						autoFocus
					/>
					<span style={{ color: '#bfbfbf', fontSize: 14, flexShrink: 0 }}>
						→
					</span>
					<Input
						placeholder="Replace with..."
						value={replaceText}
						onChange={(e) => setReplaceText(e.target.value)}
						size="small"
						style={{ width: 220 }}
					/>
					<Tooltip title="Match case">
						<Button
							size="small"
							type={matchCase ? 'primary' : 'default'}
							onClick={() => setMatchCase((p) => !p)}
						>
							Aa
						</Button>
					</Tooltip>
					<FindMatchCount>
						{findText
							? `${matchCount} match${matchCount !== 1 ? 'es' : ''}`
							: ''}
					</FindMatchCount>
					<Button
						size="small"
						type="primary"
						disabled={!findText || matchCount === 0}
						onClick={replaceAll}
					>
						Replace All
					</Button>
				</FindReplaceBar>
			)}

			<ToolbarRow>
				<Input.Search
					placeholder="Search by title..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					allowClear
					style={{ width: 320 }}
					size="small"
				/>
				<Button
					size="small"
					type={incompleteFilter ? 'primary' : 'default'}
					onClick={() => setIncompleteFilter((p) => !p)}
				>
					Unfinished
				</Button>
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
					rowClassName={(record) => {
						const chapter = chaptersData?.suraByKey[record.verseId ?? 0];
						if (!chapter) return '';
						if (!isFullSurah(record.title)) return '';
						return (record.bindingConfig?.length ?? 0) < chapter.verses_count
							? 'row-incomplete'
							: '';
					}}
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
				<FooterLink onClick={() => setAllSurahsOpen(true)}>
					All Surahs
				</FooterLink>
				<span style={{ color: '#d9d9d9', margin: '0 8px' }}>·</span>
				<FooterLink onClick={() => setMissingSurasOpen(true)}>
					Missing Suras ({missingChapters.length})
				</FooterLink>
				<span style={{ color: '#d9d9d9', margin: '0 8px' }}>·</span>
				<FooterLink onClick={() => setRecitersOpen(true)}>
					Reciters ({recitersData.length})
				</FooterLink>
			</PageFooter>

			<AllSurahsModal
				open={allSurahsOpen}
				onClose={() => setAllSurahsOpen(false)}
				projects={projects}
			/>

			<TitleBuilderModal
				open={!!titleBuilderRowId}
				onClose={() => setTitleBuilderRowId(null)}
				onConfirm={(title) => {
					if (titleBuilderRowId) updateProject(titleBuilderRowId, { title });
					setTitleBuilderRowId(null);
				}}
				projects={projects}
				currentProjectId={titleBuilderRowId ?? undefined}
			/>

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

			<Modal
				open={recitersOpen}
				title={`Reciters — ${recitersData.length}`}
				onCancel={() => setRecitersOpen(false)}
				footer={null}
				width={520}
				styles={{
					body: { maxHeight: '65vh', overflowY: 'auto', padding: '4px 0' },
				}}
			>
				{recitersData.length === 0 && (
					<EmptyBindings>No reciter projects found</EmptyBindings>
				)}
				{recitersData.map(({ name, suras }) => (
					<ReciterRow key={name}>
						<ReciterHeader>
							<ReciterName>{name}</ReciterName>
							<ReciterCount>
								{suras.length} sura{suras.length !== 1 ? 's' : ''}
							</ReciterCount>
						</ReciterHeader>
						<SuraTagsList>
							{suras.map(({ surah, verseId, videoUrl }) => (
								<SuraTag
									key={verseId || surah}
									href={`/qbind/${encodeURIComponent(videoUrl)}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{surah.startsWith('Surah ') ? surah.slice(6) : surah}
								</SuraTag>
							))}
						</SuraTagsList>
					</ReciterRow>
				))}
			</Modal>
		</PageWrapper>
	);
};

export default EditProjects;
