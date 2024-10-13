export function getTextFieldValueFrom(
	evt: React.ChangeEvent<any>
): string | undefined {
	var value = evt.currentTarget.value;
	return value.trim()! ? value : undefined;
}

export function getNumericFieldValueFrom(
	evt: React.ChangeEvent<any>
): number | undefined {
	var strValue = getTextFieldValueFrom(evt);
	if (strValue === undefined || strValue === "") return undefined;
	return Number(strValue);
}

export function ensureIntegerPaste(
	evt: React.ClipboardEvent<HTMLInputElement>
) {
	var value = evt.clipboardData.getData("text");
	if (value && value.match(/[^0-9]/)) {
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	}
}

export function ensureIntegerEntry(evt: React.KeyboardEvent<HTMLInputElement>) {
	if (
		evt.key.length === 1 &&
		!evt.altKey &&
		!evt.ctrlKey &&
		evt.key.match(/[^0-9]/)
	) {
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	}
}

export function toNumericFieldValue(
	value: number | undefined | null
): number | string {
	return value !== undefined && value !== null ? value : "";
}
