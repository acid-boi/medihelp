import { useState } from "react";
import "./medihelp.css";
import govtFundingPlot from '../assets/govt_funding.png';
import totalJAKsPlot from '../assets/total_opened_JAKs.png';

const API_URL = "http://localhost:8000";

export default function Dashboard() {
  const [tab, setTab] = useState("dashboard");
  // const [showMeds, setShowMeds] = useState(false);
  // const [ready, setReady] = useState("No prescription uploaded");

  const [locationStatus, setLocationStatus] = useState("Click 'Find Nearest Stores' to get your location and search.");
  const [nearestStores, setNearestStores] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [ocrStatus, setOcrStatus] = useState("No prescription uploaded");
  const [imagePreview, setImagePreview] = useState(null);
  const [meds, setMeds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryTaskId, setRetryTaskId] = useState(null);


  const EditableRow = ({ data, index }) => {
    const [name, setName] = useState(data.medicine_name);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [expandedResult, setExpandedResult] = useState(null);

    const handleUpdate = async () => {
      try {
        setLoadingUpdate(true);
        setSuggestions([]);
        setExpandedResult(null);

        const res = await fetch(
          `${API_URL}/getSuggestions?q=${encodeURIComponent(name)}`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const json = await res.json();
        console.log("Update Row:", index, json);

        setSuggestions(json.results || []);
      } catch (err) {
        console.error("Update error:", err);
      } finally {
        setLoadingUpdate(false);
      }
    };

    const handleUseGeneric = (generic) => {
      setName(generic.generic_name);
      console.log("Selected generic:", generic);
    };

    return (
      <>
        <tr style={{ animation: "slideUp 0.4s ease" }}>
          <td>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #d0d7de",
                fontSize: "0.95rem",
              }}
            />
          </td>

          <td style={{ textAlign: "center" }}>{data.dosage || "-"}</td>
          <td style={{ textAlign: "center" }}>{data.frequency || "-"}</td>
          <td style={{ textAlign: "center" }}>{data.notes || "-"}</td>

          <td style={{ textAlign: "center" }}>
            <button
              onClick={handleUpdate}
              disabled={loadingUpdate}
              style={{
                background: "#6d28d9",
                color: "#fff",
                padding: "8px 12px",
                border: "none",
                borderRadius: "8px",
                cursor: loadingUpdate ? "not-allowed" : "pointer",
              }}
            >
              {loadingUpdate ? "Searching..." : "Update"}
            </button>
          </td>
        </tr>

        {/* The entire suggestions panel is scrollable */}
        {suggestions.length > 0 && (
          <tr>
            <td
              colSpan={5}
              style={{
                background: "#fbfbfe",
                padding: "12px 18px",
                maxHeight: "320px", // FIXED height
                overflowY: "auto", // Scrolls vertically
                overflowX: "hidden",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "0.95rem",
                  marginBottom: 8,
                  color: "#333",
                }}
              >
                <strong>Suggestions for “{name}”</strong> — results:{" "}
                {suggestions.length}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {suggestions.map((r, ri) => (
                  <div
                    key={ri}
                    style={{
                      borderRadius: 10,
                      border: "1px solid #e6e9ef",
                      padding: 12,
                      background: "#fff",
                      boxShadow: "0 2px 6px rgba(16,24,40,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: "#0b1f6b" }}>
                          {r.brand_name}
                        </div>

                        <div style={{ fontSize: 13, marginTop: 4 }}>
                          Composition: {r.composition1 || "-"}
                          {r.composition2 && ` | ${r.composition2}`}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            color:
                              r.confidence === "strong"
                                ? "#0b8043"
                                : "#b36b00",
                          }}
                        >
                          Confidence: {r.confidence} · Score: {r.score}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedResult(
                            expandedResult === ri ? null : ri
                          )
                        }
                        style={{
                          background: "#eef2ff",
                          border: "1px solid #dbeafe",
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        {expandedResult === ri
                          ? "Hide"
                          : "View generics"}
                      </button>
                    </div>

                    {expandedResult === ri && (
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {r.matched_generics?.map((g, gi) => (
                          <div
                            key={gi}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: 8,
                              background: "#f8fafc",
                              border: "1px solid #eef2ff",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {g.generic_name}
                              </div>
                              <div style={{ fontSize: 13, color: "#444" }}>
                                MRP:{" "}
                                {g.mrp != null ? `₹${g.mrp}` : "N/A"} ·{" "}
                                {g.unit_size || "-"} ·{" "}
                                {g.group_name || "-"}
                              </div>
                            </div>

                            {/* <button
                              onClick={() => handleUseGeneric(g)}
                              style={{
                                background: "#0b5fff",
                                color: "#fff",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: 8,
                                cursor: "pointer",
                              }}
                            >
                              Use
                            </button> */}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };


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

    // ------------------------------------------------------
  // UPLOAD + POLLING LOGIC
  // ------------------------------------------------------

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setLoading(true);
    setMeds([]);
    setImagePreview(URL.createObjectURL(file));
    setOcrStatus("Uploading...");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: form,
      });

      const uploadJson = await res.json();
      const taskId = uploadJson.task_id;

      console.log("Upload successful, task ID:", taskId);
      setRetryTaskId(taskId);
      setOcrStatus("Processing...");
      pollForResult(taskId);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg("Upload failed — check backend.");
      setOcrStatus("Failed.");
    }
  };

  const pollForResult = (taskId) => {
    const pollUrl = `${API_URL}/result/${taskId}`;

    const interval = setInterval(async () => {
      try {
        const r = await fetch(pollUrl);
        const j = await r.json();

        if (j.status === "done") {
          clearInterval(interval);
          setLoading(false);
          setOcrStatus("OCR complete!");
          setMeds(j.text || []);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setLoading(false);
        setOcrStatus("Error fetching result.");
        setErrorMsg("Polling failed — retry available.");
      }
    }, 2500);
  };

  const retryPolling = () => {
    if (!retryTaskId) return;
    setErrorMsg("");
    setLoading(true);
    setOcrStatus("Retrying...");
    pollForResult(retryTaskId);
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

        {/* <Screen id="prescriptions">
          <h2 className="card-title">Upload your prescription below</h2>
          <div className="login-card">
            <button className="submit-button">Upload Prescription</button>
            <br/> */}
            {/* set ready variable by polling and also set showMeds == true when the ocr is received */}
            {/* <p>OCR Status: {ready}</p>
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
        </Screen> */}

        
        <Screen id="prescriptions">
          <h2 className="card-title">Upload your prescription</h2>

          <div className="login-card">

            <label
              className={`submit-button ${loading ? "disabled" : ""}`}
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Please wait..." : "Upload Prescription"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={loading}
                onChange={handleFileSelected}
              />
            </label>

            {imagePreview && (
              <div style={{ marginTop: 20 }}>
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    maxWidth: 300,
                    borderRadius: 12,
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    animation: "fadeIn 0.4s ease",
                  }}
                />
              </div>
            )}

            <p style={{ marginTop: 15 }}>{ocrStatus}</p>

            {loading && (
              <div className="spinner" style={{ marginTop: 10 }}></div>
            )}

            {errorMsg && (
              <div className="error-toast">
                {errorMsg}
                {retryTaskId && (
                  <button className="retry-btn" onClick={retryPolling}>
                    Retry
                  </button>
                )}
              </div>
            )}

            {meds.length > 0 && (
              <table style={{ marginTop: 20, animation: "fadeIn 0.5s ease" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.map((m, idx) => (
                    <EditableRow key={idx} data={m} index={idx} />
                  ))}
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
