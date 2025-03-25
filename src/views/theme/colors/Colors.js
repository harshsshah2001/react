import React, { useState } from "react";
import axios from "axios";

function AppointmentForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    allocatedTime: "",
    visitorEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
      await axios.post("http://localhost:3001/appointment/create", formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccessMessage(` Appointment for ${formData.firstName} ${formData.lastName} scheduled successfully! Email sent to ${formData.visitorEmail}.`);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", background: "white" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "15px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "600px" }}>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "2rem", fontSize: "2rem", background: "linear-gradient(to right, #667eea, #764ba2)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Schedule an Appointment
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {[{ label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Date", name: "date", type: "date" },
              { label: "Allocated Time", name: "allocatedTime", type: "time" },
              { label: "Visitor Email", name: "visitorEmail", type: "email" },
            ].map(({ label, name, type = "text" }) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontWeight: "bold", fontSize: "1rem", color: "#333", width: "40%" }}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: "12px 15px", border: "2px solid #eee", borderRadius: "8px", fontSize: "1rem", background: "#f8f9fa" }}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#aaa" : "linear-gradient(to right, #667eea, #764ba2)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => !loading && (e.target.style.transform = "translateY(0)")}
          >
            {loading ? "Processing..." : "Send to Email"}
          </button>
        </form>

        {successMessage && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "green", fontWeight: "bold" }}>{successMessage}</p>
        )}
      </div>
    </div>
  );
}

export default AppointmentForm;
