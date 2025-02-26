import { ReactNode } from 'react';
import styled from 'styled-components';

const ItemWrapper = styled.div`
	padding: 16px;
`;

const Title = styled.h4`
	margin-bottom: 4px;
`;

export const PlaygroundItem = ({
	title,
	children,
}: {
	title?: string;
	children: ReactNode;
}) => {
	return (
		<ItemWrapper>
			<div>
				<Title>{title}</Title>
				<hr />
			</div>
			<>{children}</>
		</ItemWrapper>
	);
};
