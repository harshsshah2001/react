import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const VisitorForm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    allocatedTime: "",
    visitorEmail: "",
    national_id: "",
    photo: null,
    mobile_number: "",
    personal_details: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const rawTime = searchParams.get("time") || "";
    let formattedTime = "";
    if (rawTime) {
      const timeParts = rawTime.split(" ");
      if (timeParts.length > 1) {
        formattedTime = timeParts[0]; // e.g., "10:00" from "10:00 AM"
      } else {
        formattedTime = rawTime.split(":").slice(0, 2).join(":"); // e.g., "10:00" from "10:00:00"
      }
    }

    setFormData((prev) => ({
      ...prev,
      firstName: searchParams.get("firstName") || "",
      lastName: searchParams.get("lastName") || "",
      date: searchParams.get("date") || "",
      allocatedTime: formattedTime,
      visitorEmail: searchParams.get("email") || "",
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files ? e.target.files[0] : null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:3001/appointment/create",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Server response:", response.data);
      setSuccessMessage(
        `Appointment details for ${formData.firstName} ${formData.lastName} updated successfully!`
      );
    } catch (error) {
      console.error("Error submitting appointment details:", error);
      const errorMsg = error.response?.data?.message || "Failed to process request. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", background: "white" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "15px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "600px" }}>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "2rem", fontSize: "2rem", background: "linear-gradient(to right, #667eea, #764ba2)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Complete Your Appointment Details
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "First Name", name: "firstName", disabled: true },
              { label: "Last Name", name: "lastName", disabled: true },
              { label: "Date", name: "date", type: "date", disabled: true },
              { label: "Allocated Time", name: "allocatedTime", type: "time", disabled: true },
              { label: "Email", name: "visitorEmail", type: "email", disabled: true },
              { label: "National ID", name: "national_id", type: "text" },
              { label: "Photo", name: "photo", type: "file", onChange: handleFileChange },
              { label: "Mobile Number", name: "mobile_number", type: "text" },
              { label: "Personal Details", name: "personal_details", type: "textarea" },
              { label: "Note", name: "note", type: "textarea" },
            ].map(({ label, name, type = "text", disabled = false, onChange = handleChange }) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontWeight: "bold", fontSize: "1rem", color: "#333", width: "40%" }}>{label}</label>
                {type === "textarea" ? (
                  <textarea
                    name={name}
                    value={formData[name]}
                    onChange={onChange}
                    disabled={disabled}
                    required={!disabled}
                    rows={3}
                    style={{ flex: 1, padding: "12px 15px", border: "2px solid #eee", borderRadius: "8px", fontSize: "1rem", background: "#f8f9fa" }}
                  />
                ) : type === "file" ? (
                  <input
                    type="file"
                    name={name}
                    onChange={onChange}
                    required={!disabled}
                    accept="image/jpeg,image/png"
                    style={{ flex: 1, padding: "12px 15px", border: "2px solid #eee", borderRadius: "8px", fontSize: "1rem", background: "#f8f9fa" }}
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={onChange}
                    disabled={disabled}
                    required={!disabled}
                    style={{ flex: 1, padding: "12px 15px", border: "2px solid #eee", borderRadius: "8px", fontSize: "1rem", background: "#f8f9fa" }}
                  />
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
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        {successMessage && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "green", fontWeight: "bold" }}>{successMessage}</p>
        )}
        {errorMessage && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "red", fontWeight: "bold" }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default VisitorForm;
