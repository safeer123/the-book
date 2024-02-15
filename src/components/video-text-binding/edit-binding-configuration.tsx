import { Button, Drawer as AntDrawer, Space, Input } from 'antd';
import {
	ChangeEvent,
	FC,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import styled from 'styled-components';
import { ProjectConfig, VerseBindingElement } from 'types';

const Drawer = styled(AntDrawer)`
	&& .ant-drawer-wrapper-body {
		position: relative;
		background-color: rgba(255, 255, 255, 0.651);
		background-image: url(https://www.transparenttextures.com/patterns/textured-paper.png);
	}
`;

const Wrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	height: calc(100% - 16px);
`;

const ProjectDetailsArea = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
`;

const InputItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	input {
		width: 200px;
	}
`;

const InputLabel = styled.span`
	color: #5c5c5c;
	font-size: 12px;
	margin-right: 8px;
`;

const BindingListItems = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	overflow-y: auto;
	border: 1px solid #727272;
	border-radius: 5px;

	.right-align {
		justify-content: flex-end;
	}
`;
const BindingItem = styled.div`
	display: flex;
	gap: 16px;
`;

const ActionArea = styled.div`
	display: flex;
	gap: 16px;
	padding: 16px;
	justify-content: flex-end;
`;

interface Props {
	open?: boolean;
	onClose: () => void;
	projectConfig?: ProjectConfig;
	setProjectConfig: (conf: ProjectConfig) => void;
	currentTime: number;
	saveProject: () => void;
	downloadAsJson: () => void;
	hasUnsavedChanges: boolean;
}

const EditBindingConfiguration: FC<Props> = ({
	open,
	onClose,
	projectConfig,
	setProjectConfig,
	currentTime,
	saveProject,
	downloadAsJson,
	hasUnsavedChanges,
}) => {
	const currentTimeRef = useRef(0);

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

	const onChangeVerseKey = (id: number, e: ChangeEvent<HTMLInputElement>) => {
		setProjectConfig({
			...projectConfig,
			bindingConfig: bindingConfig.map((c) => {
				if (c.id === id) {
					return { ...c, k: String(e.target.value) };
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
								onChange={(e) => onChangeVerseKey(element.id, e)}
							/>
							<Button
								size="small"
								type="link"
								onClick={() => removeBinding(index)}
							>
								Remove
							</Button>
						</BindingItem>
					))}
					<BindingItem key={'add-controls'} className="right-align">
						<Button
							type="primary"
							onClick={addNextBinding}
						>{`＋ Next Verse (${`${chapter}:${Number(verse) + 1}`})`}</Button>
						<Button
							type="primary"
							onClick={addBlankBinding}
						>{`＋ Blank`}</Button>
					</BindingItem>
				</BindingListItems>
				<ActionArea>
					<Button type="primary" onClick={downloadAsJson}>
						Download as JSON
					</Button>
					<Button
						type="primary"
						onClick={saveProject}
						disabled={!hasUnsavedChanges}
					>
						Save
					</Button>
				</ActionArea>
			</Wrapper>
		</Drawer>
	);
};

export default EditBindingConfiguration;
