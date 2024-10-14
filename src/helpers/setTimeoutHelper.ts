export function setTimeoutAsync(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
