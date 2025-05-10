import React, { useState } from 'react';
import '../styles/RegisterPage.css';
import { useNavigate, Link } from "react-router-dom";
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    userPhone: ''
  });


    const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8081/clinic-mngs-v2/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.text();
    console.log(result);
    navigate("/login");
    setMessage(result);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="userName" placeholder="Username" onChange={handleChange} required />
        <input name="userEmail" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="userPassword" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="userPhone" placeholder="Phone" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
