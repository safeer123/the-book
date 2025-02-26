/* eslint-disable no-console */
import React, { ReactNode, useEffect } from 'react';
import { Button, Form, Input, Popover } from 'antd';
import styled from 'styled-components';
import { Post } from '.';

// Define the props for the EditPost component
interface EditPostProps {
	children: ReactNode;
	post: Post;
	onSave: (updatedPost: Post) => void; // Callback to handle saving the updated post
}

// Styled components for the form
const FormContainer = styled.div`
	width: 300px;
`;

const EditPost: React.FC<EditPostProps> = ({ children, post, onSave }) => {
	const [form] = Form.useForm<Post>();

	// Initialize form values with the provided post
	useEffect(() => {
		form.setFieldsValue(post);
	}, [post, form]);

	// Handler for form submission
	const handleSubmit = (values: Post) => {
		const updatedPost: Post = {
			...values,
			id: post.id, // Keep the ID
		};
		onSave(updatedPost); // Call the onSave callback with the updated post
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
						Save Changes
					</Button>
				</Form.Item>
			</Form>
		</FormContainer>
	);

	return (
		<Popover content={popoverContent} title="Edit Post" trigger="click">
			{children}
		</Popover>
	);
};

export default EditPost;
