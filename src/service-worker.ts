/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// Built by react-scripts (Workbox InjectManifest) into /service-worker.js
// for production builds only; registered from pwa/service-worker-registration.

import { clientsClaim } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

clientsClaim();

// The build's JS/CSS/HTML, versioned by content hash.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Single-page app shell: every in-app navigation gets index.html, so the
// app opens (and routes) offline. Firebase's reserved /__/ paths (auth
// handler) and real files (/site.webmanifest, /favicon.ico …) are left to
// the network.
registerRoute(
	new NavigationRoute(
		createHandlerBoundToURL(`${process.env.PUBLIC_URL || ''}/index.html`),
		{ denylist: [/^\/__\//, /\/[^/?]+\.[^/]+$/] }
	)
);

// Quran text, translations, tafsirs, chapter info — effectively static, so
// serve from cache instantly and refresh in the background. This is what
// lets previously opened suras read offline.
registerRoute(
	({ url, request }) =>
		url.origin === 'https://api.quran.com' && request.method === 'GET',
	new StaleWhileRevalidate({
		cacheName: 'quran-api',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({ maxEntries: 400, maxAgeSeconds: 60 * DAY }),
		],
	})
);

registerRoute(
	({ url }) => url.origin === 'https://fonts.googleapis.com',
	new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

registerRoute(
	({ url }) => url.origin === 'https://fonts.gstatic.com',
	new CacheFirst({
		cacheName: 'google-fonts-webfonts',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * DAY }),
		],
	})
);

// Background textures, video thumbnails, icons. Audio/video are left
// alone: they're streamed with range requests and are far too big to keep.
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'images',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 30 * DAY }),
		],
	})
);

// Sent by the "new version available" banner once the user chooses to
// reload (see applyUpdate).
self.addEventListener('message', (event: ExtendableMessageEvent) => {
	const data = event.data as { type?: string } | undefined;
	if (data?.type === 'SKIP_WAITING') {
		self.skipWaiting().catch(() => undefined);
	}
});
