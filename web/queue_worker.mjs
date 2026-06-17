import { setInterval } from 'timers';

const POLL_INTERVAL = 30000; // 30 seconds
const ENDPOINT = 'http://localhost:3000/api/process-queue';

console.log(`[Queue Worker] Starting background worker...`);
console.log(`[Queue Worker] Polling ${ENDPOINT} every ${POLL_INTERVAL / 1000} seconds.`);

setInterval(async () => {
  try {
    const res = await fetch(ENDPOINT);
    if (res.ok) {
      const data = await res.json();
      if (data.processed > 0) {
        console.log(`[${new Date().toLocaleTimeString()}] [Queue Worker] Successfully processed ${data.processed} item(s).`);
      } else if (data.error) {
        console.error(`[${new Date().toLocaleTimeString()}] [Queue Worker] Error processing item: ${data.error}`);
      }
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] [Queue Worker] HTTP Error: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    // Ignore fetch errors (e.g. if Next.js server is down)
    console.error(`[${new Date().toLocaleTimeString()}] [Queue Worker] Connection failed. Is the Next.js server running?`);
  }
}, POLL_INTERVAL);
