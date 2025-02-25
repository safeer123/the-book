/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Space, Input } from 'antd';
import {
	CheckOutlined,
	DeleteOutlined,
	ExclamationOutlined,
	LoadingOutlined,
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
import {
	Drawer,
	ProjectDetailsArea,
	Wrapper,
	InputItem,
	InputLabel,
	BindingItem,
	BindingListItems,
	ActionArea,
} from './styles';
import { useVerseBindSaveEnabled } from 'data/use-verse-bind-save-enabled';

interface Props {
	open?: boolean;
	onClose: () => void;
	projectConfig?: ProjectConfig;
	setProjectConfig: (conf: ProjectConfig) => void;
	currentTime: number;
	saveProject: () => Promise<void>;
	deleteProject: () => void;
	downloadAsJson: () => void;
	copyToClipboard: () => Promise<void>;
	hasUnsavedChanges: boolean;
}

const EditBindingConfiguration: FC<Props> = ({
	open,
	onClose,
	projectConfig,
	setProjectConfig,
	currentTime,
	saveProject,
	deleteProject,
	downloadAsJson,
	copyToClipboard,
	hasUnsavedChanges,
}) => {
	const currentTimeRef = useRef(0);
	const [copyBtnLabel, setCopyBtnLabel] = useState('Copy');
	const [saveLoadingIcon, setSaveLoadingIcon] = useState<
		ReactNode | undefined
	>();

	const verseBindSaveEnabled = useVerseBindSaveEnabled();

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
		setBindingConfig(bindingConfig.filter((item, i) => i !== index));
	};

	const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
		setProjectConfig({
			...projectConfig,
			title: e.target.value,
		} as ProjectConfig);
	};

	const onChangeURL = (e: ChangeEvent<HTMLInputElement>) => {
		setProjectConfig({
			...projectConfig,
			videoUrl: e.target.value,
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

	useEffect(() => {
		currentTimeRef.current = currentTime;
	}, [currentTime, currentTimeRef]);

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
		<Drawer
			maskClosable={false}
			mask={false}
			title={'Edit verse bindings'}
			placement="right"
			width={'380px'}
			size="default"
			onClose={onClose}
			open={open}
			extra={
				<Space>
					<Button onClick={onClose}>Close</Button>
				</Space>
			}
		>
			<Wrapper>
				<ProjectDetailsArea>
					<InputItem>
						<InputLabel>Title: </InputLabel>
						<Input
							type="text"
							value={projectConfig?.title}
							onChange={onChangeTitle}
							onKeyDown={(e) => e.stopPropagation()}
						/>
					</InputItem>
					<InputItem>
						<InputLabel>Video URL: </InputLabel>
						<Input
							type="text"
							value={projectConfig?.videoUrl}
							onChange={onChangeURL}
							onKeyDown={(e) => e.stopPropagation()}
						/>
					</InputItem>
				</ProjectDetailsArea>
				{!!projectConfig?.videoUrl && (
					<>
						<BindingListItems>
							{bindingConfig.map((element, index) => (
								<BindingItem key={`${element.id}`}>
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
						{verseBindSaveEnabled && (
							<ActionArea>
								<Button
									type="primary"
									danger
									onClick={deleteProject}
									disabled={hasUnsavedChanges}
									size="small"
									icon={<DeleteOutlined />}
								>
									Delete
								</Button>
								<Button
									type="primary"
									icon={saveLoadingIcon || <SaveOutlined />}
									onClick={async () => {
										setSaveLoadingIcon(<LoadingOutlined type="primary" />);
										try {
											await saveProject();
											setSaveLoadingIcon(<CheckOutlined type="success" />);
										} catch (e) {
											setSaveLoadingIcon(<ExclamationOutlined type="danger" />);
											// Error in saving
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
							</ActionArea>
						)}
						<ActionArea>
							<Button
								type="primary"
								onClick={() =>
									copyToClipboard().then(() => {
										setCopyBtnLabel('Copied ✓');
										setTimeout(() => {
											setCopyBtnLabel('Copy');
										}, 3000);
									})
								}
								size="small"
							>
								{copyBtnLabel}
							</Button>
							<Button type="primary" onClick={downloadAsJson} size="small">
								Download
							</Button>
						</ActionArea>
					</>
				)}
			</Wrapper>
		</Drawer>
	);
};

export default EditBindingConfiguration;
