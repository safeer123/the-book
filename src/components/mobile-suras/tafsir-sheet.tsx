import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTafsirInfoById, useTafsirs } from 'data/use-tafsirs';
import { TafsirItem } from 'types';
import Sheet from './sheet';
import { CenterBox } from './styles';

const IBN_KATHIR_ID = 169;

// Horizontally scrolling chip row — the idiomatic phone picker for a short
// list of options, instead of a dropdown.
const Chips = styled.div`
	display: flex;
	gap: 8px;
	overflow-x: auto;
	scrollbar-width: none;
	margin: 0 -16px 8px;
	padding: 4px 16px 8px;

	&::-webkit-scrollbar {
		display: none;
	}
`;

const Chip = styled.button<{ $on: boolean }>`
	flex-shrink: 0;
	height: 36px;
	padding: 0 14px;
	border-radius: 18px;
	font-size: 13px;
	white-space: nowrap;
	cursor: pointer;
	border: 1px solid
		${({ $on }) => ($on ? 'rgb(14, 2, 121)' : 'rgba(14, 2, 121, 0.15)')};
	background: ${({ $on }) => ($on ? 'rgb(14, 2, 121)' : 'transparent')};
	color: ${({ $on }) => ($on ? '#fff' : 'inherit')};

	[data-theme='dark'] & {
		border-color: ${({ $on }) =>
			$on ? '#9c8ee0' : 'rgba(156, 142, 224, 0.25)'};
		background: ${({ $on }) => ($on ? '#9c8ee0' : 'transparent')};
		color: ${({ $on }) => ($on ? '#14112b' : 'inherit')};
	}
`;

const Text = styled.article`
	font-family: Georgia, 'Times New Roman', serif;
	font-size: 17px;
	line-height: 1.7;
	color: rgba(7, 1, 65, 0.88);
	overflow-wrap: anywhere;

	[data-theme='dark'] & {
		color: #d8d0f0;
	}

	h1,
	h2,
	h3 {
		font-size: 18px;
		line-height: 1.4;
		margin: 20px 0 8px;
		color: inherit;
	}

	p {
		margin: 0 0 14px;
	}

	/* Quoted Arabic inside the commentary. */
	[lang='ar'],
	.arabic {
		font-family: 'Amiri Quran', 'Scheherazade New', serif;
		font-size: 22px;
		line-height: 2;
		direction: rtl;
	}
`;

const Nav = styled.div`
	display: flex;
	gap: 10px;
`;

const NavButton = styled.button`
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	height: 46px;
	border-radius: 14px;
	font-size: 15px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
	cursor: pointer;
	color: rgb(14, 2, 121);
	background: rgba(14, 2, 121, 0.06);
	border: none;

	&:disabled {
		opacity: 0.35;
	}

	[data-theme='dark'] & {
		color: #d8d0f8;
		background: rgba(156, 142, 224, 0.14);
	}
`;

const titleOf = (t: TafsirItem) =>
	`${t.name || t.slug || 'Tafsir'}${
		t.language_name && t.language_name !== 'english'
			? ` · ${t.language_name.charAt(0).toUpperCase()}${t.language_name.slice(
					1
			  )}`
			: ''
	}`;

interface Props {
	verseKey: string | undefined;
	versesCount: number;
	onClose: () => void;
	onNavigate: (verseKey: string) => void;
}

const TafsirSheet = ({ verseKey, versesCount, onClose, onNavigate }: Props) => {
	// Keep the last verse's content while the sheet slides away.
	const lastKeyRef = useRef(verseKey);
	if (verseKey) lastKeyRef.current = verseKey;
	const shownKey = lastKeyRef.current;

	// Tafsir names are merged in at fetch time, so wait for the lookup
	// before fetching a verse's tafsirs.
	const { isSuccess: infoReady } = useTafsirInfoById();
	const config = useMemo(
		() => (shownKey && infoReady ? { verseKey: shownKey } : undefined),
		[shownKey, infoReady]
	);
	const { data, isLoading } = useTafsirs(config);
	const [selectedId, setSelectedId] = useState<number | undefined>();
	const bodyTopRef = useRef<HTMLDivElement>(null);

	const options = useMemo(() => {
		const withText = (data || []).filter((t) => t.text?.trim());
		// English first (the app's default reading language), then others.
		return [
			...withText.filter((t) => t.language_name === 'english'),
			...withText.filter((t) => t.language_name !== 'english'),
		];
	}, [data]);

	const selected =
		options.find((t) => t.resource_id === selectedId) ||
		options.find((t) => t.resource_id === IBN_KATHIR_ID) ||
		options[0];

	useEffect(() => {
		bodyTopRef.current?.scrollIntoView({ block: 'start' });
	}, [shownKey, selected?.resource_id]);

	const [chapter, verse] = (shownKey || '0:0').split(':').map(Number);
	const go = (n: number) => onNavigate(`${chapter}:${n}`);

	let content: React.ReactNode;
	if (!infoReady || isLoading) {
		content = (
			<CenterBox>
				<Spin />
			</CenterBox>
		);
	} else if (!selected) {
		content = <CenterBox>No tafsir is available for this verse.</CenterBox>;
	} else {
		content = (
			<>
				{options.length > 1 && (
					<Chips role="tablist" aria-label="Tafsir">
						{options.map((t) => (
							<Chip
								key={t.resource_id}
								type="button"
								role="tab"
								aria-selected={t.resource_id === selected.resource_id}
								$on={t.resource_id === selected.resource_id}
								onClick={() => setSelectedId(t.resource_id)}
							>
								{titleOf(t)}
							</Chip>
						))}
					</Chips>
				)}
				<Text
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.text) }}
				/>
			</>
		);
	}

	return (
		<Sheet
			title={shownKey ? `Tafsir · ${shownKey}` : 'Tafsir'}
			open={Boolean(verseKey)}
			onClose={onClose}
			tall
			footer={
				<Nav>
					<NavButton
						type="button"
						disabled={verse <= 1}
						onClick={() => go(verse - 1)}
					>
						<LeftOutlined /> Verse {Math.max(1, verse - 1)}
					</NavButton>
					<NavButton
						type="button"
						disabled={verse >= versesCount}
						onClick={() => go(verse + 1)}
					>
						Verse {Math.min(versesCount, verse + 1)} <RightOutlined />
					</NavButton>
				</Nav>
			}
		>
			<div ref={bodyTopRef} />
			{content}
		</Sheet>
	);
};

export default TafsirSheet;
