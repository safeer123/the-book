/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-named-as-default-member */
import React from 'react';
import ReactDOM from 'react-dom/client';
import RouterApp from './router';
import { QueryClient, QueryClientProvider } from 'react-query';

import './styles.css';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterApp />
		</QueryClientProvider>
	</React.StrictMode>
);
