const express = require("express");
const Queue = require("bull");
const Redis = require("ioredis");
const axios = require("axios");

const app = express();

const redisConfig = {
  port: 6379, // Default Redis port
  host: "localhost", // Default Redis host (if Redis is running on a different host, update this)
  // Add any other Redis configuration options here if needed
};

const redisClient = new Redis(redisConfig);
const queue = new Queue("get_api", { redis: redisClient });

async function makeGetRequest() {
  try {
    const options = {
      method: "GET",
      url: "https://dad-jokes.p.rapidapi.com/random/joke",
      headers: {
        "X-RapidAPI-Key": "46ca430eb6msh3416c4c0af4718bp1ab2afjsnc1b94a30f3bf", // Replace with your actual RapidAPI key
        "X-RapidAPI-Host": "dad-jokes.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    const { setup, punchline } = response.data.body[0];
    console.log(`${setup}`);

    setTimeout(() => {
      console.log(` ${punchline}`);
    }, 10000);
  } catch (error) {
    console.error("Error making the API GET request:", error.message);
  }
}

queue.process(async (job) => {
  console.log("Making API GET request...");
  await makeGetRequest();
});

// Enqueue the job every 20 seconds
setInterval(async () => {
  await queue.add({}, { repeat: { cron: "*/20 * * * * *" } });
}, 10000); // 20000 milliseconds = 20 seconds

app.get("/", (req, res) => {
  res.send(
    "Express server is running! The background job is enqueued to make a GET request to the API every 20 seconds."
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
