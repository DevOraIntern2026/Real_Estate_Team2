const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// TODO: replace these bodies with real API calls.
// Throw an Error("message from the server") and the dialog will show that message.

export async function changePasswordRequest(current: string, next: string): Promise<void> {
  await delay(400);
  if (current === next) {
    throw new Error("New password must be different from the current one.");
  }
}

export async function deleteAccountRequest(): Promise<void> {
  await delay(400);
}
