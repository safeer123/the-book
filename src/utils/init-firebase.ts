/* eslint-disable no-console */
// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
	messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID || '',
	appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
	measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '',
};

export const DOCUMENT_ID = process.env.REACT_APP_STORAGE_DOCUMENT_ID || '';
export const PATH_TO_DOCUMENT =
	process.env.REACT_APP_STORAGE_PATH_TO_DOCUMENT || '';

// Initialize Firebase

export const fbApp: FirebaseApp = initializeApp(firebaseConfig);
export const fbAnalytics: Analytics = getAnalytics(fbApp);
export const fbDB = getFirestore(fbApp);
