import { useLocation, useSearchParams } from 'react-router-dom';

// Where to go after signing in: the page that sent the visitor to sign in.
// Carried in the URL (/login?next=/msuras/2) rather than router state, so
// it survives a refresh of the sign-in page and the hop to sign-up.
const RETURN_PARAM = 'next';
const AUTH_PATHS = ['/login', '/signup', '/logout'];

// Only same-site paths — never "//evil.com" or a full URL from a crafted
// link — and never back into the auth pages themselves.
const safeReturnPath = (value: string | null): string => {
	if (!value || !value.startsWith('/') || /^\/[/\\]/.test(value)) return '/';
	const path = value.split(/[?#]/)[0];
	return AUTH_PATHS.includes(path) ? '/' : value;
};

export const useReturnTo = (): string => {
	const [searchParams] = useSearchParams();
	return safeReturnPath(searchParams.get(RETURN_PARAM));
};

export const withReturnTo = (authPath: string, returnTo: string): string =>
	returnTo === '/'
		? authPath
		: `${authPath}?${RETURN_PARAM}=${encodeURIComponent(returnTo)}`;

export const useCurrentPath = (): string => {
	const { pathname, search, hash } = useLocation();
	return `${pathname}${search}${hash}`;
};
