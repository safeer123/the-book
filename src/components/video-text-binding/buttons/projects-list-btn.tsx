import { IconBtnMedium } from './icon-btn';

const ListIcon = (
	<svg
		width="64px"
		height="64px"
		viewBox="-4.56 -4.56 33.12 33.12"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="btn-icon"
	>
		<g id="SVGRepo_bgCarrier" strokeWidth="0">
			<rect
				x="-4.56"
				y="-4.56"
				width="33.12"
				height="33.12"
				rx="16.56"
				fill="#7ed0ec"
				strokeWidth="0"
			></rect>
		</g>
		<g
			id="SVGRepo_tracerCarrier"
			strokeLinecap="round"
			strokeLinejoin="round"
		></g>
		<g id="SVGRepo_iconCarrier">
			{' '}
			<g clipPath="url(#clip0_429_11182)">
				{' '}
				<path
					d="M6 6L3 7.73205L3 4.26795L6 6Z"
					stroke="#3454f4"
					strokeWidth="2.4"
					strokeLinejoin="round"
				></path>{' '}
				<path
					d="M3 12L21 12"
					stroke="#3454f4"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				></path>{' '}
				<path
					d="M10 6L21 6"
					stroke="#3454f4"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				></path>{' '}
				<path
					d="M3 18L21 18"
					stroke="#3454f4"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				></path>{' '}
			</g>{' '}
			<defs>
				{' '}
				<clipPath id="clip0_429_11182">
					{' '}
					<rect width="24" height="24" fill="white"></rect>{' '}
				</clipPath>{' '}
			</defs>{' '}
		</g>
	</svg>
);

export const ProjectList = ({ onClick }: { onClick?: () => void }) => {
	return <IconBtnMedium onClick={onClick}>{ListIcon}</IconBtnMedium>;
};
