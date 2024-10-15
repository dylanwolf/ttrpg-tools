/**
 * Returns the value of the field that triggered the change event. If the value is blank, returns undefined.
 * @param evt
 * @returns
 */
export function getTextFieldValueFrom(
	evt: React.ChangeEvent<any>
): string | undefined {
	var value = evt.currentTarget.value;
	return value.trim()! ? value : undefined;
}

/**
 * Returns the value of the field that triggered the change event as a number. If the value is blank or not a number, returns undefined.
 * @param evt
 * @returns
 */
export function getNumericFieldValueFrom(
	evt: React.ChangeEvent<any>
): number | undefined {
	var strValue = getTextFieldValueFrom(evt);
	if (strValue === undefined || strValue === "") return undefined;
	return Number(strValue);
}

/**
 * Can be assigned to an input's onPaste event to prevent pasting non-numeric values.
 * @param evt
 * @returns
 */
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

/**
 * Can be assigned to an input's onKeyDown event to prevent typing non-numeric values.
 * @param evt
 * @returns
 */
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

/**
 * Retruns the value as a number, or an empty string if undefined.
 * @param value
 * @returns
 */
export function toNumericFieldValue(
	value: number | undefined | null
): number | string {
	return value !== undefined && value !== null ? value : "";
}
