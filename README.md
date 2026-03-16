RoomSync is an AI-powered roommate discovery platform that helps students find compatible roommates through lifestyle-based matching and verified profiles.

What makes the idea novel?

RoomSync doesn’t just list roommates; it ranks and explains who you’ll actually get along with. By combining student-only verification with AI-based lifestyle matching, it turns a messy search into a guided decision. Instead of scrolling, users get clarity.

Why does this solution fit the problem?

Most roommate problems don’t start after move-in; they start with the wrong match. RoomSync prevents that by aligning people on habits, expectations, and boundaries before they ever sign a lease. Fewer surprises, fewer conflicts, better living.

#### Running the Server (Backend)

Open a terminal

Navigate to the server folder:

cd server

Install dependencies:

npm install

Start the development server:

npm run dev

The backend should now be running (usually on http://localhost:5001).

#### Running the Client (Frontend)

Open a new terminal window and:

Navigate to the client folder:

cd client

Install dependencies:

npm install

Start the React app:

npm start

The frontend should now be running on:

http://localhost:3000


#### Running the MongoDB (Database)

First install MongoDB.
If you're on Mac, run:
brew tap mongodb/brew && brew install mongodb-community
then start it with
brew services start mongodb-community

If you're on Windows, just download the installer from mongodb.com and install it as a service.

Once installed, run mongosh in terminal to confirm MongoDB is running.

Next, pull the branch:
git checkout feature/db-setup
git pull

Then go to the server folder and install dependencies:
cd server
npm install

Now set up the environment file:
cp .env.example .env

The .env.example already has the local MongoDB URI:
MONGO_URI=mongodb://localhost:27017/roomsync
so you don’t need to change anything for local development.

Next seed the database (this adds 3 sample listings):
npm run seed

You should see messages like:
Connected to MongoDB
Cleared existing listings
Seeded 3 listings successfully
Done

Finally start the server:
npm run dev