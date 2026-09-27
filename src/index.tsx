/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-named-as-default-member */
import React from 'react';
import ReactDOM from 'react-dom/client';
import RouterApp from './router';
import { Helmet } from 'react-helmet';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'utils/init-firebase';
// Must load before first render: it catches Chrome's one-shot
// beforeinstallprompt event.
import 'pwa/install-prompt';
import { register as registerServiceWorker } from 'pwa/service-worker-registration';
import { setUpAppChrome } from 'pwa/app-chrome';
import { PwaProvider } from 'pwa/pwa-provider';

import './styles.css';
import { UserAuthProvider } from 'auth/auth-context';
import { AppThemeProvider } from 'context/theme-context';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

setUpAppChrome();
registerServiceWorker();

// Icons, manifest and home-screen meta tags live in public/index.html so
// they're there before any JS runs (iOS reads them when adding to the home
// screen).
root.render(
	<React.StrictMode>
		<Helmet>
			<meta charSet="utf-8" />
			<title>The Book</title>
		</Helmet>
		<QueryClientProvider client={queryClient}>
			<AppThemeProvider>
				<UserAuthProvider>
					<PwaProvider>
						<RouterApp />
					</PwaProvider>
				</UserAuthProvider>
			</AppThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
