import { useState } from "react";
import "./medihelp.css";
import Uploady from "uploady";
// import UploadAndDisplayImage from './uploadImage.jsx'

export default function Dashboard() {
  const [tab, setTab] = useState("dashboard");
  const [showMeds, setShowMeds] = useState(false);
  const [ready, setReady] = useState("No prescription uploaded");

  const TabButton = ({ id, label }) => (
    <button className="tab-btn" onClick={() => setTab(id)}>
      {label}
    </button>
  );

  const Screen = ({ id, children }) => (
    <section
      style={{ display: tab === id ? "block" : "none" }}
      className="screen"
    >
      {children}
    </section>
  );

  const filterBySize = (file) => {
    //filter out images larger than 5MB
    return file.size <= 5242880;
  };

  const handleImageUpload = () => {
    return {
      <Uploady
        destination={{ url: "http://localhost:8888/" }}
        fileFilter={filterBySize}
        accept="image/*"
      />
    }
  }

  return (
    <div className="login-container">
      <div className="app-name">MediHelp</div>

      {/* tabs */}
      <nav className="top-tabs">
        <TabButton id="dashboard" label="Dashboard" />
        <TabButton id="prescriptions" label="Prescriptions" />
        <TabButton id="reminders" label="Reminders" />
        {/* <TabButton id="insights" label="Insights" /> */}
        {/* <TabButton id="profile" label="Profile" /> */}
        {/* <TabButton id="settings" label="Settings" /> */}
      </nav>

      {/* different pages for each tab */}
      <div id="content-area">
        <Screen id="dashboard">
          {/* <h2 className="card-title">Dashboard</h2> */}
          {/* <div className="login-card"> */}
          {/*   <p>Hi, Kushagra 👋</p> */}
          {/*   <p>Your daily health tip goes here.</p> */}
          {/* </div> */}

          <div className="login-card">
            <h3>Today's Medicines</h3>
            <ul>
              <li>
                <input type="checkbox" /> Med A
              </li>
              <li>
                <input type="checkbox" /> Med B
              </li>
            </ul>
          </div>

          <div className="login-card">
            <h3>Quick Metrics</h3>
            <p>Weight: 72kg</p>
            <p>BMI: 22.4</p>
          </div>
        </Screen>

        <Screen id="prescriptions">
          <h2 className="card-title">Upload your prescription below</h2>
          <div className="login-card">
            <button className="submit-button" onClick={() => handleImageUpload()}>Upload Prescription</button>
            <br/>
            {/* set ready variable by polling and also set showMeds == true when the ocr is received */}
            <p>OCR Status: {ready}</p>
          {showMeds === true && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dose</th>
                  <th>Freq</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Metformin</td>
                  <td>500mg</td>
                  <td>2/day</td>
                  <td>30d</td>
                </tr>
              </tbody>
            </table>
          )}
          </div>
        </Screen>

        <Screen id="reminders">
          <h2 className="card-title">Reminders</h2>
          <div className="login-card">
            <p>Med A — 8 AM / 8 PM</p>
            <p>Med B — 9 AM</p>
            <button className="submit-button">Add Reminder</button>
          </div>
        </Screen>

        {/* <Screen id="insights"> */}
        {/*   <h2 className="card-title">Insights</h2> */}
        {/*   <div className="login-card">Diet Tips</div> */}
        {/*   <div className="login-card">Exercise Tips</div> */}
        {/*   <div className="login-card">Precautions</div> */}
        {/* </Screen> */}

        {/* <Screen id="profile"> */}
        {/*   <h2 className="card-title">Profile</h2> */}
        {/*   <div className="login-card"> */}
        {/*     <p>Name, Age, Gender</p> */}
        {/*     <button className="submit-button">Edit Profile</button> */}
        {/*   </div> */}
        {/* </Screen> */}

        {/* <Screen id="settings"> */}
        {/*   <h2 className="card-title">Settings</h2> */}
        {/*   <div className="login-card"> */}
        {/*     <p>Notifications</p> */}
        {/*     <p>Telegram Link</p> */}
        {/*     <p>Privacy</p> */}
        {/*   </div> */}
        {/* </Screen> */}
      </div>

      {/* floating Circles */}
      <div className="floating-circles">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
    </div>
  );
}
