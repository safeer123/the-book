/* eslint-disable no-console */
import type { UploadProps } from 'antd';
import { Button, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { ProjectConfig } from 'types';

interface Props {
	loadProjects: (projects: ProjectConfig[]) => void;
}

const readProjectsFile = async (f?: RcFile) => {
	try {
		const textContent = await f?.text();
		if (textContent) {
			const projectsRead = JSON.parse(textContent) as ProjectConfig[];
			return projectsRead;
		}
	} catch {
		console.error('Error: Failed reading the file!');
	}
};

const props = (loadProjects: Props['loadProjects']): UploadProps => {
	return {
		name: 'file',
		action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
		headers: {
			authorization: 'authorization-text',
		},
		showUploadList: false,
		onChange: (info) => {
			if (info.file.status !== 'uploading') {
				// console.log(info.file, info.fileList);
			}
			if (info.file.status === 'done') {
				console.log(`${info.file.name} file uploaded successfully`);
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				readProjectsFile(info.file?.originFileObj).then((projects) => {
					loadProjects(projects || []);
				});
			} else if (info.file.status === 'error') {
				console.log(`${info.file.name} file upload failed.`);
			}
		},
	};
};

export const UploadProjects = ({ loadProjects }: Props) => (
	<Upload {...props(loadProjects)}>
		<Button type="text">{'📁'}</Button>
	</Upload>
);
