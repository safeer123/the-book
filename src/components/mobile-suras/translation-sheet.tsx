import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { TranslationItem, useTranslations } from 'data/use-translations';
import { DEFAULT_TRANSLATION_ID } from 'data/constants';
import {
	getTopHitTranslations,
	updateHitCount,
} from 'components/sura-list/results/top-hit-translations';
import Sheet from './sheet';
import { CenterBox } from './styles';
import { normalizeForSearch } from './utils';

const SearchBox = styled.label`
	display: flex;
	align-items: center;
	gap: 10px;
	height: 44px;
	margin: 0 16px 8px;
	padding: 0 14px;
	border-radius: 12px;
	background: rgba(14, 2, 121, 0.05);
	color: rgba(7, 1, 65, 0.45);

	[data-theme='dark'] & {
		background: rgba(156, 142, 224, 0.12);
		color: #8b80b8;
	}

	input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		/* 16px keeps iOS from zooming in on focus. */
		font-size: 16px;
		color: rgb(7, 1, 65);
	}

	[data-theme='dark'] & input {
		color: #e8e2fa;
	}
`;

// Solid backing so rows don't show through the sticky search box.
const SearchBacking = styled.div`
	position: sticky;
	top: 0;
	z-index: 1;
	padding-top: 4px;
	background: #fffdf8;

	[data-theme='dark'] & {
		background: #1e1b33;
	}
`;

const GroupLabel = styled.div`
	padding: 14px 20px 6px;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: rgba(7, 1, 65, 0.5);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const Row = styled.button<{ $selected: boolean }>`
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	min-height: 56px;
	padding: 8px 20px;
	border: none;
	text-align: left;
	cursor: pointer;
	color: inherit;
	background: ${({ $selected }) =>
		$selected ? 'rgba(14, 2, 121, 0.07)' : 'transparent'};

	&:active {
		background: rgba(14, 2, 121, 0.1);
	}

	[data-theme='dark'] & {
		background: ${({ $selected }) =>
			$selected ? 'rgba(156, 142, 224, 0.16)' : 'transparent'};
	}

	.anticon {
		color: rgb(14, 2, 121);
		font-size: 16px;
	}

	[data-theme='dark'] & .anticon {
		color: #c8bcf4;
	}
`;

const RowText = styled.span`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;

	strong {
		font-size: 15px;
		font-weight: 600;
	}

	small {
		font-size: 12px;
		opacity: 0.6;
	}
`;

const capitalize = (text: string) =>
	text
		.split(',')
		.map((w) => w.trim().charAt(0).toUpperCase() + w.trim().slice(1))
		.join(', ');

interface Props {
	open: boolean;
	onClose: () => void;
	onPicked?: (item: TranslationItem) => void;
}

const TranslationSheet = ({ open, onClose, onPicked }: Props) => {
	const { data, isLoading, isError } = useTranslations();
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState('');
	const selectedId = Number(searchParams.get('tr') || DEFAULT_TRANSLATION_ID);

	// Recently used (shared with /suras' "top hits"), then the current
	// translation's language, English, and the rest alphabetically.
	const groups = useMemo(() => {
		const all = data?.translations || [];
		const q = normalizeForSearch(query);
		const matches = (t: TranslationItem) =>
			!q ||
			[t.name, t.author_name, t.language_name].some((f) =>
				normalizeForSearch(f || '').includes(q)
			);

		const selectedLang = all.find((t) => t.id === selectedId)?.language_name;
		const byLang = new Map<string, TranslationItem[]>();
		all.filter(matches).forEach((t) => {
			const list = byLang.get(t.language_name) || [];
			list.push(t);
			byLang.set(t.language_name, list);
		});
		const rank = (lang: string) => {
			if (lang === selectedLang) return 0;
			if (lang === 'english') return 1;
			return 2;
		};
		const langGroups = Array.from(byLang.entries())
			.sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
			.map(([lang, items]) => ({ label: capitalize(lang), items }));

		const recent = q
			? []
			: getTopHitTranslations()
					.map((hit) => all.find((t) => t.id === hit.id))
					.filter((t): t is TranslationItem => Boolean(t));
		return recent.length
			? [{ label: 'Recently used', items: recent }, ...langGroups]
			: langGroups;
	}, [data?.translations, query, selectedId]);

	const pick = (item: TranslationItem) => {
		updateHitCount(item);
		// Replace rather than push, so the back gesture still leaves the
		// sura instead of stepping back through translation changes.
		setSearchParams(
			(prev) => {
				prev.set('tr', String(item.id));
				return prev;
			},
			{ replace: true }
		);
		onPicked?.(item);
		onClose();
	};

	let body: React.ReactNode;
	if (isLoading) {
		body = (
			<CenterBox>
				<Spin />
			</CenterBox>
		);
	} else if (isError) {
		body = <CenterBox>Couldn&apos;t load translations.</CenterBox>;
	} else if (!groups.length) {
		body = <CenterBox>No translation matches &ldquo;{query}&rdquo;</CenterBox>;
	} else {
		body = groups.map((group) => (
			<div key={group.label}>
				<GroupLabel>{group.label}</GroupLabel>
				{group.items.map((t) => (
					<Row
						key={`${group.label}-${t.id}`}
						type="button"
						$selected={t.id === selectedId}
						aria-pressed={t.id === selectedId}
						onClick={() => pick(t)}
					>
						<RowText>
							<strong>{t.name}</strong>
							{t.author_name && t.author_name !== t.name && (
								<small>{t.author_name}</small>
							)}
						</RowText>
						{t.id === selectedId && <CheckOutlined />}
					</Row>
				))}
			</div>
		));
	}

	return (
		<Sheet title="Translation" open={open} onClose={onClose} tall flush>
			<SearchBacking>
				<SearchBox>
					<SearchOutlined />
					<input
						type="search"
						inputMode="search"
						autoComplete="off"
						placeholder="Search language or translator"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						aria-label="Search translations"
					/>
				</SearchBox>
			</SearchBacking>
			{body}
		</Sheet>
	);
};

export default TranslationSheet;
