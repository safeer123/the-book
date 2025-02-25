/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ProjectConfig } from 'types';
import { getData, updateData } from 'utils/firestore-utils';

const PROJECTS_KEY = 'verse-binding-projects';

const JSON_STORE_URL = 'https://api.npoint.io/95fc077e217a9428c322';

/*
npoint account
https://www.npoint.io/docs/95fc077e217a9428c322
*/

interface Projects {
	[key: string]: ProjectConfig;
}

export const useProjectStore = ({
	setProjectConfig,
	viewerMode,
}: {
	setProjectConfig: (p: ProjectConfig) => void;
	viewerMode: boolean;
}): {
	saveProject: (project: ProjectConfig) => Promise<void>;
	deleteProject: (project: ProjectConfig) => void;
	loadProjects: (projects: ProjectConfig[]) => void;
	projects: ProjectConfig[];
	downloadAsJson: () => void;
} => {
	const [projectItems, setProjectItems] = useState<Projects>({});

	const saveProject = async (project: ProjectConfig) => {
		const savedProject = {
			...project,
			id: [...project.title.split(' '), project.videoUrl].join('-'),
		};
		const updatedProjects = {
			...projectItems,
			[project.videoUrl]: savedProject,
		};

		Object.values(updatedProjects).forEach((p) => {
			let verseId = undefined;
			p?.bindingConfig?.find((b) => {
				const verseNum = b.k.split(':')?.[0];
				if (Number.isInteger(+verseNum) && +verseNum > 1) {
					verseId = +verseNum;
					return true;
				}
				return false;
			});
			if (verseId) {
				p.verseId = verseId;
			}
		});

		const updatedProjectsStr = JSON.stringify(updatedProjects);
		await updateData({ projects: updatedProjects });
		localStorage.setItem(PROJECTS_KEY, updatedProjectsStr);
		setProjectConfig(savedProject);
		setProjectItems(updatedProjects);
	};

	const deleteProject = (project: ProjectConfig) => {
		const updatedProjects = {
			...projectItems,
		};
		delete updatedProjects[project.videoUrl];
		localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
		setProjectItems(updatedProjects);
		setProjectConfig({ ...project });
	};

	const loadProjects = (projectList: ProjectConfig[]) => {
		const projectMap: { [key: string]: ProjectConfig } = {};
		projectList.forEach((p) => {
			projectMap[p.videoUrl] = p;
		});
		localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectMap));
		setProjectItems(projectMap);
	};

	const downloadAsJson = () => {
		const projects = Object.values(projectItems);
		const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
			JSON.stringify({ projects })
		)}`;
		const link = document.createElement('a');
		link.href = jsonString;
		link.download = 'verse-binding-projects.json';

		link.click();
	};

	useEffect(() => {
		const items = JSON.parse(
			localStorage.getItem(PROJECTS_KEY) || '{}'
		) as Projects;
		setProjectItems(items);
	}, []);

	useEffect(() => {
		if (viewerMode) {
			// axios
			// 	.get(JSON_STORE_URL)
			// 	.then((data: { data: { projects: ProjectConfig[] } }) => {
			// 		loadProjects(data?.data?.projects || []);
			// 	});
			getData().then((data) => {
				if (data?.projects) {
					loadProjects(Object.values(data.projects));
				}
			});
		}
	}, [viewerMode]);

	const projects = useMemo(() => {
		const projectList = Object.values(projectItems);

		projectList.sort(
			(a: ProjectConfig, b: ProjectConfig) =>
				(a.verseId || 0) - (b.verseId || 0)
		);
		return projectList;
	}, [projectItems]);

	return {
		saveProject,
		deleteProject,
		loadProjects,
		projects,
		downloadAsJson,
	};
};
