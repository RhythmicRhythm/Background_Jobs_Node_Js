const Queue = require("bull");
const Redis = require("ioredis");

const redisConfig = {
  port: 6379, // Default Redis port
  host: "localhost", // Default Redis host (if Redis is running on a different host, update this)
  // Add any other Redis configuration options here if needed
};

const redisClient = new Redis(redisConfig);
const queue = new Queue("squares", { redis: redisClient });

// Simulate a long-running task to calculate the square of a number
function calculateSquare(number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(number * number);
    }, 1000); // Simulate 1-second processing time
  });
}

// Define the worker to process the tasks
queue.process(async (job) => {
  const { number } = job.data;
  console.log(`Processing square for ${number}...`);
  const result = await calculateSquare(number);

  // Store the result in Redis for caching
  await job.updateProgress(100); // Update progress to 100% to indicate completion
  await job.moveToCompleted(result); // Move the job to the completed state
  await job.remove(); // Remove the job from the queue after completion

  console.log(`Square for ${number} is ${result}`);
});

// Enqueue multiple tasks
async function enqueueTasks() {
  const numbers = [2, 4, 6, 8, 10];
  for (const number of numbers) {
    const job = await queue.add({ number }, { jobId: `square_${number}` });
    console.log(`Enqueued square calculation for ${number}, job ID: ${job.id}`);
  }
}

enqueueTasks();
