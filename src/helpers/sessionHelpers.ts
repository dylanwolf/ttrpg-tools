import { v4 as uuid } from "uuid";

/**
 * Returns a random UUID.
 * @returns
 */
export function getNewSessionId() {
	return uuid();
}
