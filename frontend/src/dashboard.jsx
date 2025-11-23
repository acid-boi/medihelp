import { useState } from "react";
import "./medihelp.css";
// import UploadAndDisplayImage from './uploadImage.jsx'

const API_URL = "http://localhost:8000";

export default function Dashboard() {
  const [tab, setTab] = useState("dashboard");
  const [showMeds, setShowMeds] = useState(false);
  const [ready, setReady] = useState("No prescription uploaded");

  const [locationStatus, setLocationStatus] = useState("Click 'Find Nearest Stores' to get your location and search.");
  const [nearestStores, setNearestStores] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const findStores = async () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("Getting your current location...");
    setIsSearching(true);
    setNearestStores(null);

    try {
      // getting user location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // const latitude = 19.13391234;
          // const longitude = 72.91191234;
          // console.log("Raw Lat/Lng from Browser:", latitude, longitude);

          setLocationStatus(`Location found: Lat ${latitude.toFixed(8)}, Lng ${longitude.toFixed(8)}. Searching for stores...`);

          const response = await fetch(`${API_URL}/findNearestStores?latitude=${latitude}&longitude=${longitude}`, {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          // displaying results
          setNearestStores(data.nearest_stores);
          setLocationStatus(`Found ${data.stores_found} store(s)`);
          // using S2 Level ${data.s2_level_used}.
          setIsSearching(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus(`Error getting location: ${error.message}`);
          setIsSearching(false);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
      );
    } catch (error) {
      console.error("API call error:", error);
      setLocationStatus(`Error fetching stores: ${error.message}`);
      setIsSearching(false);
    }
  };

  return (
    <div className="login-container">
      <div className="app-name">MediHelp</div>

      {/* tabs */}
      <nav className="top-tabs">
        <TabButton id="dashboard" label="Dashboard" />
        <TabButton id="prescriptions" label="Prescriptions" />
        <TabButton id="reminders" label="Reminders" />
        <TabButton id="storeLocator" label="Store Locator" />
        {/* <TabButton id="profile" label="Profile" /> */}
        {/* <TabButton id="settings" label="Settings" /> */}
      </nav>

      {/* different pages for each tab */}
      <div id="content-area">
        <Screen id="dashboard">
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
            <button className="submit-button">Upload Prescription</button>
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

        <Screen id="storeLocator">
          <h2 className="card-title">Nearest Store Locator</h2>
          <div className="login-card">
            <button 
              className="submit-button" 
              onClick={findStores}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Find Nearest Stores'}
            </button>

            {locationStatus && (
              <p style={{ 
                marginTop: '10px', 
                  fontSize: '0.9rem', 
                  color: locationStatus.includes("Error") ? 'red' : '#666' 
              }}>
              {locationStatus}
              </p>
            )}

            {nearestStores && nearestStores.length > 0 ? (
              <>
                <h3 style={{marginTop: '20px'}}>Stores Found:</h3>
                <ul className="store-list">
                  {nearestStores.map((store) => (
                    <li key={store.store_id} className="store-item">
                      <p>
                        Store Code: {store.store_code} | Owner: {store.owner_name}
                    {console.log(store)}
                      </p>
                      <p>
                        Address: {store.address}, {store.district}, {store.state} - {store.pin_code}
                      </p>
                      <p>
                        Contact: {store.phone_number}
                      </p>
                      <hr style={{margin: '10px 0'}}/>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`} target="_blank" rel="noopener noreferrer">View on Map</a>
                    </li>
                  ))}
                </ul>
              </>
            ) : nearestStores && nearestStores.length === 0 ? (
              <p style={{marginTop: '20px', color: 'red'}}>
                No stores found within the search radius.
              </p>
            ) : null}
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
