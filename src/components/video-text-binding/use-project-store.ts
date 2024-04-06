/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ProjectConfig } from 'types';

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
	saveProject: (project: ProjectConfig) => void;
	loadProjects: (projects: ProjectConfig[]) => void;
	projects: ProjectConfig[];
	downloadAsJson: () => void;
} => {
	const [projectItems, setProjectItems] = useState<Projects>({});

	const saveProject = (project: ProjectConfig) => {
		const savedProject = {
			...project,
			id: [...project.title.split(' '), project.videoUrl].join('-'),
		};
		const updatedProjects = {
			...projectItems,
			[project.videoUrl]: savedProject,
		};
		localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
		setProjectItems(updatedProjects);
		setProjectConfig(savedProject);
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
			axios
				.get(JSON_STORE_URL)
				.then((data: { data: { projects: ProjectConfig[] } }) => {
					loadProjects(data?.data?.projects || []);
				});
		}
	}, [viewerMode]);

	const projects = useMemo(() => Object.values(projectItems), [projectItems]);

	return {
		saveProject,
		loadProjects,
		projects,
		downloadAsJson,
	};
};
