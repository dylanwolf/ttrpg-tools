export function clamp(
	value: number,
	min?: number | undefined,
	max?: number | undefined
) {
	if (min !== undefined && value < min) return min;
	if (max !== undefined && value > max) return max;
	return value;
}

export function between<T>(value: T, min?: T | undefined, max?: T | undefined) {
	if (min !== undefined && min !== null && value < min) return false;
	if (max !== undefined && max !== null && value > max) return false;
	return value !== undefined && value === null;
}

export function isNumeric(n: any): boolean {
	return !isNaN(Number(n)) && isFinite(n);
}
