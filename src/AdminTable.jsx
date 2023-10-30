import React, { useEffect, useState } from 'react';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { CircularProgress, Pagination } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
	DataGrid,
	GridActionsCellItem,
	GridRowEditStopReasons,
	GridRowModes,
	GridToolbarQuickFilter,
} from '@mui/x-data-grid';


const QuickSearchToolbar = () => {
	return (
		<Box
			sx={{
				p: 0.5,
				pb: 0,
				display: 'flex',
				justifyContent: 'start'
			}}
		>
			<GridToolbarQuickFilter />
		</Box>
	);
}

const FullFeaturedCrudGrid = () => {
	const [rows, setRows] = useState([]);
	const [rowModesModel, setRowModesModel] = useState({});
	const [selectedRowIds, setSelectedRowIds] = useState([]);
	const [isLoading, setisLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1);
	const rowsPerPage = 10;

	const totalPages = Math.ceil(rows.length / rowsPerPage);

	const startIndex = (currentPage - 1) * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentData = rows.slice(startIndex, endIndex);

	const handlePageChange = (event, newPage) => {
		setCurrentPage(newPage);
	};

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = () => {
		fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')

			.then(response => response.json())

			.then(data => {
				setisLoading(false)
				setRows(data)
			})

			.catch(error => {
				setisLoading(false)
				setRows([])
			});
	}

	const handleDeleteSelectedRows = () => {
		const updatedRows = rows.filter((row) => !selectedRowIds.includes(row.id));
		setRows(updatedRows);
		setSelectedRowIds([]);
	};

	const handleRowEditStop = (params, event) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
	};

	const handleEditClick = (id) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	};

	const handleSaveClick = (id) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	};

	const handleDeleteClick = (id) => () => {
		setRows(rows.filter((row) => row.id !== id));
	};

	const handleCancelClick = (id) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});

		const editedRow = rows.find((row) => row.id === id);
		if (editedRow.isNew) {
			setRows(rows.filter((row) => row.id !== id));
		}
	};

	const processRowUpdate = (newRow) => {
		const updatedRow = { ...newRow, isNew: false };
		setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
		return updatedRow;
	};

	const handleRowModesModelChange = (newRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const columns = [
		{ field: 'name', headerName: 'Name', width: 300, editable: true },
		{
			field: 'email',
			headerName: 'Email',
			width: 350,
			align: 'left',
			headerAlign: 'left',
			editable: true,
		},
		{
			field: 'role',
			headerName: 'Role',
			width: 200,
			editable: true,
			type: 'singleSelect',
			valueOptions: ['member', 'admin'],
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Actions',
			width: 100,
			cellClassName: 'actions',
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							icon={<SaveIcon />}
							label="Save"
							sx={{
								color: 'primary.main',
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							icon={<CancelIcon />}
							label="Cancel"
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={<EditIcon />}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label="Delete"
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];

	return (

		<>
			{
				isLoading ? <CircularProgress /> : (
					<>
					<Box sx={{ minHeight: 100, width: '100%' }}>
						<DataGrid
							rows={currentData}
							columns={columns}
							editMode="row"
							rowModesModel={rowModesModel}
							onRowModesModelChange={handleRowModesModelChange}
							onRowEditStop={handleRowEditStop}
							processRowUpdate={processRowUpdate}
							slots={{ toolbar: QuickSearchToolbar }}
							disableRowSelectionOnClick
							checkboxSelection
							hideFooter
							pagination={false}
							onRowSelectionModelChange={(newSelection) => setSelectedRowIds(newSelection)}
						/>
					</Box>
						<div style={{ display: 'flex', justifyContent: 'space-between',paddingTop: '20px' }}>
							<Pagination
								count={totalPages}
								page={currentPage}
								onChange={handlePageChange}
								showFirstButton
								showLastButton
								showNextButton
								showPreviousButton
							/>
							{
								selectedRowIds?.length > 0 && (
									<Button
										variant="contained"
										color="secondary"
										sx={{ display: 'flex' }}
										onClick={handleDeleteSelectedRows}
									>
										Delete Selected Rows
									</Button>
								)
							}
						</div>
					</>
				)
			}
		</>
	)

}

export default FullFeaturedCrudGrid;