export function valueIfInList<TItem>(
	currentValue: string,
	getValue: (itm: TItem) => string,
	lst: TItem[]
) {
	return lst.any((x) => getValue(x) === currentValue)
		? currentValue
		: lst[0]
		? getValue(lst[0])
		: undefined;
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
