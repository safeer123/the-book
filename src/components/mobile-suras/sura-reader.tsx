import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { Spin } from 'antd';
import {
	ArrowLeftOutlined,
	ArrowRightOutlined,
	CaretRightFilled,
	CheckOutlined,
	CopyOutlined,
	DownOutlined,
	FontSizeOutlined,
	PauseOutlined,
	ReadOutlined,
	ShareAltOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import {
	useLocation,
	useNavigate,
	useNavigationType,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { useChapters } from 'data/use-chapters';
import { useVerses } from 'data/use-verses';
import { BISMI } from 'data/constants';
import { getReciterFromTitle } from 'utils/project-utils';
import { useMobileSuras } from '.';
import { useMobilePlayer } from './player-context';
import { TEXT_SIZES, useReaderPrefs } from './prefs';
import Sheet from './sheet';
import TranslationSheet from './translation-sheet';
import SettingsSheet from './settings-sheet';
import TafsirSheet from './tafsir-sheet';
import {
	CenterBox,
	Column,
	Header,
	HeaderMain,
	HeaderSub,
	HeaderTitle,
	IconButton,
	Page,
	PLAYER_HEIGHT,
	Scroller,
} from './styles';
import {
	BASE_PATH,
	chapterOfProject,
	saveLastRead,
	verseNumOf,
	wasOpenedFromList,
} from './utils';

const ACCENT = 'rgb(14, 2, 121)';
const ACCENT_DARK = '#9c8ee0';

// ─── Header bits ──────────────────────────────────────────────────────────────

const TitleButton = styled.button`
	flex: 1;
	min-width: 0;
	border: none;
	background: transparent;
	color: inherit;
	text-align: left;
	padding: 0;
	cursor: pointer;
`;

const SubWithCaret = styled(HeaderSub)`
	display: flex;
	align-items: center;
	gap: 4px;

	.anticon {
		font-size: 9px;
	}
`;

// ─── Intro card ──────────────────────────────────────────────────────────────

const Intro = styled.section`
	margin: 16px 16px 8px;
	padding: 22px 18px 18px;
	border-radius: 20px;
	text-align: center;
	background: linear-gradient(160deg, #fffdf8, #f1ecff);
	border: 1px solid rgba(14, 2, 121, 0.08);
	box-shadow: 0 6px 20px rgba(7, 1, 65, 0.06);

	[data-theme='dark'] & {
		background: linear-gradient(160deg, #221d3d, #1a1730);
		border-color: rgba(156, 142, 224, 0.16);
		box-shadow: none;
	}
`;

const IntroArabic = styled.div`
	font-family: 'Amiri Quran', 'Scheherazade New', serif;
	font-size: 40px;
	line-height: 1.5;
	color: ${ACCENT};

	[data-theme='dark'] & {
		color: #e8d9c0;
	}
`;

const IntroName = styled.div`
	margin-top: 2px;
	font-size: 18px;
	font-weight: 650;
`;

const IntroMeta = styled.div`
	margin-top: 4px;
	font-size: 13px;
	color: rgba(7, 1, 65, 0.55);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const IntroActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 8px;
	margin-top: 16px;
`;

const PillButton = styled.button<{ $primary?: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	height: 42px;
	max-width: 100%;
	padding: 0 18px;
	border-radius: 21px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	border: 1px solid rgba(14, 2, 121, 0.2);
	background: transparent;
	color: ${ACCENT};

	[data-theme='dark'] & {
		border-color: rgba(156, 142, 224, 0.35);
		color: #d8d0f8;
	}

	${({ $primary }) =>
		$primary &&
		css`
			border: none;
			background: ${ACCENT};
			color: #fff;
			box-shadow: 0 4px 14px rgba(14, 2, 121, 0.3);

			[data-theme='dark'] & {
				background: ${ACCENT_DARK};
				color: #14112b;
			}
		`}

	&:active {
		transform: scale(0.97);
	}
`;

const Bismillah = styled.div`
	margin: 20px 16px 4px;
	text-align: center;
	font-family: 'Amiri Quran', 'Scheherazade New', serif;
	font-size: 26px;
	line-height: 2;
	color: ${ACCENT};

	[data-theme='dark'] & {
		color: #e8d9c0;
	}
`;

// ─── Verses ──────────────────────────────────────────────────────────────────

const VerseCard = styled.article<{ $active: boolean }>`
	position: relative;
	margin: 0 8px;
	padding: 12px 12px 18px;
	border-radius: 16px;
	scroll-margin-top: 12px;
	transition: background-color 0.3s ease;
	background: ${({ $active }) =>
		$active ? 'rgba(14, 2, 121, 0.06)' : 'transparent'};

	[data-theme='dark'] & {
		background: ${({ $active }) =>
			$active ? 'rgba(156, 142, 224, 0.14)' : 'transparent'};
	}

	/* Straight hairline divider (a border-bottom would curve with the
	   card's radius). */
	&::after {
		content: '';
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 0;
		height: 1px;
		background: rgba(14, 2, 121, 0.08);
	}

	[data-theme='dark'] &::after {
		background: rgba(156, 142, 224, 0.12);
	}

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 14px;
		bottom: 14px;
		width: 3px;
		border-radius: 2px;
		background: ${({ $active }) => ($active ? ACCENT : 'transparent')};
	}

	[data-theme='dark'] &::before {
		background: ${({ $active }) => ($active ? ACCENT_DARK : 'transparent')};
	}
`;

const VerseTop = styled.div`
	display: flex;
	align-items: center;
	gap: 2px;
`;

const VerseKey = styled.span`
	margin-right: auto;
	padding: 3px 10px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
	color: ${ACCENT};
	background: rgba(14, 2, 121, 0.06);

	[data-theme='dark'] & {
		color: #d8d0f8;
		background: rgba(156, 142, 224, 0.14);
	}
`;

const ActionButton = styled(IconButton)`
	font-size: 18px;
	color: rgba(7, 1, 65, 0.6);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

// Filled while it's the verse being recited (a class rather than a
// transient prop: styled() of a styled(button) loses the prop typing here).
const PlayVerseButton = styled(ActionButton)`
	color: ${ACCENT};

	[data-theme='dark'] & {
		color: #c8bcf4;
	}

	&&.is-current {
		background: ${ACCENT};
		color: #fff;
	}

	[data-theme='dark'] &&.is-current {
		background: ${ACCENT_DARK};
		color: #14112b;
	}
`;

const ArabicText = styled.p<{ $size: number }>`
	margin: 10px 4px 0;
	font-family: 'Amiri Quran', 'Scheherazade New', serif;
	font-size: ${({ $size }) => $size}px;
	line-height: 2.15;
	text-align: right;
	color: rgb(7, 1, 65);
	word-spacing: 0.04em;

	[data-theme='dark'] & {
		color: #f3ecdc;
	}
`;

const TranslationText = styled.div<{ $size: number }>`
	margin: 8px 4px 0;
	font-size: ${({ $size }) => $size}px;
	line-height: 1.65;
	color: rgba(7, 1, 65, 0.78);

	[data-theme='dark'] & {
		color: #bdb5d6;
	}

	sup {
		font-size: 0.65em;
		opacity: 0.55;
		margin-left: 1px;
	}
`;

const NextSura = styled.button`
	display: flex;
	align-items: center;
	gap: 12px;
	width: calc(100% - 32px);
	margin: 24px 16px 8px;
	padding: 16px 18px;
	border-radius: 16px;
	text-align: left;
	cursor: pointer;
	color: inherit;
	background: transparent;
	border: 1px dashed rgba(14, 2, 121, 0.25);

	[data-theme='dark'] & {
		border-color: rgba(156, 142, 224, 0.3);
	}

	span {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	small {
		font-size: 12px;
		opacity: 0.6;
	}

	strong {
		font-size: 16px;
	}
`;

// ─── Sheets ──────────────────────────────────────────────────────────────────

const VerseGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
	gap: 8px;
`;

const VerseCell = styled.button<{ $current: boolean }>`
	height: 44px;
	border-radius: 12px;
	font-size: 15px;
	font-variant-numeric: tabular-nums;
	cursor: pointer;
	border: 1px solid
		${({ $current }) => ($current ? ACCENT : 'rgba(14, 2, 121, 0.12)')};
	background: ${({ $current }) => ($current ? ACCENT : 'transparent')};
	color: ${({ $current }) => ($current ? '#fff' : 'inherit')};

	[data-theme='dark'] & {
		border-color: ${({ $current }) =>
			$current ? ACCENT_DARK : 'rgba(156, 142, 224, 0.2)'};
		background: ${({ $current }) => ($current ? ACCENT_DARK : 'transparent')};
		color: ${({ $current }) => ($current ? '#14112b' : 'inherit')};
	}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toPlainText = (html: string) =>
	sanitizeHtml(
		// Footnote markers (<sup>1</sup>) would otherwise glue a stray digit
		// onto the preceding word in copied/shared text.
		html.replace(/<sup[^>]*>.*?<\/sup>/g, ''),
		{ allowedTags: [], allowedAttributes: {} }
	);

// Whether `el` is at least partly inside the reading area — the scroller
// minus the floating player bar at its bottom.
const isInReadingArea = (el: HTMLElement, scroller: HTMLElement) => {
	const box = scroller.getBoundingClientRect();
	const rect = el.getBoundingClientRect();
	return rect.bottom > box.top && rect.top < box.bottom - PLAYER_HEIGHT;
};

type SheetName = 'translation' | 'settings' | 'verses' | undefined;

const SuraReader = () => {
	const { chapterId: chapterParam } = useParams();
	const chapterId = Number(chapterParam);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const location = useLocation();
	const targetVerse = Number(searchParams.get('v')) || undefined;

	const { data: chapterData, isLoading: chaptersLoading } = useChapters();
	const { data: verseData, isLoading: versesLoading } = useVerses();
	const { textSize, showTranslation } = useReaderPrefs();
	const {
		recitationsByChapter,
		activeProject,
		currentVerseKey,
		isPlaying,
		playPause,
		prepare,
	} = useMobilePlayer();
	const { playFrom, notify } = useMobileSuras();

	const [sheet, setSheet] = useState<SheetName>();
	const [tafsirVerse, setTafsirVerse] = useState<string | undefined>();
	const [copiedKey, setCopiedKey] = useState<string | undefined>();
	const [inViewVerse, setInViewVerse] = useState(targetVerse || 1);
	const scrollerRef = useRef<HTMLElement>(null);
	const positionedForRef = useRef<string | undefined>();
	const followedKeyRef = useRef<string | undefined>();
	const landingRef = useRef<{ chapterId: number; inApp: boolean }>();
	const [engagedChapter, setEngagedChapter] = useState<number>();
	const navigationType = useNavigationType();

	const chapter = chapterData?.suraByKey?.[chapterId];
	const versesCount = chapter?.verses_count || 0;
	const recitations = recitationsByChapter.get(chapterId) || [];
	const hasAudio = recitations.length > 0;
	const isThisChapterActive = chapterOfProject(activeProject) === chapterId;
	const sizes = TEXT_SIZES[textSize];

	const verseKeys = useMemo(
		() =>
			Array.from({ length: versesCount }, (_, i) => `${chapterId}:${i + 1}`),
		[chapterId, versesCount]
	);

	// So the first tap on play starts the recitation straight away.
	useEffect(() => {
		prepare(chapterId);
	}, [prepare, chapterId]);

	// Land on ?v= (from search, "continue reading", or a shared link) once
	// the verses have rendered; otherwise start at the top of the sura.
	useEffect(() => {
		if (!verseData || !versesCount) return;
		const key = `${chapterId}:${targetVerse || 0}`;
		if (positionedForRef.current === key) return;
		positionedForRef.current = key;
		setInViewVerse(targetVerse || 1);
		if (targetVerse && targetVerse > 1) {
			document
				.getElementById(`ve-${chapterId}:${targetVerse}`)
				?.scrollIntoView({ block: 'start' });
		} else if (scrollerRef.current) {
			scrollerRef.current.scrollTop = 0;
		}
	}, [verseData, versesCount, chapterId, targetVerse]);

	// Track the verse at the top of the reading area, for the header's
	// "Verse n of N" and for "continue reading" on the list.
	useEffect(() => {
		const root = scrollerRef.current;
		if (!root || !verseData || !versesCount) return undefined;
		const visible = new Set<number>();
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const num = Number((entry.target as HTMLElement).dataset.verseNum);
					if (entry.isIntersecting) visible.add(num);
					else visible.delete(num);
				});
				if (visible.size) setInViewVerse(Math.min(...Array.from(visible)));
			},
			// A thin band near the top of the reading area: the verse crossing
			// it is the one being read (cards are contiguous, so one always is).
			{ root, rootMargin: '-12% 0px -80% 0px', threshold: 0 }
		);
		root
			.querySelectorAll<HTMLElement>('[data-verse-num]')
			.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, [verseData, versesCount, chapterId]);

	// Only a visit that's actually read counts for "continue reading". A
	// sura opened from within the app counts straight away; one that merely
	// (re)loaded — a refresh, a restored browser tab, a shared link — only
	// once it's touched or played. Otherwise a tab left open on an old sura
	// put it back as the last read every time the browser reloaded it.
	if (landingRef.current?.chapterId !== chapterId) {
		landingRef.current = { chapterId, inApp: navigationType !== 'POP' };
	}
	const engaged =
		landingRef.current.inApp ||
		engagedChapter === chapterId ||
		isThisChapterActive;
	const markEngaged = () => {
		if (engagedChapter !== chapterId) setEngagedChapter(chapterId);
	};

	useEffect(() => {
		if (!versesCount || !engaged) return undefined;
		if (isThisChapterActive) setEngagedChapter(chapterId);
		let pending = true;
		const save = () => {
			pending = false;
			saveLastRead({ chapterId, verse: inViewVerse });
		};
		const timer = setTimeout(save, 500);
		// iOS can suspend or close the app before the timer fires.
		const onHide = () => {
			if (pending && document.visibilityState === 'hidden') save();
		};
		document.addEventListener('visibilitychange', onHide);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('visibilitychange', onHide);
		};
	}, [chapterId, inViewVerse, versesCount, engaged, isThisChapterActive]);

	// Follow the recitation — but only while the listener is following it.
	// If they've scrolled away to read elsewhere, don't yank them back (the
	// player bar's label jumps back to the recited verse on demand).
	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller || !isThisChapterActive || !currentVerseKey) return;
		const prevKey = followedKeyRef.current;
		followedKeyRef.current = currentVerseKey;
		if (prevKey === currentVerseKey) return;
		const prevEl = prevKey && document.getElementById(`ve-${prevKey}`);
		const following = !prevEl || isInReadingArea(prevEl, scroller);
		const el = document.getElementById(`ve-${currentVerseKey}`);
		if (following && el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [currentVerseKey, isThisChapterActive]);

	useEffect(() => {
		if (!activeProject) followedKeyRef.current = undefined;
	}, [activeProject]);

	const goBack = () => {
		if (wasOpenedFromList()) {
			navigate(-1);
			return;
		}
		const params = new URLSearchParams(location.search);
		params.delete('v');
		const search = params.toString();
		navigate(`${BASE_PATH}${search ? `?${search}` : ''}`, { replace: true });
	};

	const goToChapter = (id: number) => {
		const params = new URLSearchParams(location.search);
		params.delete('v');
		const search = params.toString();
		// Replace, so the header's back still returns to the list rather than
		// stepping through every sura read along the way.
		navigate(`${BASE_PATH}/${id}${search ? `?${search}` : ''}`, {
			replace: true,
		});
	};

	const jumpToVerse = (num: number, smooth = true) => {
		document.getElementById(`ve-${chapterId}:${num}`)?.scrollIntoView({
			behavior: smooth ? 'smooth' : 'auto',
			block: 'start',
		});
	};

	const verseText = (verseKey: string) => {
		const verse = verseData?.ayaByKey?.[verseKey];
		const tr = toPlainText(verse?.translation || '');
		return `${verse?.text_uthmani || ''}\n\n${tr}\n— ${
			chapter?.name_simple || ''
		} ${verseKey}`;
	};

	const copyVerse = (verseKey: string) => {
		if (!navigator.clipboard) {
			notify("Copying isn't supported here");
			return;
		}
		navigator.clipboard
			.writeText(verseText(verseKey))
			.then(() => {
				setCopiedKey(verseKey);
				notify(`Copied ${verseKey}`);
				setTimeout(() => setCopiedKey(undefined), 1800);
			})
			.catch(() => notify("Couldn't copy"));
	};

	const canShare = typeof navigator.share === 'function';
	const shareVerse = (verseKey: string) => {
		const params = new URLSearchParams(location.search);
		params.set('v', verseKey.split(':')[1]);
		navigator
			.share({
				title: `${chapter?.name_simple || ''} ${verseKey}`,
				text: verseText(verseKey),
				url: `${
					window.location.origin
				}${BASE_PATH}/${chapterId}?${params.toString()}`,
			})
			.catch(() => undefined);
	};

	const onPlayVerse = (verseKey: string) => {
		if (isThisChapterActive && currentVerseKey === verseKey) {
			playPause();
		} else {
			playFrom(verseKey);
		}
	};

	const onPlaySura = () => {
		if (isThisChapterActive) {
			playPause();
		} else {
			playFrom(`${chapterId}:${inViewVerse > 1 ? inViewVerse : 1}`);
		}
	};

	let content: React.ReactNode;
	if (chaptersLoading || versesLoading) {
		content = (
			<CenterBox>
				<Spin />
				Loading sura…
			</CenterBox>
		);
	} else if (!chapter) {
		content = (
			<CenterBox>
				This sura doesn&apos;t exist.
				<PillButton type="button" onClick={goBack}>
					See all suras
				</PillButton>
			</CenterBox>
		);
	} else {
		const activeReciter =
			isThisChapterActive && activeProject
				? getReciterFromTitle(activeProject.title)
				: undefined;
		let playLabel = 'Play';
		if (isThisChapterActive) playLabel = isPlaying ? 'Pause' : 'Resume';
		else if (inViewVerse > 1) playLabel = `Play from ${inViewVerse}`;

		content = (
			<>
				<Intro>
					<IntroArabic dir="rtl" lang="ar">
						{chapter.name_arabic}
					</IntroArabic>
					<IntroName>{chapter.name_simple}</IntroName>
					<IntroMeta>
						{chapter.translated_name?.name} ·{' '}
						{chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'} ·{' '}
						{chapter.verses_count} verses
					</IntroMeta>
					{hasAudio && (
						<IntroActions>
							<PillButton type="button" $primary onClick={onPlaySura}>
								{isThisChapterActive && isPlaying ? (
									<PauseOutlined />
								) : (
									<CaretRightFilled />
								)}
								{playLabel}
							</PillButton>
							{recitations.length > 1 && (
								<PillButton
									type="button"
									aria-label="Choose reciter"
									onClick={() =>
										playFrom(
											isThisChapterActive && currentVerseKey
												? currentVerseKey
												: `${chapterId}:${inViewVerse}`,
											true
										)
									}
								>
									{activeReciter || `${recitations.length} reciters`}
									<DownOutlined style={{ fontSize: 10 }} />
								</PillButton>
							)}
						</IntroActions>
					)}
				</Intro>

				{chapter.bismillah_pre && (
					<Bismillah dir="rtl" lang="ar">
						{BISMI}
					</Bismillah>
				)}

				{verseKeys.map((verseKey) => {
					const verse = verseData?.ayaByKey?.[verseKey];
					const num = verseKey.split(':')[1];
					const isCurrent = isThisChapterActive && currentVerseKey === verseKey;
					return (
						<VerseCard
							key={verseKey}
							id={`ve-${verseKey}`}
							data-verse-num={num}
							$active={isCurrent}
							aria-current={isCurrent ? 'true' : undefined}
						>
							<VerseTop>
								<VerseKey>{verseKey}</VerseKey>
								{hasAudio && (
									<PlayVerseButton
										type="button"
										className={isCurrent ? 'is-current' : undefined}
										aria-label={
											isCurrent && isPlaying
												? 'Pause recitation'
												: `Recite from verse ${num}`
										}
										onClick={() => onPlayVerse(verseKey)}
									>
										{isCurrent && isPlaying ? (
											<PauseOutlined />
										) : (
											<CaretRightFilled />
										)}
									</PlayVerseButton>
								)}
								<ActionButton
									type="button"
									aria-label={`Tafsir of ${verseKey}`}
									onClick={() => setTafsirVerse(verseKey)}
								>
									<ReadOutlined />
								</ActionButton>
								<ActionButton
									type="button"
									aria-label={`Copy ${verseKey}`}
									onClick={() => copyVerse(verseKey)}
								>
									{copiedKey === verseKey ? (
										<CheckOutlined />
									) : (
										<CopyOutlined />
									)}
								</ActionButton>
								{canShare && (
									<ActionButton
										type="button"
										aria-label={`Share ${verseKey}`}
										onClick={() => shareVerse(verseKey)}
									>
										<ShareAltOutlined />
									</ActionButton>
								)}
							</VerseTop>
							<ArabicText dir="rtl" lang="ar" $size={sizes.arabic}>
								{verse?.text_uthmani}
							</ArabicText>
							{showTranslation && (
								<TranslationText
									dir="auto"
									$size={sizes.translation}
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(verse?.translation || ''),
									}}
								/>
							)}
						</VerseCard>
					);
				})}

				{chapterId < 114 && chapterData?.suraByKey?.[chapterId + 1] && (
					<NextSura type="button" onClick={() => goToChapter(chapterId + 1)}>
						<span>
							<small>Next sura</small>
							<strong>
								{chapterId + 1}.{' '}
								{chapterData.suraByKey[chapterId + 1].name_simple}
							</strong>
						</span>
						<ArrowRightOutlined />
					</NextSura>
				)}
			</>
		);
	}

	return (
		<Page>
			<Header>
				<IconButton type="button" aria-label="All suras" onClick={goBack}>
					<ArrowLeftOutlined />
				</IconButton>
				<HeaderTitle>
					<TitleButton
						type="button"
						onClick={() => setSheet('verses')}
						disabled={!chapter}
						aria-label={
							chapter
								? `${chapter.name_simple}, verse ${inViewVerse} of ${versesCount}. Jump to verse`
								: undefined
						}
					>
						<HeaderMain>
							{chapter ? `${chapter.id}. ${chapter.name_simple}` : ' '}
						</HeaderMain>
						<SubWithCaret>
							{chapter ? `Verse ${inViewVerse} of ${versesCount}` : ' '}
							{chapter && <DownOutlined />}
						</SubWithCaret>
					</TitleButton>
				</HeaderTitle>
				<IconButton
					type="button"
					aria-label="Translation"
					onClick={() => setSheet('translation')}
				>
					<TranslationOutlined />
				</IconButton>
				<IconButton
					type="button"
					aria-label="Reading settings"
					onClick={() => setSheet('settings')}
				>
					<FontSizeOutlined />
				</IconButton>
			</Header>

			<Scroller
				ref={scrollerRef}
				$playerOpen={Boolean(activeProject)}
				onPointerDown={markEngaged}
				onWheel={markEngaged}
				onKeyDown={markEngaged}
			>
				<Column>{content}</Column>
			</Scroller>

			<TranslationSheet
				open={sheet === 'translation'}
				onClose={() => setSheet(undefined)}
				onPicked={(item) => notify(`Translation: ${item.name}`)}
			/>

			<SettingsSheet
				open={sheet === 'settings'}
				onClose={() => setSheet(undefined)}
				onOpenTranslations={() => setSheet('translation')}
			/>

			<Sheet
				title={chapter ? `Jump to verse · ${chapter.name_simple}` : 'Verses'}
				open={sheet === 'verses'}
				onClose={() => setSheet(undefined)}
			>
				<VerseGrid>
					{verseKeys.map((verseKey) => {
						const num = verseNumOf(verseKey) || 0;
						return (
							<VerseCell
								key={verseKey}
								type="button"
								$current={num === inViewVerse}
								aria-current={num === inViewVerse ? 'true' : undefined}
								onClick={() => {
									setSheet(undefined);
									jumpToVerse(num);
								}}
							>
								{num}
							</VerseCell>
						);
					})}
				</VerseGrid>
			</Sheet>

			<TafsirSheet
				verseKey={tafsirVerse}
				versesCount={versesCount}
				onClose={() => setTafsirVerse(undefined)}
				onNavigate={(key) => {
					setTafsirVerse(key);
					// Keep the page in step, so closing lands on that verse.
					jumpToVerse(verseNumOf(key) || 1, false);
				}}
			/>
		</Page>
	);
};

export default SuraReader;
