import { useEffect, useState } from 'react';
import { ProjectConfig } from 'types';

const PROJECTS_KEY = 'verse-binding-projects';

interface Projects {
	[key: string]: ProjectConfig;
}

export const useProjectStore = ({
	setProjectConfig,
}: {
	setProjectConfig: (p: ProjectConfig) => void;
}): {
	saveProject: (project: ProjectConfig) => void;
	loadProjects: (projects: ProjectConfig[]) => void;
	projects: ProjectConfig[];
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

	useEffect(() => {
		const items = JSON.parse(
			localStorage.getItem(PROJECTS_KEY) || '{}'
		) as Projects;
		setProjectItems(items);
	}, []);

	return {
		saveProject,
		loadProjects,
		projects: Object.values(projectItems),
	};
};
