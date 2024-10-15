/**
 * Class to track select items being fed to a dropdown or other HTML list.
 */
export interface SelectItem {
	Value: string;
	Text: string;
}

/**
 * Returns true if the given value is in the list; otherwise, returns the first value in the list.
 * @param currentValue
 * @param lst
 * @returns
 */
export function valueIfInList(currentValue: string | undefined, lst: string[]) {
	return lst.any((x) => x === currentValue) ? currentValue : lst[0];
}

/**
 * Returns a copy of oldState with the key/values of updates merged into it. Other properties will be left alone.
 * @param oldState
 * @param updates
 * @returns
 */
export function mergeStateWithUpdates<TState>(oldState: TState, updates?: any) {
	var newState = structuredClone(oldState);

	if (updates) {
		Object.keys(updates).forEach((key) => {
			(newState as any)[key] = updates[key];
		});
	}

	return newState;
}
