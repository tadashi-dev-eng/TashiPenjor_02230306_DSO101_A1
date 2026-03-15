
[Github Repository](https://github.com/tadashi-dev-eng/TashiPenjor_02230306_DSO101_A1)

# Assignment 1 report

This report is the steps taken to build and improve the frontend + backend todo app, including how the UI was enhanced and how the Docker build was fixed. Screenshots are referenced as placeholders (add your own images in the repo and replace the placeholders).

---

## 1. Implement full CRUD UI (React)

### Steps taken
1. Added frontend logic in `src/App.js` to:
   - Fetch todos (`GET /todos`)
   - Create todo (`POST /todos`)
   - Update todo text + mark done (`PUT /todos/:id`)
   - Delete todo (`DELETE /todos/:id`)
2. Updated code to match backend endpoints in `backend/server.js`.
3. Ensured API URL is read from `REACT_APP_API_URL` environment variable.

---

## 2. Implement full CRUD UI (React)

### Steps taken
1. Added frontend logic in `src/App.js` to:
   - Fetch todos (`GET /todos`)
   - Create todo (`POST /todos`)
   - Update todo text + mark done (`PUT /todos/:id`)
   - Delete todo (`DELETE /todos/:id`)
2. Updated code to match backend endpoints in `backend/server.js`.
3. Ensured API URL is read from `REACT_APP_API_URL` environment variable.

---

## 3. Docker build 

### Steps taken in frontend
1. Run `sudo docker build --build-arg REACT_APP_API_URL=... -t ... .`
2. Build failed with error:
   - `COPY nginx.conf ... : "/nginx.conf": not found`
3. Created `nginx.conf` in `frontend/` next to `Dockerfile`.
4. Rebuilt successfully.

![alt text](Assignment_1/Assets/dockerfe.png) 
### Outcome
- Docker image builds successfully and pushed to docker hub
- Frontend served by nginx.

![alt text](Assignment_1/Assets/pushedfe.png)
 
---

### Backend steps taken in backend

1. Set up Express + CORS + JSON body parsing.
2. Loaded DB config from .env and created a pg Pool.
3. Initialized DB on start: CREATE TABLE IF NOT EXISTS todos (...).
4. Implemented CRUD endpoints:

![alt text](Assignment_1/Assets/dockerbe.png)

### Outcome
- Docker image builds successfully and pushed to docker hub

![alt text](Assignment_1/Assets/pushedbe.png)

---

### Image in docker hub

![alt text](Assignment_1/Assets/hub.png)


### Deployment in render

After pushing the image in docker hub, I have deployed the image in render to go live. 

#### live backend

![alt text](Assignment_1/Assets/livebe.png)

![alt text](Assignment_1/Assets/belive.png)

#### live frontend

![alt text](Assignment_1/Assets/livefe.png)

![alt text](Assignment_1/Assets/felive.png)

---

### Automated image build and deployment

Since the render Blueprint is paid version. I used the Github Action to automate the image build and deployment. 

![alt text](Assignment_1/Assets/cicd.png)

### Updated image

![alt text](Assignment_1/Assets/image.png)

---