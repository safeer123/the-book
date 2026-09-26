import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { Spin } from 'antd';
import useSearch from 'data/use-search';
import { useChapters } from 'data/use-chapters';
import { SearchConfig } from 'types';
import { CenterBox } from './styles';

const PAGE_SIZE = 30;
const DEBOUNCE_MS = 300;
const SNIPPET_RADIUS = 70;
const SEARCH_CONFIG: SearchConfig = { matchCase: false, fullWord: false };

export const SectionLabel = styled.div`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 8px;
	padding: 18px 16px 6px;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: rgba(7, 1, 65, 0.5);

	[data-theme='dark'] & {
		color: #a89cd8;
	}

	span {
		font-weight: 500;
		letter-spacing: 0;
		text-transform: none;
	}
`;

const Row = styled.button`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 12px 16px;
	border: none;
	border-bottom: 1px solid rgba(14, 2, 121, 0.06);
	background: transparent;
	color: inherit;
	text-align: left;
	cursor: pointer;

	&:active {
		background: rgba(14, 2, 121, 0.05);
	}

	[data-theme='dark'] & {
		border-bottom-color: rgba(156, 142, 224, 0.08);
	}

	[data-theme='dark'] &:active {
		background: rgba(156, 142, 224, 0.1);
	}
`;

const RowHead = styled.span`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: rgba(7, 1, 65, 0.55);

	[data-theme='dark'] & {
		color: #a89cd8;
	}

	b {
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: rgb(14, 2, 121);
		background: rgba(14, 2, 121, 0.06);
	}

	[data-theme='dark'] & b {
		color: #d8d0f8;
		background: rgba(156, 142, 224, 0.14);
	}
`;

const Snippet = styled.span`
	font-size: 15px;
	line-height: 1.55;
	color: rgba(7, 1, 65, 0.85);

	[data-theme='dark'] & {
		color: #d0c8e8;
	}

	mark {
		padding: 0 2px;
		border-radius: 3px;
		color: inherit;
		background: rgba(255, 196, 0, 0.35);
	}
`;

const MoreButton = styled.button`
	display: block;
	width: calc(100% - 32px);
	height: 46px;
	margin: 12px 16px;
	border-radius: 14px;
	border: 1px solid rgba(14, 2, 121, 0.15);
	background: transparent;
	color: rgb(14, 2, 121);
	font-size: 15px;
	font-weight: 600;
	cursor: pointer;

	[data-theme='dark'] & {
		border-color: rgba(156, 142, 224, 0.3);
		color: #d8d0f8;
	}
`;

const toPlain = (html: string) =>
	sanitizeHtml(html.replace(/<sup[^>]*>.*?<\/sup>/g, ''), {
		allowedTags: [],
		allowedAttributes: {},
	});

// A short window of the translation around the first match, with the match
// highlighted — enough context to recognise the verse at a glance.
const snippetOf = (text: string, query: string) => {
	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if (idx < 0)
		return { before: text.slice(0, SNIPPET_RADIUS * 2), hit: '', after: '' };
	const from = Math.max(0, idx - SNIPPET_RADIUS);
	const to = Math.min(text.length, idx + query.length + SNIPPET_RADIUS);
	return {
		before: `${from > 0 ? '…' : ''}${text.slice(from, idx)}`,
		hit: text.slice(idx, idx + query.length),
		after: `${text.slice(idx + query.length, to)}${
			to < text.length ? '…' : ''
		}`,
	};
};

interface Props {
	query: string;
	onOpen: (chapterId: number, verse: number) => void;
}

// Verses whose translation contains the query — the phone counterpart of
// /suras' free-text search.
const VerseMatches = ({ query, onOpen }: Props) => {
	const [debounced, setDebounced] = useState(query.trim());
	const [limit, setLimit] = useState(PAGE_SIZE);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebounced(query.trim());
			setLimit(PAGE_SIZE);
		}, DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [query]);

	const { result, loading } = useSearch({
		searchKey: debounced,
		config: SEARCH_CONFIG,
		only: 've',
	});
	const { data: chapterData } = useChapters();
	const verses = result.verses;
	const shown = useMemo(() => verses.slice(0, limit), [verses, limit]);

	if (loading || debounced !== query.trim()) {
		return (
			<>
				<SectionLabel>Verses</SectionLabel>
				<CenterBox>
					<Spin />
				</CenterBox>
			</>
		);
	}

	return (
		<>
			<SectionLabel>
				Verses
				<span>
					{verses.length
						? `${verses.length} mentioning “${debounced}”`
						: `None mention “${debounced}”`}
				</span>
			</SectionLabel>
			{shown.map((verse) => {
				const [ch, v] = verse.verse_key.split(':').map(Number);
				const { before, hit, after } = snippetOf(
					toPlain(verse.translation || ''),
					debounced
				);
				return (
					<Row
						key={verse.verse_key}
						type="button"
						onClick={() => onOpen(ch, v)}
					>
						<RowHead>
							<b>{verse.verse_key}</b>
							{chapterData?.suraByKey?.[ch]?.name_simple}
						</RowHead>
						<Snippet dir="auto">
							{before}
							{hit && <mark>{hit}</mark>}
							{after}
						</Snippet>
					</Row>
				);
			})}
			{verses.length > limit && (
				<MoreButton
					type="button"
					onClick={() => setLimit((n) => n + PAGE_SIZE)}
				>
					Show more ({verses.length - limit} left)
				</MoreButton>
			)}
		</>
	);
};

export default VerseMatches;
