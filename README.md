# Back-End Repo for Node/React Practicum

This will be the API for the front-end React app part of your practicum project.

These instructions are for the **front-end team** so they can setup their local development environment to run
both the back-end server and their front-end app. You can go through these steps during your first group meeting
in case you need assistance from your mentors.

> The back-end server will be running on port 8000. The front-end app will be running on port 3000. You will need to run both the back-end server and the front-end app at the same time to test your app.

### Setting up local development environment

1. Create a folder to contain both the front-end and back-end repos
2. Clone this repository to that folder
3. Run `npm install` to install dependencies
4. Pull the latest version of the `main` branch (when needed)
5. Run `npm run dev` to start the development server
6. Open http://localhost:8000/api/v1/ with your browser to test.
7. Your back-end server is now running. You can now run the front-end app.

#### Running the back-end server in Visual Studio Code

Note: In the below example, the group's front-end repository was named `bb-practicum-team1-front` and the back-end repository was named `bb-practicum-team-1-back`. Your repository will have a different name, but the rest should look the same.
![vsc running](images/back-end-running-vsc.png)

#### Testing the back-end server API in the browser

![browser server](images/back-end-running-browser.png)

> Update the .node-version file to match the version of Node.js the **team** is using. This is used by Render.com to [deploy the app](https://render.com/docs/node-version).

# Steps to run/test the Backend on local:

1. git pull (to get the latest)
2. npm install OR npm update (to install 11 new dependencies)
3. add env variables (MONGO_URI, JWT_SECRET and JWT_LIFETIME) to .env file
   - move .env to the root folder(it didn't work when inside /src folder)
   - env variables values are on our slack channels Canvas
4. npm run dev (run backend code)
5. Register and login endpoints can be tested using Postman:
   5.1. Register endpoint: http://localhost:8000/api/v1/auth/register
   -> Method: POST
   -> Body: { "name": "team8", "password": "secret", "email": "team8@test.com" }
   -> email should be unique
   -> Expected response: Object with name and token
   5.2. Login endpoint: http://localhost:8000/api/v1/auth/login
   -> Method: POST
   -> Body: { "email": "team8@test.com", "password": "secret" }
   -> Expected response: Object with name and token
