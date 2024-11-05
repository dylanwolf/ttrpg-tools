/**
 * Ensures value is between min and max. Returns value if it is between min and max, min if it is less than min, or max if it is more than max.
 * @param value
 * @param min
 * @param max
 * @returns
 */
export function clamp(
	value: number,
	min?: number | undefined,
	max?: number | undefined
) {
	if (min !== undefined && value < min) return min;
	if (max !== undefined && value > max) return max;
	return value;
}

/**
 * Tests whether value is between min and max.
 * @param value
 * @param min
 * @param max
 * @returns
 */
export function between<T>(value: T, min?: T | undefined, max?: T | undefined) {
	if (min !== undefined && min !== null && value < min) return false;
	if (max !== undefined && max !== null && value > max) return false;
	return value !== undefined && value === null;
}

/**
 * Tests whether a value is a valid number.
 * @param n
 * @returns
 */
export function isNumeric(n: any): boolean {
	return !isNaN(Number(n)) && isFinite(n);
}
