/* eslint-disable no-console */
import {
	collection,
	addDoc,
	getDocs,
	updateDoc,
	doc,
} from 'firebase/firestore';
import { ProjectConfig } from 'types';
import { DOCUMENT_ID, fbDB, PATH_TO_DOCUMENT } from './init-firebase';

export const saveData = async (data: unknown) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const docRef = await addDoc(collection(fbDB, PATH_TO_DOCUMENT), data);
		// console.log('Document written with ID: ', docRef.id);
	} catch (e) {
		console.error('Error adding document: ', e);
	}
};

export const getData = async () => {
	const querySnapshot = await getDocs(collection(fbDB, PATH_TO_DOCUMENT));
	let data: { projects: ProjectConfig[] } | undefined;
	querySnapshot.forEach((docData) => {
		// console.log(`${docData.id} =>`, docData.data());
		if (docData.id === DOCUMENT_ID)
			data = docData.data() as { projects: ProjectConfig[] };
	});
	console.log(data);
	return data;
};

// Update data using the document ID
export const updateData = async (
	updatedData: object,
	id = DOCUMENT_ID
): Promise<void> => {
	try {
		const docRef = doc(fbDB, PATH_TO_DOCUMENT, id);
		await updateDoc(docRef, updatedData);
		console.log('Data updated successfully!');
	} catch (error) {
		console.error('Error updating data:', error);
	}
};
