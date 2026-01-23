## Mobile App – Feiras. 
An app to discover local and traditional markets in the Porto district. It centralizes information about market dates, locations, vendors, and products, helping both consumers and market sellers access and share relevant information easily.

### Architecture & Technologies:
- Frontend: React Native + Expo
- Backend: Node.js + TypeScript
- Session Persistence: AsyncStorage
- APIs: Google Cloud (Maps and Calendar)
- Modular structure with screens, components and services.

### Key Features:
- Interactive map with market locations and routes.
- Search and filters by municipality and category.
- Favorite markets and vendors.
- Push alerts and notifications.
- Google Calendar integration for authenticated users.
- Public and private profiles for vendors.

### How to Run:

#### Backend 
cd backend  /  npm install  /  npx ts-node server.ts 

#### Frontend 
cd frontend  /  npm install  /  npx expo start **or** npx expo start --tunnel
