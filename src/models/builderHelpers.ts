export function valueIfInList(currentValue: string, lst: string[]) {
	return lst.any((x) => x === currentValue) ? currentValue : lst[0];
}

export function mergeStateWithUpdates<TState>(oldState: TState, updates?: any) {
	var newState = structuredClone(oldState);

	if (updates) {
		Object.keys(updates).forEach((key) => {
			(newState as any)[key] = updates[key];
		});
	}

	return newState;
}
