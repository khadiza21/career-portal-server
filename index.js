const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Job is falling from the sky");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@career-portal.zsuwx.mongodb.net/?retryWrites=true&w=majority&appName=career-portal`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const jobsCollection = client.db("careerPortal").collection("jobs");
  const jobApplicationCollection = client
    .db("careerPortal")
    .collection("job-applications");

  app.get("/jobs", async (req, res) => {
    const jobs = await jobsCollection.find().toArray();
    res.json(jobs);
  });

  app.get("/jobs/:id", async (req, res) => {
    const id = req.params.id;
    const jobs = await jobsCollection.findOne({ _id: new ObjectId(id) });
    res.json(jobs);
  });

  app.post("/job-applications", async (req, res) => {
    const application = req.body;
    const result = await jobApplicationCollection.insertOne(application);
    res.send(result);
  });

  try {
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Job is waiting at: ${port}`);
});
