export function removeNullValues<TValue>(dict: {
	[name: string]: TValue | null | undefined;
}) {
	var result: { [name: string]: TValue } = {};
	if (!dict) return result;

	Object.keys(dict)
		.filter((key) => dict[key] !== undefined && dict[key] !== null)
		.forEach((key) => {
			result[key] = dict[key] as TValue;
		});

	return result;
}

export function resetNullValues<TValue>(
	dict: { [name: string]: TValue | null | undefined },
	defaultValue: TValue
) {
	var result: { [name: string]: TValue } = {};

	Object.keys(dict).forEach((key) => {
		result[key] =
			dict[key] !== undefined && dict[key] !== null ? dict[key] : defaultValue;
	});

	return result;
}
