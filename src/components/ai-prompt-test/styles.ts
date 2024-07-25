import { styled } from 'styled-components';
import TextArea from 'antd/es/input/TextArea';

export const PageWrapper = styled.div`
	width: 100vw;
	height: 100vh;
`;

export const TopArea = styled.div`
	height: 80px;
	display: flex;
	justify-content: space-around;
	align-items: center;

	.glow-off,
	.glow {
		font-size: 25px;
		text-align: center;
	}

	.glow-off {
		color: #777;
	}

	.glow {
		color: #fff;

		-webkit-animation: glow 1s ease-in-out infinite alternate;
		-moz-animation: glow 1s ease-in-out infinite alternate;
		animation: glow 1s ease-in-out infinite alternate;
	}

	@keyframes glow {
		from {
			text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073,
				0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
		}
		to {
			text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6,
				0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
		}
	}
`;

export const MainArea = styled.div`
	height: calc(100% - 80px);
	overflow: auto;
	overflow-anchor: auto;
`;
export const StyledTextArea = styled(TextArea)`
	margin: 32px;
	margin-top: 0;
	width: calc(100vw - 64px);
`;

export const TestResultsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	text-align: left;
	padding-top: 32px;

	.result-item {
		margin: 0px 32px;
		padding: 16px;
		border-bottom: 1px solid #bbb;
	}

	.result-item-p {
		color: #777;
	}

	.waiting-text {
		margin-left: 32px;
		padding: 8px 0;
	}
`;
