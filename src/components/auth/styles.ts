import { Button, Input } from 'antd';
import styled, { css } from 'styled-components';

const PRIMARY = 'rgb(14, 2, 121)';

// Auth pages are forced light (see use-force-light-theme), so this
// intentionally leaves the background transparent — the app's real
// textured-paper #root background (same as Home/`/suras`) shows through,
// rather than inventing a page-specific gradient.
export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	gap: 22px;
	padding: 24px;
	box-sizing: border-box;
`;

export const Brand = styled.div`
	text-align: center;
`;

// Matches Home's HomeTitle exactly (same font, color) for brand parity;
// sized down a touch from Home's 48px to keep the whole widget compact.
export const BrandTitle = styled.h1`
	margin: 0;
	font-family: 'Amiri Quran', serif;
	font-size: 38px;
	font-weight: 400;
	color: ${PRIMARY};
`;

export const BrandSubtitle = styled.p`
	margin: 6px 0 0;
	font-size: 14px;
	color: rgba(7, 1, 65, 0.6);
`;

// Same translucent "glass card" treatment as Home's LinkCard, for parity
// with the rest of the app rather than a generic opaque SaaS card. Kept
// compact (tight padding, narrower max-width) so the widget reads as a
// small focused element with generous space around it, not a full panel.
export const FormContainer = styled.div`
	padding: 26px 28px 22px;
	background: rgba(255, 255, 255, 0.7);
	border: 1px solid rgba(14, 2, 121, 0.12);
	border-radius: 16px;
	box-shadow: 0 8px 28px rgba(14, 2, 121, 0.1);
	backdrop-filter: blur(6px);
	width: 100%;
	max-width: 360px;
`;

export const Title = styled.h2`
	text-align: center;
	margin: 0 0 18px;
	font-size: 19px;
	font-weight: 600;
	color: rgba(7, 1, 65, 0.85);
`;

// Shared polished look for both the plain email Input and Input.Password —
// both render as an .ant-input-affix-wrapper once a prefix icon is set, so
// one style block covers them.
const fieldStyles = css`
	&& {
		height: 42px;
		border-radius: 10px;
		border-color: rgba(14, 2, 121, 0.16);
		padding: 0 14px;
		background: rgba(255, 255, 255, 0.8);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	&&:hover {
		border-color: rgba(14, 2, 121, 0.32);
	}

	&&.ant-input-affix-wrapper-focused {
		border-color: ${PRIMARY};
		box-shadow: 0 0 0 3px rgba(14, 2, 121, 0.12);
	}

	.ant-input-prefix {
		margin-right: 10px;
		color: rgba(14, 2, 121, 0.4);
	}

	input {
		font-size: 14px;
		background: transparent;
	}
`;

export const StyledInput = styled(Input)`
	${fieldStyles}
`;

export const StyledPasswordInput = styled(Input.Password)`
	${fieldStyles}
`;

// Tighter vertical rhythm than antd's default 24px form-item spacing, to
// keep the whole card compact. A plain wrapper (rather than styled(Form))
// so it doesn't erase Form's generic FormInstance<Values> typing.
export const CompactFormWrapper = styled.div`
	.ant-form-item {
		margin-bottom: 14px;
	}

	.ant-form-item-label {
		padding-bottom: 4px;
	}

	.ant-form-item:last-of-type {
		margin-bottom: 0;
	}
`;

export const GoogleButton = styled(Button)`
	width: 100%;
	height: 42px;
	border-radius: 10px;
	background-color: #fff;
	color: rgba(0, 0, 0, 0.85);
	border-color: #d9d9d9;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background-color: #fff;
		color: ${PRIMARY};
		border-color: ${PRIMARY};
	}

	svg {
		margin-right: 8px;
	}
`;

export const Divider = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 0 0 14px;
	color: rgba(7, 1, 65, 0.35);
	font-size: 12px;

	&::before,
	&::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(14, 2, 121, 0.12);
	}
`;

export const ErrorMessage = styled.div`
	background: #fff1f0;
	border: 1px solid #ffccc7;
	color: #cf1322;
	text-align: center;
	padding: 8px 12px;
	border-radius: 8px;
	margin-bottom: 16px;
	font-size: 13px;
`;

export const SignUpLink = styled.div`
	text-align: center;
	margin-top: 16px;
	font-size: 13px;
	color: rgba(7, 1, 65, 0.7);
`;
