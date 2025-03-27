const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());
app.use(cookieParser());

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

  // app.post("/jwt", async (req, res) => {
  //   const user = req.body;
  //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
  //     expiresIn: "5h",
  //   });

  //   res
  //     .cookie("token", token, {
  //       httpOnly: true,
  //       secure: false, //for localhost
  //     })
  //     .send({ success: true });
  // });

  app.post("/jwt", async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "5h",
    });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, //for localhost
      })
      .send({ success: true });
  });

  app.get("/jobs", async (req, res) => {
    const email = req.query.email;
    let query = {};
    if (email) {
      query = { hr_email: email };
    }
    const jobs = await jobsCollection.find(query).toArray();
    res.send(jobs);
  });

  app.get("/jobs/:id", async (req, res) => {
    const id = req.params.id;
    const jobs = await jobsCollection.findOne({ _id: new ObjectId(id) });
    res.send(jobs);
  });

  app.post("/jobs", async (req, res) => {
    const newJob = req.body;
    const result = await jobsCollection.insertOne(newJob);
    res.send(result);
  });

  app.get("/job-applications", async (req, res) => {
    const email = req.query.email;
    const query = { applicant_email: email };
    const result = await jobApplicationCollection.find(query).toArray();

    for (const application of result) {
      const job = await jobsCollection.findOne({
        _id: new ObjectId(application.job_id),
      });
      if (job) {
        application.title = job.job_title;
        application.location = job.location;
        application.company = job.company_name;
        application.company_logo = job.logo;
      }
    }
    res.send(result);
  });

  app.get("/job-applications/jobs/:job_id", async (req, res) => {
    const jobId = req.params.job_id;
    const result = await jobApplicationCollection
      .find({ job_id: jobId })
      .toArray();
    res.send(result);
  });

  app.post("/job-applications", async (req, res) => {
    const application = req.body;
    const result = await jobApplicationCollection.insertOne(application);

    const id = application.job_id;
    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    let newCount = 0;

    if (job.applicationCount) {
      newCount = job.applicationCount + 1;
    } else {
      newCount = 1;
    }

    //  now update the job info
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        applicationCount: newCount,
      },
    };
    const updateResult = await jobsCollection.updateOne(filter, updatedDoc);

    res.send({ insertResult: result, updateResult: updateResult });
  });

  app.patch("/job-applications/:id", async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        status: data.status,
      },
    };
    const result = await jobApplicationCollection.updateOne(filter, updatedDoc);
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
