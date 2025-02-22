/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-named-as-default-member */
import React from 'react';
import ReactDOM from 'react-dom/client';
import RouterApp from './router';
import { Helmet } from 'react-helmet';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'utils/init-firebase';

import './styles.css';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

root.render(
	<React.StrictMode>
		<Helmet>
			<meta charSet="utf-8" />
			<title>The Book</title>
			<link
				rel="apple-touch-icon"
				sizes="180x180"
				href="/apple-touch-icon.png"
			/>
			<link
				rel="icon"
				type="image/png"
				sizes="32x32"
				href="/favicon-32x32.png"
			/>
			<link
				rel="icon"
				type="image/png"
				sizes="16x16"
				href="/favicon-16x16.png"
			/>
			<link rel="manifest" href="/site.webmanifest" />
		</Helmet>
		<QueryClientProvider client={queryClient}>
			<RouterApp />
		</QueryClientProvider>
	</React.StrictMode>
);
