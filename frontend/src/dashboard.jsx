import { useState } from "react";
import "./medihelp.css";
import govtFundingPlot from '../assets/govt_funding.png';
import totalJAKsPlot from '../assets/total_opened_JAKs.png';

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
        <TabButton id="dashboard" label="What is Medihelp?" />
        <TabButton id="prescriptions" label="Prescriptions" />
        {/* <TabButton id="reminders" label="Reminders" /> */}
        <TabButton id="storeLocator" label="Store Locator" />
        {/* <TabButton id="profile" label="Profile" /> */}
        {/* <TabButton id="settings" label="Settings" /> */}
      </nav>

      {/* different pages for each tab */}
      <div id="content-area">
        <Screen id="dashboard">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
              Why Pay More for the Same Cure?
            </h2>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.5' }}>
              <strong>MediHelp</strong> bridges the gap between you and affordable healthcare. 
              We help you find <strong>Jan Aushadhi Kendras</strong> set up by the Government of India where medicines are 
              <strong> 50% to 90% cheaper</strong> than branded alternatives. Under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP), as of September 30, 2024, a total of 13,822 Jan Aushadhi Kendras have been established across the country. PMBJP, in last 10 years, has led to estimated savings of Rs. 30,000 Crores for the citizens as compared to the branded medicines.

            </p>
          </div>

          <div className="login-card">
            <h3>Growth & Impact</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#666' }}>
              Government investment and the number of centers are rising rapidly, ensuring you have access to affordable meds nearby.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              <div className="plot-container" style={{ textAlign: 'center' }}>
                <img src={govtFundingPlot} alt="Graph showing sales growth" 
                  style={{ 
                    width: '100%',
                    maxWidth: '650px',
                    height: 'auto',
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
                <p style={{textAlign: 'center', fontSize: '0.8rem', marginTop: '8px', color: '#555'}}>
                  Government of India has been increasing investment in PMBJP program
                </p>
              </div>
              
              <div className="plot-container" style={{ textAlign: 'center' }}>
                <img src={totalJAKsPlot} alt="Graph showing increase in centers" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '650px',
                    height: 'auto', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    display: 'block',
                    margin: '0 auto' 
                  }} 
                />
                 <p style={{textAlign: 'center', fontSize: '0.8rem', marginTop: '8px', color: '#555'}}>
                    By Sept. 2024, over 13,000 JAKs have been set up. Government is targeting 25,000 Kendras
                 </p>
              </div>

            </div>
          </div>

          <div className="login-card" style={{ textAlign: 'center', background: '#e8f6f3' }}>
            <h3>Ready to save?</h3>
            <p style={{fontSize: '0.9rem'}}>Upload your prescription to find generic alternatives now.</p>
            <button 
              className="submit-button" 
              onClick={() => setTab('prescriptions')}
              style={{ marginTop: '10px' }}
            >
              Start Now
            </button>
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

        {/* <Screen id="reminders"> */}
        {/*   <h2 className="card-title">Reminders</h2> */}
        {/*   <div className="login-card"> */}
        {/*     <p>Med A — 8 AM / 8 PM</p> */}
        {/*     <p>Med B — 9 AM</p> */}
        {/*     <button className="submit-button">Add Reminder</button> */}
        {/*   </div> */}
        {/* </Screen> */}

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
