import { MAX_CONCURRENT_PAGE_RENDERS } from "../constants.js";

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