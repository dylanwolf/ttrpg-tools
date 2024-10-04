export interface SelectItem {
	Value: string;
	Text: string;
}

export function isNumeric(n: any): boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export function valueIfInList(currentValue: string | undefined, lst: string[]) {
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
