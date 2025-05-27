// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    disease: "",
    medication: "",
  });
  const [updateForm, setUpdateForm] = useState(null); // For updating a patient
  const [page, setPage] = useState(0); // Current page for pagination
  const [totalPages, setTotalPages] = useState(0); // Total pages from backend
  const [sortDir, setSortDir] = useState("asc"); // Sorting direction
  const [error, setError] = useState(null); // For error messages
  const pageSize = 2; // Matches backend default size

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch paginated or sorted patients
  const fetchPatients = async (pageNum = 0, sort = sortDir) => {
    try {
      const endpoint =
        sort === "asc" || sort === "desc"
          ? `http://localhost:8081/clinic-mngs-v2/api/v1/patients/sorted-by-name?sortDir=${sort}`
          : `http://localhost:8081/clinic-mngs-v2/api/v1/patients/get-all-Paginated?page=${pageNum}&size=${pageSize}`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: authHeaders,
      });

      console.log("Fetch Patients Response:", {
        url: endpoint,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Fetch Patients Data:", data);

      if (sort === "asc" || sort === "desc") {
        setPatients(data);
        setTotalPages(1);
      } else {
        setPatients(data.content);
        setTotalPages(data.totalPages);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(`Failed to fetch patients: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
    fetchPatients(page, sortDir);
  }, [page, sortDir, token]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8081/clinic-mngs-v2/api/v1/patients/remove-patient/${id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      console.log("Delete Patient Response:", {
        url: `http://localhost:8081/clinic-mngs-v2/api/v1/patients/remove-patient/${id}`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.text();
      console.log("Delete Patient Data:", data);
      fetchPatients(page, sortDir);
      alert("Patient deleted successfully.");
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError(`Failed to delete patient: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8081/clinic-mngs-v2/api/v1/patients/create-patient",
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            ...form,
            age: parseInt(form.age),
          }),
        }
      );

      console.log("Create Patient Response:", {
        url: "http://localhost:8081/clinic-mngs-v2/api/v1/patients/create-patient",
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Create Patient Data:", data);
      fetchPatients(page, sortDir);
      setForm({
        fullName: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        disease: "",
        medication: "",
      });
      setError(null);
      alert("Patient created successfully.");
    } catch (err) {
      console.error("Error creating patient:", err);
      setError(`Failed to create patient: ${err.message}`);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8081/clinic-mngs-v2/api/v1/patients/get-single/${id}`,
        {
          method: "GET",
          headers: authHeaders,
        }
      );

      console.log("Fetch Single Patient Response:", {
        url: `http://localhost:8081/clinic-mngs-v2/api/v1/patients/get-single/${id}`,
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          // Debugging CORS headers specifically
          'access-control-allow-origin': response.headers.get('access-control-allow-origin') || 'unknown',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Fetch Patient Data:", data);
      // Ensure all fields are included, with fallback to empty string if null
      setUpdateForm({
        id: data.id || "",
        fullName: data.fullName || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        disease: data.disease || "",
        medication: data.medication || "",
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching patient for update:", err);
      setError(`Failed to fetch patient for update: ${err.message}`);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8081/clinic-mngs-v2/api/v1/patients/update-patient/${updateForm.id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            fullName: updateForm.fullName,
            age: parseInt(updateForm.age),
            gender: updateForm.gender,
            phone: updateForm.phone,
            email: updateForm.email,
            address: updateForm.address,
            disease: updateForm.disease,
            medication: updateForm.medication,
          },
        )},
      );

      console.log("Update Patient Response:", {
        url: `http://localhost:8081/clinic-mngs-v2/api/v1/patients/update-patient/${updateForm.id}`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Update Patient Data:", data);
      fetchPatients(page, sortDir);
      setUpdateForm(null);
      setError(null);
      alert("Patient updated successfully!");
    } catch (err) {
      console.error("Error updating patient:", err);
      setError(`Failed to update patient: ${err.message}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleSortChange = (direction) => {
    setSortDir(direction);
    setPage(0);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/clinic-mngs-v2/api/v1/auth/logout",
        {
          method: "POST",
          headers: authHeaders,
        },
      );

      console.log("Logout Response:", {
        url: "http://localhost:8081/clinic-mngs-v2/api/v1/auth/logout",
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.text();
      console.log("Logout Data:", data);
    } catch (err) {
      console.error("Error during logout: err")
      setError(`Failed to logout: ${err.message}`);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        Welcome, {userName || "User"}!
        <button onClick={handleLogout} style={{ marginLeft: "20px" }}>
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-box">
          {error && <p style={{ color: "red" }}>{error}</p>}
          <h2>Patient List</h2>
          <div>
            <button onClick={() => handleSortChange("asc")}>
              Sort by Name (Asc)
            </button>
            <button onClick={() => handleSortChange("desc")}>
              Sort by Name (Desc)
            </button>
            <button onClick={() => handleSortChange("")}>Reset Sort</button>
          </div>
          {patients.length === 0 ? (
            <p>No patients found.</p>
          ) : (
            <>
              <table style={{ width: "100%", marginBottom: "20px" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Disease</th>
                    <th>Address</th>
                    <th>Medication</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.fullName}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.disease}</td>
                      <td>{patient.address}</td>
                      <td>{patient.medication}</td>
                      <td>
                        <button onClick={() => handleDelete(patient.id)}>
                          Delete
                        </button>
                        <button onClick={() => handleUpdate(patient.id)}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <span>
                    {" "}
                    Page {page + 1} of {totalPages}{" "}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          <h2>Create New Patient</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              name="age"
              placeholder="Age"
              type="number"
              value={form.age}
              onChange={handleChange}
              required
            />
            <input
              name="gender"
              placeholder="Gender"
              value={form.gender}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />
            <input
              name="disease"
              placeholder="Disease"
              value={form.disease}
              onChange={handleChange}
            />
            <input
              name="medication"
              placeholder="Medication"
              value={form.medication}
              onChange={handleChange}
            />
            <button type="submit">Add Patient</button>
          </form>

          {/* Update Patient Modal */}
          {updateForm && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setUpdateForm(null)}>
                  &times;
                </span>
                <h2>Update Patient</h2>
                <form onSubmit={handleUpdateSubmit}>
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    value={updateForm.fullName}
                    onChange={handleUpdateChange}
                    required
                  />
                  <input
                    name="age"
                    placeholder="Age"
                    type="number"
                    value={updateForm.age}
                    onChange={handleUpdateChange}
                    required
                  />
                  <input
                    name="gender"
                    placeholder="Gender"
                    value={updateForm.gender}
                    onChange={handleUpdateChange}
                    required
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={updateForm.phone}
                    onChange={handleUpdateChange}
                    required
                  />
                  <input
                    name="email"
                    placeholder="Email"
                    value={updateForm.email}
                    onChange={handleUpdateChange}
                  />
                  <input
                    name="address"
                    placeholder="Address"
                    value={updateForm.address}
                    onChange={handleUpdateChange}
                  />
                  <input
                    name="disease"
                    placeholder="Disease"
                    value={updateForm.disease}
                    onChange={handleUpdateChange}
                  />
                  <input
                    name="medication"
                    placeholder="Medication"
                    value={updateForm.medication}
                    onChange={handleUpdateChange}
                  />
                  <div className="modal-actions">
                    <button type="submit">Update Patient</button>
                    <button type="button" onClick={() => setUpdateForm(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;