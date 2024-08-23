import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Modal from "react-modal";
import "./NestedTable.css"; // Importing the CSS file

Modal.setAppElement("#root"); // Setting the root element for accessibility

const NestedTable = () => {
  const [data, setData] = useState([]);
  const [newRow, setNewRow] = useState({
    id: null,
    firstName: "",
    lastName: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentParentId, setCurrentParentId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRow((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateRow = () => {
    if (isEditing) {
      const updatedData = updateRowRecursive(data, newRow.id, newRow);
      setData(updatedData);
      setIsEditing(false);
    } else {
      setData([...data, { ...newRow, id: uuidv4(), nestedData: [] }]);
    }
    setNewRow({ id: null, firstName: "", lastName: "", description: "" });
    setCurrentParentId(null);
  };

  const updateRowRecursive = (rows, id, updatedRow) => {
    return rows.map((row) => {
      if (row.id === id) {
        return { ...updatedRow, nestedData: row.nestedData };
      } else if (row.nestedData && row.nestedData.length > 0) {
        return {
          ...row,
          nestedData: updateRowRecursive(row.nestedData, id, updatedRow),
        };
      }
      return row;
    });
  };

  const editRow = (id) => {
    const rowToEdit = findRowById(data, id);
    setNewRow(rowToEdit);
    setIsEditing(true);
  };

  const findRowById = (rows, id) => {
    for (const row of rows) {
      if (row.id === id) return row;
      if (row.nestedData && row.nestedData.length > 0) {
        const nestedResult = findRowById(row.nestedData, id);
        if (nestedResult) return nestedResult;
      }
    }
    return null;
  };

  const deleteRow = (id) => {
    const updatedData = deleteRowRecursive(data, id);
    setData(updatedData);
  };

  const deleteRowRecursive = (rows, id) => {
    return rows
      .filter((row) => row.id !== id)
      .map((row) => ({
        ...row,
        nestedData: deleteRowRecursive(row.nestedData, id),
      }));
  };

  const openModal = (parentId) => {
    setCurrentParentId(parentId);
    setNewRow({ id: null, firstName: "", lastName: "", description: "" });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewRow({ id: null, firstName: "", lastName: "", description: "" });
    setCurrentParentId(null);
  };

  const addNestedRow = () => {
    const updatedData = addNestedRowRecursive(data, currentParentId, {
      id: uuidv4(),
      firstName: newRow.firstName,
      lastName: newRow.lastName,
      description: newRow.description,
      nestedData: [],
    });
    setData(updatedData);
    closeModal(); // Close the modal and reset the form fields
  };

  const addNestedRowRecursive = (rows, parentId, newRow) => {
    return rows.map((row) => {
      if (row.id === parentId) {
        return { ...row, nestedData: [...row.nestedData, newRow] };
      } else if (row.nestedData && row.nestedData.length > 0) {
        return {
          ...row,
          nestedData: addNestedRowRecursive(row.nestedData, parentId, newRow),
        };
      }
      return row;
    });
  };

  const renderTableRows = (rows) => {
    return rows.map((row) => (
      <React.Fragment key={row.id}>
        <tr>
          <td>{row.firstName}</td>
          <td>{row.lastName}</td>
          <td>{row.description}</td>
          <td>
            <button className="btn btn-add" onClick={() => openModal(row.id)}>
              Add Nested
            </button>
            <button className="btn btn-edit" onClick={() => editRow(row.id)}>
              Edit
            </button>
            <button
              className="btn btn-delete"
              onClick={() => deleteRow(row.id)}
            >
              Delete
            </button>
          </td>
        </tr>
        {row.nestedData.length > 0 && (
          <tr>
            <td colSpan="4">
              <table className="nested-table">
                <tbody>{renderTableRows(row.nestedData)}</tbody>
              </table>
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div>
      <h2>Dynamic Nested Table with Modal</h2>
      <div className="form-container">
        <input
          className="input-field"
          name="firstName"
          placeholder="First Name"
          value={newRow.firstName}
          onChange={handleInputChange}
        />
        <input
          className="input-field"
          name="lastName"
          placeholder="Last Name"
          value={newRow.lastName}
          onChange={handleInputChange}
        />
        <input
          className="input-field"
          name="description"
          placeholder="Description"
          value={newRow.description}
          onChange={handleInputChange}
        />
        <button className="btn btn-add-row" onClick={addOrUpdateRow}>
          {isEditing ? "Update Row" : "Add Row"}
        </button>
      </div>
      <table className="main-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderTableRows(data)}</tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Nested Data"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add Nested Data</h2>
        <input
          className="input-field"
          name="firstName"
          placeholder="First Name"
          value={newRow.firstName}
          onChange={handleInputChange}
        />
        <input
          className="input-field"
          name="lastName"
          placeholder="Last Name"
          value={newRow.lastName}
          onChange={handleInputChange}
        />
        <input
          className="input-field"
          name="description"
          placeholder="Description"
          value={newRow.description}
          onChange={handleInputChange}
        />
        <div className="modal-actions">
          <button className="btn btn-add" onClick={addNestedRow}>
            Add Nested
          </button>
          <button className="btn btn-cancel" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NestedTable;
