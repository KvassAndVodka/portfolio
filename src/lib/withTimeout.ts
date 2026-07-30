export class OperationTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation exceeded its ${timeoutMs}ms time budget.`);
    this.name = "OperationTimeoutError";
  }
}

export async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new OperationTimeoutError(timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
