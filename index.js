const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(express());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3hdabzk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db("food-unity").collection("foods");

    app.get("/first-six", async (req, res) => {
      try {
        const result = await foodCollection.find().limit(6).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/foods", async (req, res) => {
      try {
        const sort = req.query.sort === "desc" ? -1 : 1;
        const result = await foodCollection
          .find()
          .sort({ expiredDateTime: sort === 1 ? 1 : -1 })
          .toArray();
        // Parse the date strings to Date objects
        const sortedData = result.sort((a, b) => {
          const dateA = new Date(a.expiredDateTime);
          const dateB = new Date(b.expiredDateTime);
          return sort * (dateA - dateB);
        });
        res.send(sortedData);
      } catch (error) {
        console.log(error);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("food unity server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
