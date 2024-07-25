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
		},
		required: ['lightIndex', 'status'],
	},
};

export const functionDeclarations = [
	switchLightStatusDeclaration,
] as FunctionDeclaration[];

export const useFunctions = () => {
	const [state, setState] = useState({
		light1: false,
		light2: false,
		light3: false,
	});

	const switchLightState = (index: 1 | 2 | 3, status: boolean) => {
		if (index >= 1 && index <= 3) {
			setState((prev) => ({
				...prev,
				[`light${index}`]: status,
			}));
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
			return switchLightState(lightIndex, status);
		},
	};

	return {
		functions,
		state,
	};
};
