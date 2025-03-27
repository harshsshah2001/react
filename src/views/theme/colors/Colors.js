import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";

function AppointmentForm() {
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    allocatedTime: "",
    visitorEmail: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Unified message state
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Disable the rest of the website when the form is active
  useEffect(() => {
    document.body.style.overflow = "hidden"; // Prevent scrolling
    return () => {
      document.body.style.overflow = "auto"; // Restore scrolling when unmounted
    };
  }, []);

  // Check submission status on mount and email change
  useEffect(() => {
    const submittedKey = `appointment_submission_${formData.visitorEmail}`;
    const hasPreviouslySubmitted = localStorage.getItem(submittedKey) === "true";
    setHasSubmitted(hasPreviouslySubmitted);
    if (hasPreviouslySubmitted && formData.visitorEmail) {
      setMessage("You have already scheduled an appointment with this email.");
    }
  }, [formData.visitorEmail]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value && !value.match(/^[a-zA-Z\s]{2,}$/)) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters and contain only letters`;
        }
        break;
      case 'visitorEmail':
        if (value && !value.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'allocatedTime':
        if (value && formData.date) {
          const selectedDate = new Date(formData.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);
          if (selectedDate.getTime() === today.getTime()) {
            const [hours, minutes] = value.split(':').map(Number);
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            if (
              hours < currentHours ||
              (hours === currentHours && minutes <= currentMinutes)
            ) {
              error = 'Allocation time cannot be in the past for today';
            }
          }
        }
        break;
      case 'date':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = 'Date must be today or later';
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    if (name === 'date' && formData.allocatedTime) {
      const timeError = validateField('allocatedTime', formData.allocatedTime);
      setErrors((prev) => ({ ...prev, allocatedTime: timeError }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (hasSubmitted) {
      setMessage("You have already submitted this form.");
      setLoading(false);
      return;
    }

    if (!validateForm()) {
      setMessage("Please fix all errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://192.168.3.75:3001/appointment/create", formData, {
        headers: { "Content-Type": "application/json" },
      });
      const successMsg = `Appointment for ${formData.firstName} ${formData.lastName} scheduled successfully! Email sent to ${formData.visitorEmail}.`;
      setMessage(successMsg);
      const submittedKey = `appointment_submission_${formData.visitorEmail}`;
      localStorage.setItem(submittedKey, "true");
      setHasSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        date: "",
        allocatedTime: "",
        visitorEmail: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Failed to process request. Please try again.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Render submitted state with Back button
  if (hasSubmitted) {
    return (
      <>
        {/* Overlay to disable the background without changing its appearance */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "transparent", // No visible change to the background
            zIndex: 999, // Below the form but above everything else
            pointerEvents: "auto", // Captures all clicks to disable interaction
          }}
        />
        {/* Form container */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)", // Center the form
            zIndex: 1000, // Above the overlay
            background: "white",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "2rem",
              background: "linear-gradient(to right, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Form Already Submitted
          </h1>
          <p style={{ textAlign: "center", color: "#666" }}>
            You have already scheduled an appointment with this email. You can only submit this form once.
          </p>
          <button
            onClick={() => navigate("/dashboard")} // Redirect to dashboard
            style={{
              display: "block",
              margin: "1rem auto",
              padding: "10px 20px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Back
          </button>
        </div>
      </>
    );
  }

  // Render form
  return (
    <>
      {/* Overlay to disable the background without changing its appearance */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "transparent", // No visible change to the background
          zIndex: 999, // Below the form but above everything else
          pointerEvents: "auto", // Captures all clicks to disable interaction
        }}
      />
      {/* Form container */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)", // Center the form
          zIndex: 1000, // Above the overlay
          background: "white",
          padding: "2rem",
          borderRadius: "15px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "2rem",
            background: "linear-gradient(to right, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Schedule an Appointment
        </h1>
        {message && (
          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              color: message.includes("successfully") ? "#28a745" : "#dc3545",
              fontWeight: "bold",
              background: message.includes("successfully") ? "#e6ffe6" : "#ffe6e6",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Date", name: "date", type: "date" },
              { label: "Allocated Time", name: "allocatedTime", type: "time" },
              { label: "Visitor Email", name: "visitorEmail", type: "email" },
            ].map(({ label, name, type = "text" }) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontWeight: "bold", fontSize: "1rem", color: "#333", width: "40%" }}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    min={name === "date" ? new Date().toISOString().split('T')[0] : undefined}
                    style={{
                      flex: 1,
                      padding: "12px 15px",
                      border: "2px solid #eee",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      background: "#f8f9fa",
                      borderColor: errors[name] ? "red" : "#eee",
                    }}
                  />
                </div>
                {errors[name] && (
                  <span style={{ color: "red", fontSize: "0.8rem", marginLeft: "40%" }}>
                    {errors[name]}
                  </span>
                )}
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
            {loading ? "Processing..." : "Schedule Appointment"}
          </button>
        </form>
      </div>
    </>
  );
}

export default AppointmentForm;
