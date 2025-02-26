/* eslint-disable no-console */
import React from 'react';
import { Button, Form, Input, Popover } from 'antd';
import styled from 'styled-components';
import { fbDB } from 'utils/init-firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Post } from '.';

// Styled components for the form
const FormContainer = styled.div`
	width: 300px;
`;

const addPost = (post: Post) => {
	// Add a new document to the "posts" collection
	const postsCollection = collection(fbDB, 'posts');
	addDoc(postsCollection, {
		...post,
		timestamp: post.createdAt,
	})
		.then(() => {
			console.log('Document successfully added!');
		})
		.catch((error) => {
			console.error('Error adding document: ', error);
		});
};

const CreatePostPopover: React.FC = () => {
	const [form] = Form.useForm<Post>();

	// Dummy handler for form submission
	const handleSubmit = (values: Post) => {
		const post: Post = {
			...values,
			createdAt: new Date().toISOString(), // Add current timestamp
		};
		addPost(post);
	};

	// Popover content (the form)
	const popoverContent = (
		<FormContainer>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item
					name="title"
					label="Title"
					rules={[{ required: true, message: 'Please enter a title!' }]}
				>
					<Input placeholder="Enter post title" />
				</Form.Item>

				<Form.Item
					name="author"
					label="Author"
					rules={[{ required: true, message: 'Please enter the author!' }]}
				>
					<Input placeholder="Enter author name" />
				</Form.Item>

				<Form.Item
					name="content"
					label="Content"
					rules={[{ required: true, message: 'Please enter the content!' }]}
				>
					<Input.TextArea rows={4} placeholder="Enter post content" />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" block>
						Create Post
					</Button>
				</Form.Item>
			</Form>
		</FormContainer>
	);

	return (
		<Popover content={popoverContent} title="Create a New Post" trigger="click">
			<Button type="primary">Create Post</Button>
		</Popover>
	);
};

export default CreatePostPopover;
