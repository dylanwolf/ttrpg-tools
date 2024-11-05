/**
 * Returns a promise that resolves when the timeout completes.
 * @param ms
 * @returns
 */
export function setTimeoutAsync(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
