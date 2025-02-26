/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable import/named */
import React from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Post } from '.';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import EditPost from './edit-post';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { fbDB } from 'utils/init-firebase';
import { Space } from 'antd';

// Define the props for the PostsTable component
interface PostsTableProps {
	posts: Post[];
}

const PostsTable: React.FC<PostsTableProps> = ({ posts }) => {
	// Dummy handler for edit action
	const updatePost = async (post: Post) => {
		// console.log('Editing post:', post);
		if (post.id) {
			const postRef = doc(fbDB, 'posts', post.id); // Reference to the document
			await updateDoc(postRef, {
				...post,
				timestamp: new Date().toISOString(), // Update the timestamp
			});

			console.log('Document successfully updated!');
		}
	};

	const deletePost = async (post: Post) => {
		console.log('Editing post:', post);
		if (post.id) {
			const postRef = doc(fbDB, 'posts', post.id); // Reference to the document
			await deleteDoc(postRef);

			console.log('Document deleted successfully!');
		}
	};

	// Column definitions for AG Grid
	const columnDefs: ColDef[] = [
		{ headerName: 'Title', field: 'title', sortable: true, filter: true },
		{ headerName: 'Author', field: 'author', sortable: true, filter: true },
		{
			headerName: 'Created At',
			field: 'createdAt',
			sortable: true,
			filter: true,
			valueFormatter: (params) => {
				console.log(params.data);
				return new Date(params.value as string).toLocaleString();
			},
		},
		{
			headerName: 'Updated At',
			field: 'timestamp',
			sortable: true,
			filter: true,
			valueFormatter: (params) => {
				console.log(params.data);
				return new Date(params.value as string).toLocaleString();
			},
		},
		{ headerName: 'Content', field: 'content', sortable: true, filter: true },
		{
			headerName: 'Actions',
			cellRenderer: (params: ICellRendererParams<Post>) => (
				<Space>
					<EditPost post={params.data as Post} onSave={updatePost}>
						<EditOutlined style={{ cursor: 'pointer', color: '#1890ff' }} />
					</EditPost>
					<DeleteOutlined
						style={{ cursor: 'pointer', color: 'red' }}
						onClick={() => deletePost(params.data as Post)}
					/>
				</Space>
			),
			width: 100,
		},
	];

	return (
		<div
			className="ag-theme-alpine"
			style={{ height: 400, width: '100%', marginTop: '24px' }}
		>
			<AgGridReact
				rowData={posts}
				columnDefs={columnDefs}
				pagination={true}
				paginationPageSize={10}
			/>
		</div>
	);
};

export default PostsTable;
