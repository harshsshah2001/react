import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VisitorForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const rawTime = searchParams.get("time") || "";
    let formattedTime = "";
    if (rawTime) {
      const timeParts = rawTime.split(" ");
      if (timeParts.length > 1) {
        formattedTime = timeParts[0];
      } else {
        formattedTime = rawTime.split(":").slice(0, 2).join(":");
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

    // Add a class to hide everything except the form
    document.body.classList.add("hide-except-form");

    // Cleanup: Remove the class when component unmounts
    return () => {
      document.body.classList.remove("hide-except-form");
    };
  }, [searchParams]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (value && !value.match(/^[a-zA-Z\s]{2,}$/)) {
          error = `${name === "firstName" ? "First" : "Last"} name must be at least 2 characters and contain only letters`;
        }
        break;
      case "visitorEmail":
        if (value && !value.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
          error = "Please enter a valid email address";
        }
        break;
      case "national_id":
        if (value && !value.match(/^[a-zA-Z0-9]{4,}$/)) {
          error = "National ID must be at least 4 characters (letters and numbers allowed)";
        }
        break;
      case "mobile_number":
        if (value && !value.match(/^\d+$/)) {
          error = "Mobile number must contain only digits";
        }
        break;
      case "date":
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = "Date must be today or later";
          }
        }
        break;
      case "personal_details":
      case "note":
        if (value && value.length < 2) {
          error = `${name.replace("_", " ")} must be at least 2 characters`;
        }
        break;
      case "photo":
        if (value && !value.type.match("image/(jpeg|png)")) {
          error = "Please upload a JPEG or PNG image";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, photo: file }));
    const error = validateField("photo", file);
    setErrors((prev) => ({ ...prev, photo: error }));
    setShowPhotoOptions(false);
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    ["firstName", "lastName", "date", "allocatedTime", "visitorEmail"].forEach((key) => {
      if (!formData[key]) newErrors[key] = `${key.replace("_", " ")} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Please fix all errors before submitting");
      return;
    }

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
        "http://192.168.3.75:3001/appointment/create",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Server response:", response.data);
      setSuccessMessage(
        `Appointment for ${formData.firstName} ${formData.lastName} submitted successfully!`
      );
      setFormData({
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
      setErrors({});
      navigate('/thank-you');
    } catch (error) {
      console.error("Error submitting appointment details:", error);
      const errorMsg = error.response?.data?.message || "Failed to process request. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploadClick = () => {
    setShowPhotoOptions(true);
  };

  const handleChooseFromGallery = () => {
    fileInputRef.current.click();
  };

  const handleTakePhoto = () => {
    cameraInputRef.current.click();
  };

  return (
    <div
      id="visitor-form"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#fff", // Solid white background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Above hidden content
      }}
    >
      <div
        style={{
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
            color: "#333",
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "First Name", name: "firstName", disabled: true },
              { label: "Last Name", name: "lastName", disabled: true },
              { label: "Date", name: "date", type: "date", disabled: true },
              { label: "Allocated Time", name: "allocatedTime", type: "time", disabled: true },
              { label: "Email", name: "visitorEmail", type: "email", disabled: true },
              { label: "National ID", name: "national_id", type: "text" },
              { label: "Mobile Number", name: "mobile_number", type: "text" },
              { label: "Personal Details", name: "personal_details", type: "textarea" },
              { label: "Note", name: "note", type: "textarea" },
            ].map(({ label, name, type = "text", disabled = false, onChange = handleChange }) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontWeight: "bold", fontSize: "1rem", color: "#333", width: "40%" }}>{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      name={name}
                      value={formData[name]}
                      onChange={onChange}
                      disabled={disabled}
                      required={!disabled}
                      rows={3}
                      style={{
                        flex: 1,
                        padding: "12px 15px",
                        border: "2px solid",
                        borderColor: errors[name] ? "red" : "#eee",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        background: "#f8f9fa",
                      }}
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={onChange}
                      disabled={disabled}
                      required={!disabled}
                      style={{
                        flex: 1,
                        padding: "12px 15px",
                        border: "2px solid",
                        borderColor: errors[name] ? "red" : "#eee",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        background: "#f8f9fa",
                      }}
                    />
                  )}
                </div>
                {errors[name] && (
                  <span style={{ color: "red", fontSize: "0.8rem", marginLeft: "40%" }}>{errors[name]}</span>
                )}
              </div>
            ))}

            {/* Custom Photo Upload Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontWeight: "bold", fontSize: "1rem", color: "#333", width: "40%" }}>PhotoMonitor Photo</label>
                <div style={{ flex: 1 }}>
                  <button
                    type="button"
                    onClick={handlePhotoUploadClick}
                    style={{
                      padding: "12px 15px",
                      border: "2px solid",
                      borderColor: errors.photo ? "red" : "#eee",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      background: "#f8f9fa",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    Choose File
                  </button>
                  {showPhotoOptions && (
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={handleChooseFromGallery}
                        style={{
                          padding: "8px 12px",
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Choose File
                      </button>
                      <button
                        type="button"
                        onClick={handleTakePhoto}
                        style={{
                          padding: "8px 12px",
                          background: "#764ba2",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Camera
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    name="photoFromFile"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    name="photoFromCamera"
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              {errors.photo && (
                <span style={{ color: "red", fontSize: "0.8rem", marginLeft: "40%" }}>{errors.photo}</span>
              )}
              {formData.photo && (
                <span style={{ fontSize: "0.9rem", marginLeft: "40%", color: "#666" }}>
                  Selected: {formData.photo.name}
                </span>
              )}
            </div>
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

// Inject CSS to hide everything except the form
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  .hide-except-form > *:not(#visitor-form) {
    visibility: hidden;
  }
  #visitor-form {
    visibility: visible !important;
  }
`;
document.head.appendChild(styleSheet);

export default VisitorForm;
