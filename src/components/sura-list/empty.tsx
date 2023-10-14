import { Empty } from 'antd';
import styled from 'styled-components';

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 24;
	font-weight: 800;
`;

const EmptyScreen = () => {
	return (
		<Wrapper>
			<Empty description={'No match found...'} />
		</Wrapper>
	);
};

export default EmptyScreen;
