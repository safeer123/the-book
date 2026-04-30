import { AutoComplete, Button, Modal } from 'antd';
import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useChapters } from 'data/use-chapters';
import { ProjectConfig } from 'types';

const Fields = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding-top: 8px;
`;

interface Props {
	open: boolean;
	onClose: () => void;
	onConfirm: (title: string) => void;
	projects: ProjectConfig[];
	currentProjectId?: string;
}

const TitleBuilderModal: FC<Props> = ({
	open,
	onClose,
	onConfirm,
	projects,
	currentProjectId,
}) => {
	const [selectedSurah, setSelectedSurah] = useState<string | undefined>();
	const [selectedReciter, setSelectedReciter] = useState<string | undefined>();

	const { data: chapterData } = useChapters();

	const surahOptions = useMemo(
		() =>
			(chapterData?.chapters || []).map((c) => ({
				value: c.name_simple,
				label: `${c.id}: ${c.name_simple} ${c.name_arabic} (${c.translated_name.name})`,
			})),
		[chapterData]
	);

	const reciterOptions = useMemo(() => {
		const names = new Set<string>();
		projects.forEach((p) => {
			if (p.id === currentProjectId) return;
			const parts = p.title.split(' - ');
			if (parts.length >= 2) {
				names.add(parts.slice(1).join(' - '));
			}
		});
		return Array.from(names).map((name) => ({ value: name, label: name }));
	}, [projects, currentProjectId]);

	const handleClose = () => {
		setSelectedSurah(undefined);
		setSelectedReciter(undefined);
		onClose();
	};

	const handleConfirm = () => {
		if (selectedSurah && selectedReciter) {
			onConfirm(`Surah ${selectedSurah} - ${selectedReciter}`);
			setSelectedSurah(undefined);
			setSelectedReciter(undefined);
		}
	};

	return (
		<Modal
			open={open}
			title="Title builder"
			onCancel={handleClose}
			footer={[
				<Button key="cancel" onClick={handleClose}>
					Cancel
				</Button>,
				<Button
					key="ok"
					type="primary"
					disabled={!selectedSurah || !selectedReciter}
					onClick={handleConfirm}
				>
					OK
				</Button>,
			]}
		>
			<Fields>
				<AutoComplete
					placeholder="Select surah..."
					options={surahOptions}
					filterOption={(input, option) =>
						option?.label.toUpperCase().includes(input.toUpperCase()) ?? false
					}
					value={selectedSurah}
					onChange={setSelectedSurah}
					allowClear
					popupMatchSelectWidth={380}
				/>
				<AutoComplete
					placeholder="Select reciter..."
					options={reciterOptions}
					filterOption={(input, option) =>
						option?.label.toUpperCase().includes(input.toUpperCase()) ?? false
					}
					value={selectedReciter}
					onChange={setSelectedReciter}
					allowClear
					popupMatchSelectWidth={380}
				/>
			</Fields>
		</Modal>
	);
};

export default TitleBuilderModal;
