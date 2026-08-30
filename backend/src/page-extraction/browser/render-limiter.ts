import { MAX_CONCURRENT_PAGE_RENDERS } from "../constants.js";

// Caps how many render requests can queue up behind the concurrency limit,
// so a burst of requests can't grow this in-memory queue without bound.
const MAX_RENDER_QUEUE_LENGTH = Number(process.env.MAX_RENDER_QUEUE_LENGTH) || 50;

let activeRenders = 0;
const waitingQueue: Array<() => void> = [];

export async function runWithRenderSlot<T>(callback: () => Promise<T>) {
  await acquireRenderSlot();

  try {
    return await callback();
  } finally {
    releaseRenderSlot();
  }
}

async function acquireRenderSlot() {
  if (activeRenders < MAX_CONCURRENT_PAGE_RENDERS) {
    activeRenders += 1;
    return;
  }

  if (waitingQueue.length >= MAX_RENDER_QUEUE_LENGTH) {
    throw new Error("Render queue is full, please retry later");
  }

  await new Promise<void>((resolve) => {
    waitingQueue.push(resolve);
  });

  activeRenders += 1;
}

function releaseRenderSlot() {
  activeRenders = Math.max(0, activeRenders - 1);

  const nextWaitingRender = waitingQueue.shift();

  if (nextWaitingRender) {
    nextWaitingRender();
  }
}