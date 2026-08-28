import { ReactNode } from 'react';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { ProjectConfig } from 'types';
import { Upload as UploadBtn } from './buttons/upload-btn';

interface Props {
	loadProjects: (projects: ProjectConfig[]) => void;
	onUploadSuccess?: () => void;
	onUploadError?: (message: string) => void;
	// Defaults to the icon-only trigger styled for the video editor's dark
	// toolbar; callers on a light page (e.g. Project Manager) pass their own.
	children?: ReactNode;
}

const readProjectsFile = async (file: RcFile): Promise<ProjectConfig[]> => {
	const textContent = await file.text();
	const parsed = JSON.parse(textContent) as { projects?: ProjectConfig[] };
	if (!Array.isArray(parsed.projects)) {
		throw new Error('File is missing a top-level "projects" array');
	}
	return parsed.projects;
};

const buildUploadProps = ({
	loadProjects,
	onUploadSuccess,
	onUploadError,
}: Pick<
	Props,
	'loadProjects' | 'onUploadSuccess' | 'onUploadError'
>): UploadProps => ({
	name: 'file',
	accept: '.json,application/json',
	showUploadList: false,
	// Parsed entirely client-side — no server involved. (This used to point
	// `action` at a mocky.io test endpoint, which meant every upload did a
	// real network POST there first; once that mock expired the status
	// never reached "done" and nothing ever loaded.)
	customRequest: (options) => {
		const file = options.file as RcFile;
		readProjectsFile(file)
			.then((projects) => {
				loadProjects(projects);
				options.onSuccess?.({});
				onUploadSuccess?.();
			})
			.catch((e: unknown) => {
				const message =
					e instanceof Error ? e.message : 'Failed to read the file';
				options.onError?.(new Error(message));
				onUploadError?.(message);
			});
	},
});

export const UploadProjects = ({
	loadProjects,
	onUploadSuccess,
	onUploadError,
	children,
}: Props) => (
	<Upload
		{...buildUploadProps({ loadProjects, onUploadSuccess, onUploadError })}
	>
		{children || <UploadBtn />}
	</Upload>
);
