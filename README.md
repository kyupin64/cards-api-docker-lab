# Collectible Card Game API

To run this app using Docker, navigate to the directory of this app in your command line.
1. Initialize node by running

    npm init -y
2. Add a secret to the .env.template file and rename the file to .env
3. To create the image, run

    docker build -t cardsapp:latest .
4. To create the container, run

    docker run -P --name cardsapp-container cardsapp:latest
5. And to view it in the browser, go to Docker Desktop, navigate to the newly created container, and click on the link under "Port(s)" which will open the port in your browser


This server app was built using <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a> with <a href="https://expressjs.org/" target="_blank" rel="noopener noreferrer">Express.js</a>.

To run this app, you must have Node.js installed. You also need to install the REST Client extension in VSCode to send requests to the server. The server listens on port 3000 by default.

After downloading the folder, initialize it by running "npm init -y" in the command line and install express, express-jwt, jsonwebtoken, and dotenv in the app folder. Change the .env.template file to .env and add a string for the secret. Start the app by running "node app." There is no front end for this project, so to send requests using the REST Client extension, go to the api.http file and above each request will be a "Send Request" button. First, get a token:

    POST http://localhost:3000/getToken
        Can either use the admin or regular user info in the body of the request
            eg. {
                    "username": "admin",
                    "password": "password"
                }
        Note that the admin user can access each endpoint but the regular user can only access the /cards endpoint to show a list of all cards and filter them

Copy that token below each request on the line "Authorization: Bearer {insert your token here}." You can then send all the other requests:

    GET http://localhost:3000/cards
        Returns a list of all cards
        Can add optional filter parameters in url
            eg. GET http://localhost:3000/cards?set=Base%20Set&type=Spell&rarity=Common

    POST http://localhost:3000/cards/create
        Creates a new card using information sent in the request body
            eg. {
                    "id": 126,
                    "name": "Bear Arms",
                    "set": "Expansion Pack",
                    "cardNumber": 26,
                    "type": "Artifact",
                    "rarity": "Common",
                    "cost": 2
                }
        Note that the id must be unique when creating a new card

    PUT http://localhost:3000/cards/:id
        Updates an existing card using information sent in the request body
            eg. {
                    "id": 10,
                    "cost": 3,
                    "rarity": "Uncommon"
                }
        Note that the id in the url parameter must be the id of an existing card and the id in the request body (optional) must either match the existing card's id or be unique

    DELETE http://localhost:3000/cards/:id
        Deletes an existing card
        Note that the id in the url parameter must be the id of an existing card

In the api.http file, I added comments to easily test different scenarios for each request, including ones that cause errors. If anything is entered incorrectly or there's any kind of error, an appropriate error message will be returned. I used some middleware functions to make the app work, such as the checkAdmin function which checks if the user is an admin before allowing them to access certain endpoints.