// Simulates a blockchain transaction with delay + optional callback
export async function mockTx(message: string, cb?: () => void | Promise<void>) {
  console.log("⛓ Sending tx...");

  await new Promise((res) => setTimeout(res, 1200));

  if (cb) {
    await cb();
  }

  console.log(`✅ ${message}`);
}

// Format timestamp → readable date
export function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calculate days remaining before expiry
export function daysUntilExpiry(lastCheckin: number, interval: number) {
  const now = Math.floor(Date.now() / 1000);
  const expiry = lastCheckin + interval;

  const secondsLeft = expiry - now;

  return Math.max(0, Math.floor(secondsLeft / 86400));
}
