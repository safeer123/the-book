import {
	FC,
	createContext,
	useMemo,
	PropsWithChildren,
	useEffect,
} from 'react';
import { Button, notification } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { VerseToken } from 'types';
import { styled } from 'styled-components';
import { NotificationInstance } from 'antd/es/notification/interface';

const ToastWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	font-size: 16px;
`;

const ButtonStyled = styled(Button)`
	width: fit-content;
`;

const Context = createContext({ name: 'text-selection-context' });

const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
	const [api, contextHolder] = notification.useNotification({
		maxCount: 1,
	});

	const [searchParams, setSearchParams] = useSearchParams();

	const searchText = (text: string, apiNotif: NotificationInstance) => {
		setSearchParams((prev) => ({
			k: text,
			w: '0',
			c: '1',
			only: VerseToken,
			tr: prev.get('tr') as string,
		}));
		apiNotif.destroy();
	};

	const openNotification = (text: string) => {
		api.info({
			message: (
				<ToastWrapper>
					<span>
						Search all references of <strong>{text}</strong>?
					</span>
					<ButtonStyled
						type="primary"
						size="small"
						onClick={() => searchText(text, api)}
					>
						Search
					</ButtonStyled>
				</ToastWrapper>
			),
			placement: 'bottomLeft',
			duration: 3,
		});
	};

	useEffect(() => {
		const handleSelection = (e: Event) => {
			openNotification((e as CustomEvent)?.detail as string);
		};
		document.addEventListener('text-selection', handleSelection);
		return () =>
			document.removeEventListener('text-selection', handleSelection);
	}, [searchParams.get('tr')]);

	const contextValue = useMemo(() => ({ name: 'Search Word' }), []);

	return (
		<Context.Provider value={contextValue}>
			{contextHolder}
			{children}
		</Context.Provider>
	);
};

export default NotificationProvider;
