export function configToNumber(txt: string | undefined, defaultValue: number) {
	if (txt === undefined) return defaultValue;

	var numberValue = parseInt(txt);
	return isNaN(numberValue) ? defaultValue : numberValue;
}
