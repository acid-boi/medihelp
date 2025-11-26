## MediHelp 

MediHelp is a full-stack application designed to assist users in locating medical stores (specifically Jan Aushadhi Kendras) and finding generic alternatives for branded medicines. The system features an OCR (Optical Character Recognition) pipeline to extract medicine names from prescription images, geospatial search for nearby stores using S2 geometry, and a fuzzy matching algorithm to suggest cost-effective generic substitutes.

The project follows a microservices-like architecture orchestrated via Docker:
* Frontend: React.js (Vite) for the user interface.
* Backend API: Python (FastAPI) for handling client requests.
* Database: PostgreSQL for storing medicine and store data.
* Async Queue: Redis for managing OCR tasks.
* OCR Engine: A background Python worker for processing images (OCR).

Code is organized in the following way: 

```
.
├── README.md
├── data_analysis.ipynb         # Jupyter notebook for initial data exploration
├── backend/
│   ├── docker-compose.yml      # Orchestration for backend services
│   ├── data/                   # Raw datasets
│   ├── database/               # Database seed files and SQL initialization
│   │   ├── db_init/
│   │   │   └── init.sql
│   │   ├── medicines.csv
│   │   └── stores.csv
│   ├── ocr_worker/             # Service for Optical Character Recognition
│   │   ├── Dockerfile
│   │   ├── parser.py           # Logic to parse OCR output
│   │   └── worker.py           # Worker entry point
│   └── server/                 # Main API Server (FastAPI/Python)
│       ├── Dockerfile
│       ├── main.py             # Application entry point
│       └── store_finder.py     # Logic for locating medical stores
└── frontend/                   # React + Vite application
    ├── index.html
    ├── vite.config.js
    ├── assets/                 # Static images and charts
    └── src/                    # Frontend source code
        ├── main.jsx            # React entry point
        ├── dashboard.jsx       # Main dashboard UI component
        └── medihelp.css        # Global styles

```

### Backend (/backend)

* Server Directory (/backend/server)

This is the core API service.

`main.py`: The entry point of the FastAPI application.

`Routes`: Handles /upload (OCR tasks), /findNearestStores (Geospatial query), and /getSuggestions (Medicine search).

`Logic`: Connects to Redis and PostgreSQL. It implements the fuzzy matching logic (using RapidFuzz) to link branded medicine names to generic composition data stored in the database/cache.

`store_finder.py`: Contains the geospatial search algorithms.

`Logic`: Uses the s2sphere library to convert Latitude/Longitude into S2 Cell IDs. It searches for stores in neighboring cells at varying zoom levels (Level 15 down to 12) to expand the search radius dynamically.

`Dockerfile`: Defines the environment for the API server (Python 3.9), installs dependencies, and starts the uvicorn server.

`requirements.txt`: Lists libraries required by the API (e.g., fastapi, psycopg2-binary, rapidfuzz, s2sphere, redis).

* Database Directory (/backend/database)
`db_init/init.sql`: SQL script executed on container startup. It defines the schema for medicines, genericmedicines, and stores tables.

*.csv: Seed files used to populate the database with initial data.

* OCR Worker Directory (/backend/ocr_worker)
`worker.py`: A background script that continuously listens to the Redis queue (ocr:tasks). It picks up image tasks, performs OCR, and writes the result back to Redis.

`parser.py`: Contains regex and text processing logic to clean the raw output from the OCR engine and extract relevant medicine names.

`docker-compose.yml`: The master configuration file that spins up the entire backend ecosystem (Postgres DB, Redis Cache, API Server, and OCR Worker) in a single command.

* Frontend (/frontend)
`src/main.jsx`: The JavaScript entry point that mounts the React application to the DOM.

`src/dashboard.jsx`: The main UI components. These fetch data from the backend API to display charts, store locations, and medicine suggestions to the user.

`src/medihelp.css`: Global styling for the application.

`vite.config.js`: Configuration for the Vite build tool, handling development server settings and bundling.

* Data Analysis
`data_analysis.ipynb`: A Jupyter Notebook used during the research phase. It contains Python code (Pandas/Matplotlib) to analyze the distribution of medical stores and clean the raw CSV dataset before importing it into the database.
