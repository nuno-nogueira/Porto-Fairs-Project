# Fairs & Markets Mobile App 📱

<a id="about"></a>
## 📌 About

A mobile application for discovering fairs and markets throughout the district of Porto, Portugal. Fairs brings together market information, seller profiles, favourites, ratings, personal notes and route planning in one React Native application.

The application is split into an **Expo / React Native frontend** and a **microservices backend**. The backend services communicate through an Nginx API Gateway and persist application data in separate MongoDB databases. The map is rendered with MapLibre. Stadia Maps provides map styles and road directions, while the local MOTIS software platform is used for public-transport routing.

<a id="contents"></a>
## 📚 Contents

- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Troubleshooting](#troubleshooting)
- [Useful Documentation](#useful-documentation)
- [Team](#team)

<a id="features"></a>
## ✨ Features

### 🏪 Discovery and Market Information

- Browse fairs and markets throughout the district of Porto, Portugal.
- Search and filter markets by name and category.
- Open public seller profiles and view their information.
- Leave a rating and comment about a specific market.

### 👤 Accounts and Personal Features

- Register and log in as a consumer or seller.
- Manage favourite markets and sellers.
- Create, edit and delete personal notes from the Notes tab.

### 🗺️ Map and Journey Planning

- Explore an interactive MapLibre map.
- Calculate and visualize walking and driving routes with Stadia Maps routing services.
- Use MOTIS for public-transport itinerary planning from local transport datasets.
- Visualize route information in the map interface.

### 🔔 Notifications and Calendar

- Schedule and display app notifications when a market or fair is about to start.
- Add market visits to Google Calendar.

<a id="screenshots"></a>
## 🖼️ Screenshots

| Splash Screen | Vendor Profile |
|:---:|:---:|
| ![Splash Screen](screenshots/app-splashscreen.png) | ![Vendor Profile](screenshots/vendor-profile.png) |

| Fair Information | Route Showcase |
|:---:|:---:|
| ![Fair Page Information](screenshots/fair-page-info.png) | ![Route Showcase](screenshots/route-showcasing.png) |

<a id="tech-stack"></a>
## 🧰 Tech Stack

### 📱 Mobile Application

- **React Native** and **TypeScript**
- **Expo** and **Expo Router**
- **Expo Dev Client** for custom native development builds
- **MapLibre React Native** (`@maplibre/maplibre-react-native`)
- **Stadia Maps** for map tiles, styles and directions APIs
- **Apollo Client** and **GraphQL** for market queries
- **Axios** for REST API requests
- **Expo SecureStore** for authentication token storage
- **Expo Notifications** for app notifications

### 🖥️ Backend and Infrastructure

- **Node.js / Express** and **MongoDB** for users, markets, notifications, ratings and routing
- **Apollo Server / GraphQL** for the Markets service
- **Java 17** and **Spring Boot 3** for the Favorites service
- **Python 3.12**, **FastAPI**, **Beanie** and **PyMongo's asynchronous MongoDB client** for the Notes service
- **Nginx** as the API Gateway
- **Docker Compose** for the local development environment
- **MongoDB Atlas** for database hosting

### 🚏 Routing and Geospatial Data

- **MapLibre Native** for mobile map rendering
- **Stadia Maps** for basemaps and road directions
- **MOTIS** for multimodal routing, including public transport and street-network routing
- **GTFS `.zip` timetable feeds** for public-transport operators
- **OpenStreetMap `.osm.pbf` extracts** for street-network data

### 🏗️ Application Architecture

The frontend communicates with the backend through a central Nginx API Gateway. The gateway forwards requests to the appropriate microservice.

The application uses:

- **Apollo Client / GraphQL** for market data.
- **Axios / REST** for communication with the other backend services.
- **Expo SecureStore** to persist authentication tokens.
- **MapLibre** to render the interactive map.
- **Stadia Maps** for walking and driving routes.
- **MOTIS**, accessed through the routing service, for public-transport itineraries.

<a id="repository-layout"></a>
## 🗂️ Repository Layout

```text
CMU-Project/
├── README.md
├── frontend/
│   ├── app/                    # Expo Router screens and tab layouts
│   ├── api/                    # Shared Axios instance
│   ├── components/             # Homepage, map, profile and UI components
│   ├── context/                # Authentication context
│   ├── hooks/                  # Reusable React hooks
│   ├── assets/                 # Images, map icons and note illustrations
│   ├── graphql/                # GraphQL queries (markets)
│   ├── types/                  # TypeScript object types
│   ├── utils/                  # Routing and style formatting utilities
│   ├── package.json
│   ├── package-lock.json
│   ├── app.json
│   └── .env                    # Local frontend configuration (not committed)
└── backend/
    ├── api-gateway/
    │   └── nginx.conf
    ├── users-service/
    ├── markets-service/
    ├── favorites-service/
    ├── ratings-service/
    ├── notifications-service/
    ├── notes-service/
    ├── routing-service/        # Node.js routing adapter
    ├── motis/                  # MOTIS binary, config, OSM/GTFS inputs and imported data
    ├── docker-compose.yml
    ├── docker-compose-swarm.yml
    ├── .env.example
    └── .env                    # Local backend configuration (not committed)
```

<a id="prerequisites"></a>
## ✅ Prerequisites

### 💻 Required for the Full Local Setup

- Git
- Docker Desktop with Docker Compose v2
- Node.js and npm
- A MongoDB Atlas cluster or another MongoDB server reachable by Docker
- Android Studio with Android SDK tools for local Android development
- A Stadia Maps account and API key for the configured map style and directions integration

### 🧩 Backend Development Requirements

When running the backend services outside Docker, the following tools are also required:

- Java 17 and Maven for the Favorites service
- Python 3.12 and pip for the Notes service
- Node.js and npm for the Node.js services and routing service

### 🍎 iOS Development

- macOS and Xcode are required to build and run the iOS native app locally.

### 🚏 MOTIS Data

The local MOTIS setup requires:

- A suitable OpenStreetMap extract (`.osm.pbf`). The current project data includes `portugal-latest.osm.pbf`.
- One or more current GTFS feeds (`.zip`). The tracked MOTIS additions include `metro-gtfs.zip` and `stcp-gtfs.zip`.

<a id="backend-setup"></a>
## ⚙️ Backend Setup

### 1. 🗄️ Configure MongoDB and Secrets

Open a terminal in the backend folder:

**Windows PowerShell:**

```powershell
cd backend
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and provide values for the following variables:

```dotenv
NODE_ENV=development
GATEWAY_PORT=8080
JWT_SECRET=replace_with_a_long_random_secret

MONGO_URL_USERS=mongodb+srv://<user>:<password>@<cluster>/feiras_users?retryWrites=true&w=majority
MONGO_URL_MARKETS=mongodb+srv://<user>:<password>@<cluster>/feiras_markets?retryWrites=true&w=majority
MONGO_URL_RATINGS=mongodb+srv://<user>:<password>@<cluster>/feiras_ratings?retryWrites=true&w=majority
MONGO_URL_FAVORITES=mongodb+srv://<user>:<password>@<cluster>/feiras_favorites?retryWrites=true&w=majority
MONGO_URL_NOTIFICATIONS=mongodb+srv://<user>:<password>@<cluster>/feiras_notifications?retryWrites=true&w=majority
MONGO_URL_NOTES=mongodb+srv://<user>:<password>@<cluster>/feiras_notes?retryWrites=true&w=majority
```

> **Important:** Replace the example values with your actual MongoDB credentials and cluster information. URL-encode special characters in MongoDB usernames and passwords. Never commit your `.env` file or expose database credentials and JWT secrets.

Each service uses its own MongoDB database. Make sure the database names in the connection strings match the databases configured for your environment.

### 2. 🐳 Start the Backend Services

Run the following commands from the `backend/` directory:

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

The first command validates the Docker Compose configuration. The second builds and starts the services in detached mode. The last command displays the status of the containers.

To check whether the API Gateway is running:

```bash
curl http://localhost:8080/healthz
```

The expected response is:

```text
ok
```

To follow the logs of the main backend services:

```bash
docker compose logs -f api-gateway users-service markets-service
```

To follow the logs of the remaining services:

```bash
docker compose logs -f favorites-service ratings-service notifications-service notes-service
```

To stop the backend:

```bash
docker compose down
```

> **Note:** The Nginx configuration expects the `routing-service` to be available on port `3006`. Make sure that this service is included in your Docker Compose configuration and connected to the same Docker network as the API Gateway. Otherwise, requests to `/api/routes` may return a `502 Bad Gateway` error.

<a id="frontend-setup"></a>
## 📲 Frontend Setup

### 1. 🔧 Configure the App Environment

Create a `.env` file inside the `frontend/` directory:

```dotenv
EXPO_PUBLIC_HOST=192.168.1.100
EXPO_PUBLIC_STADIA_MAPS_API_KEY=your_stadia_maps_api_key
```

Replace the example host with the address appropriate for the device running the application:

| Environment | `EXPO_PUBLIC_HOST` |
|---|---|
| Android emulator | `10.0.2.2` |
| Physical Android / iOS device | Your computer's LAN IPv4 address |
| Web browser on the same computer | `localhost` |

For a physical device, make sure that the phone and computer are connected to the same network and that the computer firewall allows connections to port `8080`.

### 2. 📦 Install JavaScript Dependencies

Open a terminal in the frontend folder:

```bash
cd frontend
npm ci
```

`npm ci` installs the dependencies recorded in `package-lock.json`.

### 3. 🗺️ Configure MapLibre

MapLibre React Native uses native code and cannot run inside the standard Expo Go application. A custom Expo development build is required.

Make sure the MapLibre config plugin is included in the existing `plugins` array in `frontend/app.json` or `app.config.ts`:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "@maplibre/maplibre-react-native"
    ]
  }
}
```

Merge the MapLibre plugin into the project's existing plugin list. Do not remove other plugins or configuration already present in the project.

### 4. 🏗️ Build the Native Development App

If MapLibre or another native dependency has been installed, rebuild the native application:

```bash
npx expo install @maplibre/maplibre-react-native
npx expo install expo-dev-client
npx expo prebuild
npx expo run:android
```

After the development build has been installed, start the Metro server:

```bash
npx expo start --dev-client
```

For iOS development on macOS:

```bash
npx expo run:ios
npx expo start --dev-client
```

> **Note:** The native application must be rebuilt after adding a native dependency or changing native app configuration. Ordinary JavaScript and TypeScript changes can be loaded through the development server without rebuilding the native binary each time.

<a id="troubleshooting"></a>
## 🛠️ Troubleshooting

### 🔌 Backend Requests Return `502 Bad Gateway`

A `502 Bad Gateway` response usually means that Nginx cannot connect to the requested backend service.

Check the container status:

```bash
docker compose ps -a
```

Inspect the API Gateway and affected service logs:

```bash
docker compose logs --tail=100 api-gateway
docker compose logs --tail=150 notes-service
```

Make sure the affected service is running, listening on the expected internal port and connected to the same Docker network as the API Gateway.

### 🗺️ MapLibre Error: `MLRNCameraModule` Not Found

This usually means the installed application binary does not contain the MapLibre native module.

Make sure you are using a custom Expo development build rather than Expo Go. Rebuild the app after installing MapLibre:

```bash
npx expo prebuild
npx expo run:android
npx expo start --dev-client
```

### 📱 API Requests Fail on a Physical Device

Do not use `localhost` as the backend host from a physical phone. It points to the phone itself rather than your computer.

Set `EXPO_PUBLIC_HOST` to your computer's LAN IPv4 address, make sure both devices are on the same network and allow port `8080` through your computer's firewall.

### 🌍 Map Does Not Load

Check that `EXPO_PUBLIC_STADIA_MAPS_API_KEY` is present in `frontend/.env`, that the map style URL is configured correctly and that the device has internet access.

### 🚏 No Public-Transport Itinerary Is Returned

Check that MOTIS is running and that the routing service is pointing to the correct MOTIS host and port.

Also verify that the GTFS feeds are included in the MOTIS configuration and cover the date of the requested journey. A feed that is present in the project folder is not necessarily imported or available to MOTIS.

<a id="useful-documentation"></a>
## 📚 Useful Documentation

### 📱 Expo and React Native

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

### 🗺️ Maps and Routing

- [MapLibre React Native – Expo Setup](https://maplibre.org/maplibre-react-native/docs/setup/expo/)
- [MapLibre React Native – Getting Started](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/)
- [Stadia Maps – Documentation](https://docs.stadiamaps.com/)
- [Stadia Maps – Routing APIs](https://docs.stadiamaps.com/routing/)
- [MOTIS – GitHub Repository](https://github.com/motis-project/motis)
- [MOTIS – Setup and Advanced Configuration](https://github.com/motis-project/motis/blob/master/docs/setup.md)
- [OpenTripPlanner](https://www.opentripplanner.org/) (optional alternative routing engine)

### 🖥️ Backend and Infrastructure

- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Express Documentation](https://expressjs.com/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html)

### 📅 External Integrations

- [Google Calendar API Documentation](https://developers.google.com/workspace/calendar/api/guides/overview)
- [GTFS Schedule Reference](https://gtfs.org/documentation/schedule/reference/)

<a id="team"></a>
## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/nuno-nogueira">
        <img src="https://github.com/nuno-nogueira.png" width="100px" alt="Nuno Nogueira" />
        <br />
        <sub><b>Nuno Nogueira</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/AnaCatarina7">
        <img src="https://github.com/AnaCatarina7.png" width="100px" alt="Ana Catarina" />
        <br />
        <sub><b>Ana Catarina</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/kenLukau31">
        <img src="https://github.com/kenLukau31.png" width="100px" alt="Ken Lukau" />
        <br />
        <sub><b>Ken Lukau</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/sandrafmoreira">
        <img src="https://github.com/sandrafmoreira.png" width="100px" alt="Sandra Moreira" />
        <br />
        <sub><b>Sandra Moreira</b></sub>
      </a>
    </td>
  </tr>
</table>
