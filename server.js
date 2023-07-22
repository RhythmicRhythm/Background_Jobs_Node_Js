const Queue = require("bull");
const Redis = require("ioredis");

// now 2nd branch
const redisConfig = {
  port: 6379, 
  host: "localhost", 
  
};

const redisClient = new Redis(redisConfig);
const queue = new Queue("countdown", { redis: redisClient });

function countDown() {
  let count = 10;
  const interval = setInterval(() => {
    console.log(count);
    count--;
    if (count === 0) {
      clearInterval(interval);
      console.log("Countdown completed!");
    }
  }, 10000); 
}

queue.process(async (job) => {
  console.log("Countdown job started");
  countDown();
});

queue.add({});

console.log("Enqueued countdown job");
