import { isMobileOnly } from 'react-device-detect';

export const isPhone = isMobileOnly;

const matches = (query: string) =>
	typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;

// A primary input that can't hover (phones, tablets). Touch laptops with a
// mouse/trackpad still count as hover-capable, so they keep desktop
// tooltips. Evaluated once, like `isPhone`.
export const isTouchDevice = matches('(hover: none) and (pointer: coarse)');

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

// iPadOS 13+ reports itself as desktop Safari ("Macintosh"), so fall back to
// the touch-point count to tell an iPad from a Mac.
export const isIOS =
	/iPad|iPhone|iPod/.test(ua) ||
	(/Macintosh/.test(ua) &&
		typeof navigator !== 'undefined' &&
		navigator.maxTouchPoints > 1);

export const isAndroid = /Android/i.test(ua);

// Social apps' embedded browsers can't add anything to the home screen;
// the user has to open the page in the real browser first.
export const isInAppBrowser =
	/FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|LinkedInApp|GSA\//i.test(ua);

// Safari proper — Chrome/Firefox/Edge on iOS identify as CriOS/FxiOS/EdgiOS.
export const isIOSSafari = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

export const isMacSafari =
	!isIOS &&
	/Macintosh/.test(ua) &&
	/Safari/.test(ua) &&
	!/Chrome|Chromium|Edg|Firefox/.test(ua);

export const isStandalone = (): boolean =>
	matches('(display-mode: standalone)') ||
	matches('(display-mode: fullscreen)') ||
	(navigator as Navigator & { standalone?: boolean }).standalone === true;
