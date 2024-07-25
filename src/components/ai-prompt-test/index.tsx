/* eslint-disable react/jsx-key */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/return-await */

import {
	FunctionResponsePart,
	GoogleGenerativeAI,
} from '@google/generative-ai';
import { KeyboardEventHandler, useState } from 'react';
import { Spin } from 'antd';
import { formatTextToHTML } from './utils';
import {
	PageWrapper,
	StyledTextArea,
	TestResultsWrapper,
	TopArea,
	MainArea,
} from './styles';
import { functionDeclarations, useFunctions } from './use-functions';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);

// The Gemini 1.5 models are versatile and work with most use cases
const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	// systemInstruction:
	// 	'You are a chat bot. Your name is Lio. The only context you should talk about is the lights on the screen and controlling it and your personal details. If anything else asked reply that you dont know',
	generationConfig: {
		maxOutputTokens: 1000,
	},
	tools: [
		{
			functionDeclarations,
		},
	],
});

const getNewId = () => {
	return new Date().toTimeString();
};

const chat = model.startChat();

export default function AIPromptApp() {
	const [promptText, setPromptText] = useState('');
	const [isWaiting, setIsWaiting] = useState(false);
	const [results, setResults] = useState<
		{ id: string; p: string; content: string }[]
	>([]);

	const { functions, state } = useFunctions();

	// console.log(state);

	const runPrompt = async (
		prompt: string | FunctionResponsePart[]
	): Promise<string> => {
		// const result = await model.generateContent(prompt);

		// Send the message to the model.
		const result = await chat.sendMessage(prompt);
		const response = result.response;

		if ((response?.functionCalls()?.length || 0) > 0) {
			const funcResponses: FunctionResponsePart[] = [];
			for (const call of response?.functionCalls() || []) {
				if (call) {
					// Call the executable function named in the function call
					// with the arguments specified in the function call and
					// let it call the hypothetical API.
					const apiResponse = await functions[call.name](call.args);

					console.log('calling --> ', call.name, call.args);
					console.log(response?.functionCalls());

					funcResponses.push({
						functionResponse: {
							name: call.name,
							response: apiResponse,
						},
					});
				}
			}
			// Send the API response back to the model so it can generate
			// a text response that can be displayed to the user.
			return await runPrompt(funcResponses);
		} else if (response.text()) {
			return response.text();
		} else {
			return '--no-text--';
		}
	};

	const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
		if (!e.shiftKey && e.code === 'Enter') {
			setPromptText('');
			e.preventDefault();
			setIsWaiting(true);
			runPrompt(promptText).then((content: string) => {
				setIsWaiting(false);
				setResults((prevResults) => [
					...prevResults,
					{ content: formatTextToHTML(content), p: promptText, id: getNewId() },
				]);
			});
		}
	};

	return (
		<PageWrapper className="ai-prompt-app">
			<TopArea>
				<div className={state.light1 ? 'glow' : 'glow-off'}>Light-1</div>
				<div className={state.light2 ? 'glow' : 'glow-off'}>Light-2</div>
				<div className={state.light3 ? 'glow' : 'glow-off'}>Light-3</div>
			</TopArea>
			<MainArea>
				<TestResultsWrapper>
					{results.map((r) => (
						<div className="result-item" key={r.id}>
							<div className="result-item-p">{r.p}</div>
							<div dangerouslySetInnerHTML={{ __html: r.content }} />
						</div>
					))}
					{isWaiting && (
						<div className="waiting-text">
							Preparing your answer... <Spin size="small" />
						</div>
					)}
				</TestResultsWrapper>
				<StyledTextArea
					placeholder="Chat with AI Bot.."
					value={promptText}
					onKeyDown={onKeyDown}
					onChange={(e) => setPromptText(e.target.value)}
				/>
			</MainArea>
		</PageWrapper>
	);
}
