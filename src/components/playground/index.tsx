/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import CreatePostPopover from './post-popover';
import PostsTable from './posts-table';
import { Button, Space } from 'antd';
import { fbDB } from 'utils/init-firebase';
import {
	collection,
	getDocs,
	onSnapshot,
	query,
	where,
} from 'firebase/firestore';
import { PlaygroundItem } from './section';

// Define the type for the post object
export interface Post {
	id?: string;
	title: string;
	author: string;
	createdAt: string; // ISO timestamp
	content: string;
}

export const Playground = () => {
	const [posts, setPosts] = useState<Post[]>([
		{
			title: 'Test',
			author: 'Test',
			createdAt: '2021-09-01T00:00:00.000Z',
			content: 'Test',
		},
	]);

	const getAllPosts = () => {
		const postsCollection = collection(fbDB, 'posts');
		const q = query(postsCollection);
		getDocs(q)
			.then((querySnapshot) => {
				const postsFetched: Post[] = [];
				querySnapshot.forEach((doc) => {
					postsFetched.push({ ...(doc.data() as Post), id: doc.id });
				});
				setPosts(postsFetched);
			})
			.catch((error) => {
				console.error('Error getting documents: ', error);
			});
	};

	// using where clause to query posts
	const queryPosts = () => {
		const postsCollection = collection(fbDB, 'posts');
		const q = query(postsCollection, where('author', '==', 'John'));
		getDocs(q)
			.then((querySnapshot) => {
				const postsFetched: Post[] = [];
				querySnapshot.forEach((doc) => {
					postsFetched.push({ ...(doc.data() as Post), id: doc.id });
				});
				setPosts(postsFetched);
			})
			.catch((error) => {
				console.error('Error getting documents: ', error);
			});
	};

	// Listen for real-time updates
	useEffect(() => {
		const q = collection(fbDB, 'posts');
		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const postsFetched: Post[] = [];
			querySnapshot.forEach((doc) => {
				postsFetched.push({ ...(doc.data() as Post), id: doc.id });
			});
			setPosts(postsFetched);
		});

		return () => unsubscribe();
	}, []);

	return (
		<div>
			<PlaygroundItem title="Create a post">
				<CreatePostPopover />
			</PlaygroundItem>

			<PlaygroundItem title="List all posts, Update/delete a post, real-time sync">
				<Space>
					<Button onClick={() => getAllPosts()}>Get Posts</Button>
					<Button onClick={() => queryPosts()}>Query on Posts</Button>
				</Space>
				<PostsTable posts={posts} />{' '}
			</PlaygroundItem>
		</div>
	);
};
