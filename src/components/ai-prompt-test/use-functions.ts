/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/require-await */

import { FunctionDeclaration } from '@google/generative-ai';
import { useState } from 'react';

const switchLightStatusDeclaration = {
	name: 'switchLightState',
	parameters: {
		type: 'OBJECT',
		description:
			'There are three lights on the screen. This function sets the status of these lights, either ON or OFF',
		properties: {
			lightIndex: {
				type: 'INTEGER',
				description: 'Index of the light. It can take 1, 2 or 3',
			},
			status: {
				type: 'BOOLEAN',
				description:
					'To what state the light should be set. ON or OFF. true means ON, false means OFF',
			},
			resp: {
				type: 'STRING',
				description:
					'response from the system after trying out the request to switch the light state',
			},
		},
		required: ['lightIndex', 'status'],
	},
};

const lightNameDeclaration = {
	name: 'getLightDetails',
	parameters: {
		type: 'OBJECT',
		description:
			'Given the name of a light, it returns its lightIndex as number. 3 possible values to return are 1,2 and 3. If it returns -1 it means light does not exist',
		properties: {
			lightName: {
				type: 'STRING',
				description:
					'Name of the light. Or Label of the light. Only options are noor | shams | misbah',
			},
			lightIndex: {
				type: 'INTEGER',
				description: 'light index',
			},
		},
		required: ['lightName'],
	},
};

const LightNames: { [key: string]: number } = {
	noor: 1,
	shams: 2,
	misbah: 3,
};

export const functionDeclarations = [
	switchLightStatusDeclaration,
	lightNameDeclaration,
] as FunctionDeclaration[];

export const useFunctions = () => {
	const [state, setState] = useState({
		light1: false,
		light2: false,
		light3: false,
	});

	const switchLightState = (index: 1 | 2 | 3, status: boolean) => {
		if (index >= 1 && index <= 3) {
			if (state[`light${index}`] === status) {
				return {
					resp: 'The light is already in the same state. No need to switch',
				};
			} else {
				setState((prev) => ({
					...prev,
					[`light${index}`]: status,
				}));
				return { resp: 'Done' };
			}
		}
	};

	// Executable function code. Put it in a map keyed by the function name
	// so that you can call it once you get the name string from the model.
	const functions: { [key: string]: Function } = {
		switchLightState: async ({
			lightIndex,
			status,
		}: {
			lightIndex: 1 | 2 | 3;
			status: boolean;
		}) => {
			console.log('func:switchLightState --> ', lightIndex, status);
			return switchLightState(lightIndex, status);
		},
		getLightDetails: async ({ lightName }: { lightName: string }) => {
			const name = lightName.toLowerCase();
			console.log('func:getLightDetails --> ', lightName);
			if (LightNames?.[name]) {
				return { lightIndex: LightNames?.[name] };
			}
			return { lightIndex: -1 };
		},
	};

	return {
		functions,
		state,
	};
};
