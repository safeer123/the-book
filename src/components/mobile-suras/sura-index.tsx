import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
	Link,
	useLocation,
	useNavigate,
	useSearchParams,
} from 'react-router-dom';
import { Spin } from 'antd';
import {
	ArrowRightOutlined,
	CloseCircleFilled,
	CustomerServiceOutlined,
	HistoryOutlined,
	HomeOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { useChapters } from 'data/use-chapters';
import { useAppTheme } from 'context/theme-context';
import { ChapterItem } from 'types';
import { useMobilePlayer } from './player-context';
import VerseMatches, { SectionLabel } from './verse-matches';
import {
	CenterBox,
	Column,
	Header,
	HeaderMain,
	HeaderSub,
	HeaderTitle,
	IconButton,
	Page,
	Scroller,
} from './styles';
import {
	BASE_PATH,
	chapterOfProject,
	filterChapters,
	getLastRead,
	listViewState,
	markOpenedFromList,
	parseVerseJump,
} from './utils';

const SearchWrap = styled.div`
	position: sticky;
	top: 0;
	z-index: 5;
	padding: 12px 16px 8px;
	background: linear-gradient(#faf7f0 75%, rgba(250, 247, 240, 0));

	[data-theme='dark'] & {
		background: linear-gradient(#14112b 75%, rgba(20, 17, 43, 0));
	}
`;

const SearchField = styled.label`
	display: flex;
	align-items: center;
	gap: 10px;
	height: 46px;
	padding: 0 6px 0 14px;
	border-radius: 14px;
	background: #fff;
	border: 1px solid rgba(14, 2, 121, 0.12);
	box-shadow: 0 2px 8px rgba(7, 1, 65, 0.05);
	color: rgba(7, 1, 65, 0.45);
	font-size: 16px;

	&:focus-within {
		border-color: rgba(14, 2, 121, 0.4);
		box-shadow: 0 0 0 3px rgba(14, 2, 121, 0.08);
	}

	[data-theme='dark'] & {
		background: #1e1b33;
		border-color: rgba(156, 142, 224, 0.2);
		color: #8b80b8;
		box-shadow: none;
	}

	[data-theme='dark'] &:focus-within {
		border-color: rgba(156, 142, 224, 0.55);
		box-shadow: 0 0 0 3px rgba(156, 142, 224, 0.15);
	}

	input {
		flex: 1;
		min-width: 0;
		height: 100%;
		border: none;
		outline: none;
		background: transparent;
		/* 16px keeps iOS Safari from zooming the page on focus. */
		font-size: 16px;
		color: rgb(7, 1, 65);
		-webkit-appearance: none;
	}

	input::placeholder {
		color: rgba(7, 1, 65, 0.4);
	}

	input::-webkit-search-cancel-button {
		display: none;
	}

	[data-theme='dark'] & input {
		color: #e8e2fa;
	}

	[data-theme='dark'] & input::placeholder {
		color: rgba(200, 192, 224, 0.4);
	}
`;

const ClearButton = styled.button`
	border: none;
	background: transparent;
	color: inherit;
	width: 36px;
	height: 36px;
	font-size: 16px;
	padding: 0;
	cursor: pointer;
`;

const Filters = styled.div`
	display: flex;
	gap: 8px;
	margin-top: 10px;
`;

const Chip = styled.button<{ $on: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 32px;
	padding: 0 12px;
	border-radius: 16px;
	font-size: 13px;
	cursor: pointer;
	border: 1px solid
		${({ $on }) => ($on ? 'rgb(14, 2, 121)' : 'rgba(14, 2, 121, 0.15)')};
	background: ${({ $on }) => ($on ? 'rgb(14, 2, 121)' : 'transparent')};
	color: ${({ $on }) => ($on ? '#fff' : 'rgba(7, 1, 65, 0.7)')};

	[data-theme='dark'] & {
		border-color: ${({ $on }) =>
			$on ? '#9c8ee0' : 'rgba(156, 142, 224, 0.25)'};
		background: ${({ $on }) => ($on ? '#9c8ee0' : 'transparent')};
		color: ${({ $on }) => ($on ? '#14112b' : '#c8c0e0')};
	}
`;

const Section = styled.div`
	padding: 0 16px;
`;

const FeatureCard = styled.button`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 14px;
	margin: 4px 0 12px;
	padding: 14px 16px;
	border-radius: 16px;
	border: none;
	text-align: left;
	cursor: pointer;
	color: #fff;
	background: linear-gradient(135deg, rgb(14, 2, 121), #4b3fb0);
	box-shadow: 0 6px 18px rgba(14, 2, 121, 0.25);

	[data-theme='dark'] & {
		background: linear-gradient(135deg, #3a2f7a, #5b4db8);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
	}

	&:active {
		transform: scale(0.99);
	}

	.anticon {
		font-size: 20px;
	}
`;

const FeatureText = styled.span`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;

	small {
		font-size: 12px;
		opacity: 0.75;
	}

	strong {
		font-size: 16px;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const Row = styled.button`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 14px;
	min-height: 68px;
	padding: 10px 16px;
	border: none;
	border-bottom: 1px solid rgba(14, 2, 121, 0.06);
	background: transparent;
	color: inherit;
	text-align: left;
	cursor: pointer;
	transition: background-color 0.12s ease;

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

// Rotated-square badge, echoing the octagram verse markers of printed
// mushafs without needing an SVG per row.
const NumberBadge = styled.span<{ $playing?: boolean }>`
	flex-shrink: 0;
	position: relative;
	width: 40px;
	height: 40px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
	color: ${({ $playing }) => ($playing ? '#fff' : 'rgb(14, 2, 121)')};

	&::before {
		content: '';
		position: absolute;
		inset: 6px;
		border-radius: 8px;
		transform: rotate(45deg);
		border: 1.5px solid rgba(14, 2, 121, 0.3);
		background: ${({ $playing }) =>
			$playing ? 'rgb(14, 2, 121)' : 'rgba(14, 2, 121, 0.04)'};
	}

	span {
		position: relative;
	}

	[data-theme='dark'] & {
		color: ${({ $playing }) => ($playing ? '#14112b' : '#d8d0f8')};
	}

	[data-theme='dark'] &::before {
		border-color: rgba(156, 142, 224, 0.45);
		background: ${({ $playing }) =>
			$playing ? '#9c8ee0' : 'rgba(156, 142, 224, 0.08)'};
	}
`;

const RowText = styled.span`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 3px;
`;

const RowName = styled.span`
	font-size: 16px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const RowMeta = styled.span`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	color: rgba(7, 1, 65, 0.55);
	white-space: nowrap;
	overflow: hidden;

	[data-theme='dark'] & {
		color: #a89cd8;
	}

	.anticon {
		color: rgb(14, 2, 121);
		opacity: 0.7;
	}

	[data-theme='dark'] & .anticon {
		color: #b8aaee;
		opacity: 1;
	}
`;

const RowArabic = styled.span`
	flex-shrink: 0;
	font-family: 'Amiri Quran', 'Scheherazade New', serif;
	font-size: 22px;
	line-height: 1.6;
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		color: #e8d9c0;
	}
`;

const SuraIndex = () => {
	const { data, isLoading, isError } = useChapters();
	const { recitationsByChapter, activeProject, isPlaying } = useMobilePlayer();
	const { mode, toggleTheme } = useAppTheme();
	const navigate = useNavigate();
	const location = useLocation();

	const [searchParams, setSearchParams] = useSearchParams();
	// A ?q= (e.g. from a redirected /suras search) wins over the remembered
	// query from the last visit.
	const [query, setQuery] = useState(
		() => searchParams.get('q') ?? listViewState.query
	);
	const [audioOnly, setAudioOnly] = useState(false);
	const scrollerRef = useRef<HTMLElement>(null);
	const lastRead = useMemo(getLastRead, []);

	const chapters = useMemo(() => data?.chapters || [], [data?.chapters]);
	const playingChapter = isPlaying ? chapterOfProject(activeProject) : 0;

	const results = useMemo(() => {
		const matched = filterChapters(chapters, query);
		return audioOnly
			? matched.filter((c) => recitationsByChapter.has(c.id))
			: matched;
	}, [chapters, query, audioOnly, recitationsByChapter]);

	const verseJump = useMemo(
		() => parseVerseJump(query, chapters),
		[query, chapters]
	);

	// Come back to the same spot in the list after reading a sura.
	useLayoutEffect(() => {
		if (!chapters.length || !scrollerRef.current) return;
		scrollerRef.current.scrollTop = listViewState.scrollTop;
	}, [chapters.length]);

	// Mirror the query into the URL (replacing, not pushing) so a refresh or
	// a shared link lands on the same results.
	useEffect(() => {
		listViewState.query = query;
		if ((searchParams.get('q') || '') === query.trim()) return;
		setSearchParams(
			(prev) => {
				if (query.trim()) prev.set('q', query.trim());
				else prev.delete('q');
				return prev;
			},
			{ replace: true }
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	const searchesVerses =
		query.trim().length >= 3 && !/^\d/.test(query.trim()) && !verseJump;

	const open = (chapterId: number, verse?: number) => {
		const params = new URLSearchParams(location.search);
		params.delete('v');
		params.delete('q');
		if (verse && verse > 1) params.set('v', String(verse));
		const search = params.toString();
		markOpenedFromList(true);
		navigate(`${BASE_PATH}/${chapterId}${search ? `?${search}` : ''}`);
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (verseJump) {
			open(verseJump.chapterId, verseJump.verse);
		} else if (results.length === 1) {
			open(results[0].id);
		}
	};

	const lastReadChapter: ChapterItem | undefined =
		lastRead && data?.suraByKey?.[lastRead.chapterId];

	let body: React.ReactNode;
	if (isLoading) {
		body = (
			<CenterBox>
				<Spin />
			</CenterBox>
		);
	} else if (isError) {
		body = (
			<CenterBox>
				Couldn&apos;t load the suras. Check your connection.
			</CenterBox>
		);
	} else if (!results.length && !verseJump && !searchesVerses) {
		body = (
			<CenterBox>
				<SearchOutlined style={{ fontSize: 28 }} />
				No sura matches &ldquo;{query}&rdquo;
			</CenterBox>
		);
	} else {
		body = results.map((chapter) => {
			const hasAudio = recitationsByChapter.has(chapter.id);
			return (
				<Row key={chapter.id} type="button" onClick={() => open(chapter.id)}>
					<NumberBadge $playing={playingChapter === chapter.id}>
						<span>{chapter.id}</span>
					</NumberBadge>
					<RowText>
						<RowName>{chapter.name_simple}</RowName>
						<RowMeta>
							<span>{chapter.translated_name?.name}</span>
							<span aria-hidden>·</span>
							<span>{chapter.verses_count} verses</span>
							{hasAudio && (
								<CustomerServiceOutlined aria-label="Recitation available" />
							)}
						</RowMeta>
					</RowText>
					<RowArabic dir="rtl" lang="ar">
						{chapter.name_arabic}
					</RowArabic>
				</Row>
			);
		});
	}

	return (
		<Page>
			<Header>
				<IconButton as={Link} to="/" aria-label="Home">
					<HomeOutlined />
				</IconButton>
				<HeaderTitle>
					<HeaderMain>The Quran</HeaderMain>
					<HeaderSub>114 suras · read & listen</HeaderSub>
				</HeaderTitle>
				<IconButton
					type="button"
					onClick={toggleTheme}
					aria-label={
						mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
					}
				>
					{mode === 'dark' ? '☀️' : '🌙'}
				</IconButton>
			</Header>
			<Scroller
				ref={scrollerRef}
				$playerOpen={Boolean(activeProject)}
				onScroll={(e) => {
					listViewState.scrollTop = e.currentTarget.scrollTop;
				}}
			>
				<Column>
					<SearchWrap>
						<form onSubmit={onSubmit} role="search">
							<SearchField>
								<SearchOutlined />
								<input
									type="search"
									inputMode="search"
									enterKeyHint="go"
									autoComplete="off"
									autoCorrect="off"
									spellCheck={false}
									placeholder="Sura, 2:255, or a word"
									value={query}
									onChange={(e) => {
										setQuery(e.target.value);
										if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
									}}
									aria-label="Search suras and verses"
								/>
								{query && (
									<ClearButton
										type="button"
										aria-label="Clear search"
										onClick={() => setQuery('')}
									>
										<CloseCircleFilled />
									</ClearButton>
								)}
							</SearchField>
						</form>
						{recitationsByChapter.size > 0 && (
							<Filters>
								<Chip
									type="button"
									$on={audioOnly}
									aria-pressed={audioOnly}
									onClick={() => setAudioOnly((v) => !v)}
								>
									<CustomerServiceOutlined />
									With recitation
								</Chip>
							</Filters>
						)}
					</SearchWrap>

					<Section>
						{verseJump && data?.suraByKey?.[verseJump.chapterId] && (
							<FeatureCard
								type="button"
								onClick={() => open(verseJump.chapterId, verseJump.verse)}
							>
								<FeatureText>
									<small>Go to verse</small>
									<strong>
										{data.suraByKey[verseJump.chapterId].name_simple} ·{' '}
										{verseJump.chapterId}:{verseJump.verse}
									</strong>
								</FeatureText>
								<ArrowRightOutlined />
							</FeatureCard>
						)}
						{!query && lastReadChapter && lastRead && (
							<FeatureCard
								type="button"
								onClick={() => open(lastRead.chapterId, lastRead.verse)}
							>
								<HistoryOutlined />
								<FeatureText>
									<small>Continue reading</small>
									<strong>
										{lastReadChapter.name_simple} · Verse {lastRead.verse}
									</strong>
								</FeatureText>
								<ArrowRightOutlined />
							</FeatureCard>
						)}
					</Section>

					{searchesVerses && results.length > 0 && (
						<SectionLabel>
							Suras<span>{results.length}</span>
						</SectionLabel>
					)}
					{body}
					{searchesVerses && (
						<VerseMatches
							query={query}
							onOpen={(chapterId, verse) => open(chapterId, verse)}
						/>
					)}
				</Column>
			</Scroller>
		</Page>
	);
};

export default SuraIndex;
