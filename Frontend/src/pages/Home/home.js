import { useState, useRef } from "react";
import "./home.css";

const Home = () => {
  const [formData, setFormData] = useState({
    file: null,
    age_group: "select",
    gender: "select",
    height: "",
    weight: "",
  });
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFormData({
      ...formData,
      file: selectedFile,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchHealthData = async () => {
    setLoading(true);

    const uploadData = new FormData();
    uploadData.append("file", formData.file);
    uploadData.append("age_group", formData.age_group);
    uploadData.append("gender", formData.gender);
    uploadData.append("height", formData.height);
    uploadData.append("weight", formData.weight);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();
      setHealthData(data);
      setHealthData(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHealthData();
  };

  return (
    <div className="home-container">
      <h4 className="input">Upload Your Data Here</h4>
      <div className="form-results-container">
        <form className="xray-form" onSubmit={handleSubmit}>
          <label htmlFor="xray">X-Ray Image</label>
          <input
            id="xray"
            accept="image/*"
            name="xray"
            type="file"
            onChange={handleFileChange}
            required
          />
          <p>
            Selected File:{" "}
            {formData.file ? formData.file.name : "No file selected"}
          </p>

          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="select">select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>

          <label htmlFor="age_group">Age Group</label>
          <select
            id="age_group"
            name="age_group"
            value={formData.age_group}
            onChange={handleInputChange}
            required
          >
            <option value="select">select</option>
            <option value="Under 20">Under 20</option>
            <option value="20-40">20-40</option>
            <option value="40-60">40-60</option>
            <option value="Over 60">Over 60</option>
          </select>

          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="height">Height (m)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            required
          />

          <button type="submit">Submit And Analyze Data</button>
        </form>

        {loading && <div>Loading...</div>}

        {healthData && (
          <div className="results-container" ref={resultsRef}>
            {formData.file && (
              <div className="xray-section">
                <img
                  src={URL.createObjectURL(formData.file)}
                  alt="Uploaded X-ray"
                  className="xray-preview"
                />
                <p className="severity-result">
                  <strong>Severity :</strong> {healthData.predicted_severity}
                </p>
              </div>
            )}

            <div className="results-content">
              <h3>
                Knee Osteoarthritis Severity and Recommended Guidance for
                Uploaded Data
              </h3>
              <table className="results-table">
                <tbody>
                  <tr>
                    <td>
                      <strong>BMI:</strong>
                    </td>
                    <td>{healthData.patient_details?.weight_category}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Gender:</strong>
                    </td>
                    <td>{healthData.patient_details?.gender}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Age Group:</strong>
                    </td>
                    <td>{healthData.patient_details?.age_group}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Height:</strong>
                    </td>
                    <td>{healthData.patient_details?.height}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Weight:</strong>
                    </td>
                    <td>{healthData.patient_details?.weight}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Exercise 1:</strong>
                    </td>
                    <td>{healthData.health_advice["Exercise 1"]}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Exercise 2:</strong>
                    </td>
                    <td>{healthData.health_advice["Exercise 2"]}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Nutritional Advice 1:</strong>
                    </td>
                    <td>{healthData.health_advice["Nutritional Advice 1"]}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Nutritional Advice 2:</strong>
                    </td>
                    <td>{healthData.health_advice["Nutritional Advice 2"]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
