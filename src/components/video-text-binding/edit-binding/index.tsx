/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Space, Input, Modal, Tooltip } from 'antd';
import {
	CaretRightOutlined,
	CheckOutlined,
	CloseOutlined,
	CopyOutlined,
	DeleteOutlined,
	DownloadOutlined,
	ExclamationOutlined,
	LoadingOutlined,
	PlusCircleOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import {
	ChangeEvent,
	FC,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { ProjectConfig, VerseBindingElement } from 'types';
import ChapterSelector from './chapter-selector';
import TitleBuilderModal from './title-builder-modal';
import {
	Panel,
	PanelInner,
	PanelHeader,
	PanelTitle,
	ProjectDetailsArea,
	Wrapper,
	InputItem,
	InputGroup,
	InputLabel,
	BindingItem,
	BindingListContainer,
	BindingListHeader,
	BindingProgressBar,
	BindingListItems,
	ActionArea,
} from './styles';
import { useVerseBindSaveEnabled } from 'data/use-verse-bind-save-enabled';
import { useChapters } from 'data/use-chapters';
import { isFullSurah } from 'utils/project-utils';
import { Link } from 'react-router-dom';

interface Props {
	open?: boolean;
	onClose: () => void;
	projectConfig?: ProjectConfig;
	setProjectConfig: (conf: ProjectConfig) => void;
	currentTime: number;
	videoDuration?: number;
	saveProject: () => Promise<void>;
	deleteProject: () => Promise<void>;
	downloadAsJson: () => void;
	copyToClipboard: () => Promise<void>;
	hasUnsavedChanges: boolean;
	projects: ProjectConfig[];
	seekTo: (t: number) => void;
}

const EditBindingConfiguration: FC<Props> = ({
	open,
	onClose,
	projectConfig,
	setProjectConfig,
	currentTime,
	videoDuration,
	saveProject,
	deleteProject,
	downloadAsJson,
	copyToClipboard,
	hasUnsavedChanges,
	projects,
	seekTo,
}) => {
	const currentTimeRef = useRef(0);
	const listRef = useRef<HTMLDivElement>(null);
	const [copySuccess, setCopySuccess] = useState(false);
	const [saveLoadingIcon, setSaveLoadingIcon] = useState<
		ReactNode | undefined
	>();
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [titleBuilderOpen, setTitleBuilderOpen] = useState(false);
	const [urlError, setUrlError] = useState<string | undefined>();

	const verseBindSaveEnabled = useVerseBindSaveEnabled();
	const { data: chaptersData } = useChapters();

	const { bindingConfig = [] } = projectConfig || {};

	const [chapter, verse] = useMemo(() => {
		if (projectConfig?.bindingConfig) {
			let i = 1;
			while (
				!bindingConfig.at(-i)?.k?.includes(':') &&
				i < bindingConfig.length
			) {
				i += 1;
			}
			if (bindingConfig?.at(-i)) {
				return bindingConfig?.at(-i)?.k?.split(':') || [];
			}
		}
		return ['1', '1'];
	}, [projectConfig?.bindingConfig]);

	const fullSurah = isFullSurah(projectConfig?.title);
	const derivedChapterNum = chapter ? Number(chapter) : undefined;
	const versesCount =
		fullSurah && derivedChapterNum
			? chaptersData?.suraByKey[derivedChapterNum]?.verses_count
			: undefined;
	const bindingPct = versesCount
		? Math.min(100, Math.round((bindingConfig.length / versesCount) * 100))
		: 0;

	const setBindingConfig = (bindingConf: VerseBindingElement[]) => {
		setProjectConfig({
			...projectConfig,
			bindingConfig: bindingConf,
		} as ProjectConfig);
	};

	const addNextBinding = useCallback(() => {
		setBindingConfig([
			...bindingConfig,
			{
				t: Number(currentTimeRef.current.toFixed(1)),
				k: `${chapter}:${Number(verse) + 1}`,
				id: (bindingConfig?.at(-1)?.id || 0) + 1,
			},
		]);
	}, [bindingConfig, chapter, verse, setBindingConfig, currentTimeRef]);

	const addBlankBinding = () => {
		setBindingConfig([
			...bindingConfig,
			{
				t: Number(currentTime.toFixed(1)),
				k: ``,
				id: (bindingConfig?.at(-1)?.id || 0) + 1,
			},
		]);
	};

	const removeBinding = (index: number) => {
		setBindingConfig(bindingConfig.filter((_, i) => i !== index));
	};

	const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
		setProjectConfig({
			...projectConfig,
			title: e.target.value,
		} as ProjectConfig);
	};

	const onChangeURL = (e: ChangeEvent<HTMLInputElement>) => {
		const newUrl = e.target.value;
		const duplicate = projects.find(
			(p) => p.videoUrl === newUrl && p.id !== projectConfig?.id
		);
		setUrlError(duplicate ? `Already used by "${duplicate.title}"` : undefined);
		setProjectConfig({
			...projectConfig,
			videoUrl: newUrl,
		} as ProjectConfig);
	};

	const onChangeTime = (id: number, e: ChangeEvent<HTMLInputElement>) => {
		setProjectConfig({
			...projectConfig,
			bindingConfig: bindingConfig.map((c) => {
				if (c.id === id) {
					return { ...c, t: Number(e.target.value) };
				}
				return c;
			}),
		} as ProjectConfig);
	};

	const onChangeVerseKey = (id: number, k = '') => {
		setProjectConfig({
			...projectConfig,
			bindingConfig: bindingConfig.map((c) => {
				if (c.id === id) {
					return { ...c, k };
				}
				return c;
			}),
		} as ProjectConfig);
	};

	const activeBindingIndex = useMemo(() => {
		let active = -1;
		for (let i = 0; i < bindingConfig.length; i++) {
			if (bindingConfig[i].t <= currentTime) active = i;
			else break;
		}
		return active;
	}, [bindingConfig, currentTime]);

	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime, currentTimeRef]);

	useEffect(() => {
		const activeEl = listRef.current?.querySelector('[data-active="true"]');
		activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}, [activeBindingIndex]);

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.code === 'Equal') {
				addNextBinding();
			}
		};
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	}, [addNextBinding]);

	return (
		<Panel $open={open}>
			<PanelInner>
				<PanelHeader>
					<PanelTitle>Edit timeline</PanelTitle>
					<Space size="small">
						{verseBindSaveEnabled && (
							<Link to="/edit-projects">
								<Button type="link" size="small">
									Projects
								</Button>
							</Link>
						)}
						<Button
							size="small"
							type="text"
							icon={<CloseOutlined />}
							onClick={onClose}
						/>
					</Space>
				</PanelHeader>
				<Wrapper>
					<ProjectDetailsArea>
						<InputItem>
							<InputLabel>Title:</InputLabel>
							<InputGroup>
								<Input
									type="text"
									value={projectConfig?.title}
									onChange={onChangeTitle}
									onKeyDown={(e) => e.stopPropagation()}
								/>
								<Button
									type="link"
									size="small"
									icon={<PlusCircleOutlined />}
									onClick={() => setTitleBuilderOpen(true)}
								/>
							</InputGroup>
						</InputItem>
						<TitleBuilderModal
							open={titleBuilderOpen}
							onClose={() => setTitleBuilderOpen(false)}
							onConfirm={(title) => {
								setProjectConfig({ ...projectConfig, title } as ProjectConfig);
								setTitleBuilderOpen(false);
							}}
							projects={projects}
							currentProjectId={projectConfig?.id}
						/>
						<InputItem>
							<InputLabel>Video:</InputLabel>
							<InputGroup>
								<Input
									type="text"
									value={projectConfig?.videoUrl}
									onChange={onChangeURL}
									onKeyDown={(e) => e.stopPropagation()}
									status={urlError ? 'error' : undefined}
								/>
							</InputGroup>
						</InputItem>
						{urlError && (
							<div
								style={{
									color: '#ff4d4f',
									fontSize: 12,
									marginTop: -8,
									paddingLeft: 52,
									lineHeight: 1.4,
								}}
							>
								{urlError}
							</div>
						)}
						{!!videoDuration && (
							<div
								style={{
									textAlign: 'right',
									fontSize: 11,
									color: 'rgba(0,0,0,0.5)',
									marginTop: -10,
									paddingRight: 2,
									fontVariantNumeric: 'tabular-nums',
									fontFamily: 'monospace',
									letterSpacing: '0.2px',
								}}
							>
								{(() => {
									const h = Math.floor(videoDuration / 3600);
									const m = Math.floor((videoDuration % 3600) / 60);
									const s = Math.floor(videoDuration % 60);
									const parts: string[] = [];
									if (h > 0) parts.push(`${h}h`);
									if (m > 0) parts.push(`${m}m`);
									if (s > 0) parts.push(`${s}s`);
									return `Duration ${parts.length ? parts.join(' ') : '0s'}`;
								})()}
							</div>
						)}
					</ProjectDetailsArea>
					{!!projectConfig?.videoUrl && (
						<>
							<BindingListContainer>
								<BindingListHeader>
									<span className="label">Entries</span>
									<span className="count">{bindingConfig.length}</span>
								</BindingListHeader>
								{versesCount !== undefined && (
									<BindingProgressBar
										$pct={bindingPct}
										$complete={bindingPct >= 100}
									/>
								)}
								<BindingListItems ref={listRef}>
									{bindingConfig.map((element, index) => (
										<BindingItem
											key={`${element.id}`}
											$active={index === activeBindingIndex}
											data-active={index === activeBindingIndex}
										>
											<Tooltip title="Jump to" mouseEnterDelay={0.6}>
												<Button
													icon={<CaretRightOutlined />}
													size="small"
													type="text"
													style={{
														flexShrink: 0,
														color:
															index === activeBindingIndex
																? '#1677ff'
																: undefined,
													}}
													onClick={() => seekTo(element.t)}
												/>
											</Tooltip>
											<Input
												size="small"
												type="number"
												value={element.t}
												step={0.1}
												onChange={(e) => onChangeTime(element.id, e)}
											/>
											<Input
												size="small"
												type="text"
												value={element.k}
												onChange={(e) =>
													onChangeVerseKey(element.id, e.target.value)
												}
											/>
											<ChapterSelector
												elementId={element.id}
												onChangeVerseKey={onChangeVerseKey}
											/>
											<Button
												className="binding-item-action"
												icon={<DeleteOutlined />}
												size="small"
												type="link"
												onClick={() => removeBinding(index)}
											/>
										</BindingItem>
									))}
									<BindingItem key={'add-controls'} className="right-align">
										<Button
											type="primary"
											onClick={addNextBinding}
											size="small"
										>{`＋ Next Verse (${`${chapter}:${
											Number(verse) + 1
										}`})`}</Button>
										<Button
											type="primary"
											onClick={addBlankBinding}
											size="small"
										>{`＋ Blank`}</Button>
									</BindingItem>
								</BindingListItems>
							</BindingListContainer>
							<ActionArea>
								{verseBindSaveEnabled && (
									<Button
										type="primary"
										danger
										onClick={() => setDeleteModalOpen(true)}
										disabled={hasUnsavedChanges}
										size="small"
										icon={<DeleteOutlined />}
									>
										Delete
									</Button>
								)}
								<Modal
									open={deleteModalOpen}
									title="Delete project"
									onCancel={() => setDeleteModalOpen(false)}
									footer={[
										<Button
											key="cancel"
											onClick={() => setDeleteModalOpen(false)}
										>
											Cancel
										</Button>,
										<Button
											key="delete"
											type="primary"
											danger
											loading={deleteLoading}
											onClick={async () => {
												setDeleteLoading(true);
												try {
													await deleteProject();
												} finally {
													setDeleteLoading(false);
													setDeleteModalOpen(false);
												}
											}}
										>
											Delete
										</Button>,
									]}
								>
									Deleting <strong>{projectConfig?.title}</strong> permanently.
									Are you sure?
								</Modal>
								<div style={{ flex: 1 }} />
								<Tooltip title="Copy to clipboard">
									<Button
										icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
										size="small"
										onClick={() =>
											copyToClipboard().then(() => {
												setCopySuccess(true);
												setTimeout(() => setCopySuccess(false), 3000);
											})
										}
									/>
								</Tooltip>
								<Tooltip title="Download JSON">
									<Button
										icon={<DownloadOutlined />}
										size="small"
										onClick={downloadAsJson}
									/>
								</Tooltip>
								{verseBindSaveEnabled && (
									<Button
										type="primary"
										icon={saveLoadingIcon || <SaveOutlined />}
										onClick={async () => {
											setSaveLoadingIcon(<LoadingOutlined type="primary" />);
											try {
												await saveProject();
												setSaveLoadingIcon(<CheckOutlined type="success" />);
											} catch (e) {
												setSaveLoadingIcon(
													<ExclamationOutlined type="danger" />
												);
											}
											setTimeout(() => {
												setSaveLoadingIcon(undefined);
											}, 3000);
										}}
										disabled={!hasUnsavedChanges}
										size="small"
									>
										Save
									</Button>
								)}
							</ActionArea>
						</>
					)}
				</Wrapper>
			</PanelInner>
		</Panel>
	);
};

export default EditBindingConfiguration;
