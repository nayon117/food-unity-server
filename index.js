const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
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
    // await client.connect();

    // collection
    const foodCollection = client.db("food-unity").collection("foods");
    const requestCollection = client.db("food-unity").collection("requests");

    // show first six data using limit
    app.get("/first-six", async (req, res) => {
      try {
        const result = await foodCollection.find().limit(6).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // get all foods data
    app.get("/foods", async (req, res) => {
      try {
        const sort = req.query.sort === "desc" ? -1 : 1;

        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }

        const result = await foodCollection
          .find(query)
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

    // single food specific data
    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await foodCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // get all requests data
    app.get("/requests", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await requestCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // get requst specific data 
    app.get("/manage/:foodId", async (req, res) => {
      try {
        const id = req.params.foodId;
        console.log(id);
        const result = await requestCollection.find({ foodId: id }).toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // post method for foodCollection
    app.post("/foods", async (req, res) => {
      try {
        const foodData = req.body;
        const result = await foodCollection.insertOne(foodData);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // post method for request collection
    app.post("/requests", async (req, res) => {
      const requestData = req.body;
      const result = await requestCollection.insertOne(requestData);
      res.send(result);
    });

    // update method

    //  find id for update
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateData = req.body;

      const data = {
        $set: {
          foodName: updateData.foodName,
          foodImage: updateData.foodImage,
          foodQuantity: updateData.foodQuantity,
          pickupLocation: updateData.pickupLocation,
          expiredDateTime: updateData.expiredDateTime,
          foodStatus: updateData.foodStatus,
        },
      };

      const result = await foodCollection.updateOne(filter, data, options);
      res.send(result);
    });

    // delete method
    app.delete("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await requestCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // delete method for foods
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const result = await foodCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
