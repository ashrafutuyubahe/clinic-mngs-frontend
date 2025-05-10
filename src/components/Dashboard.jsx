import React from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const userName = localStorage.getItem("userName");

  return (
    <div className="dashboard">
      <h1>Welcome, {userName || "User"}!</h1>
      <p>This is your dashboard.</p>
    </div>
  );
};

export default Dashboard;
