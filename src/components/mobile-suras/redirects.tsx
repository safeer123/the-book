import { ReactElement } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { isPhone } from 'utils/device-utils';
import {
	desktopToMobileUrl,
	mobileToDesktopUrl,
	resolveViewMode,
	stripViewParam,
} from './utils';

// The override is remembered for the session, so drop it from the address
// bar once applied rather than carrying it into shared links.
const hasViewParam = (search: string) =>
	new URLSearchParams(search).has('view');

// Route guards that send each device to its own layout, carrying over
// what the URL points at (sura, verse, search, translation). They wrap the
// existing pages without changing them: on the "right" device the original
// element renders exactly as before. `?view=desktop|mobile` overrides.

export const DesktopOnly = ({
	children,
	mobileUrl,
}: {
	children: ReactElement;
	mobileUrl: (search: string) => string;
}) => {
	const { pathname, search } = useLocation();
	if (resolveViewMode(search, isPhone) === 'mobile') {
		return <Navigate replace to={mobileUrl(stripViewParam(search))} />;
	}
	if (hasViewParam(search)) {
		return <Navigate replace to={`${pathname}${stripViewParam(search)}`} />;
	}
	return children;
};

// /suras?k=… → /msuras/…
export const SurasRoute = ({ children }: { children: ReactElement }) => (
	<DesktopOnly mobileUrl={desktopToMobileUrl}>{children}</DesktopOnly>
);

// /qbind[/:pid] → /mqbind[/:pid], the existing mobile recitation player.
export const QBindRoute = ({ children }: { children: ReactElement }) => {
	const { pid } = useParams();
	return (
		<DesktopOnly
			mobileUrl={(search) =>
				`/mqbind${pid ? `/${encodeURIComponent(pid)}` : ''}${search}`
			}
		>
			{children}
		</DesktopOnly>
	);
};

// /msuras/… opened on a laptop (e.g. a verse shared from a phone) → /suras.
export const MobileSurasRoute = ({ children }: { children: ReactElement }) => {
	const { pathname, search } = useLocation();
	if (resolveViewMode(search, isPhone) === 'desktop') {
		const chapterParam = pathname.split('/')[2];
		return (
			<Navigate
				replace
				to={mobileToDesktopUrl(chapterParam, stripViewParam(search))}
			/>
		);
	}
	if (hasViewParam(search)) {
		return <Navigate replace to={`${pathname}${stripViewParam(search)}`} />;
	}
	return children;
};
