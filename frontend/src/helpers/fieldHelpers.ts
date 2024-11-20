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

export function getNumericValue(strValue: string | undefined | null) {
	if (strValue === undefined || strValue === "") return undefined;
	return Number(strValue);
}

/**
 * Returns the value of the field that triggered the change event as a number. If the value is blank or not a number, returns undefined.
 * @param evt
 * @returns
 */
export function getNumericFieldValueFrom(
	evt: React.ChangeEvent<any>
): number | undefined {
	return getNumericValue(getTextFieldValueFrom(evt));
}

/**
 * Can be assigned to an input's onPaste event to prevent pasting non-numeric values.
 * @param evt
 * @returns
 */
export function ensureIntegerPaste(
	evt: React.ClipboardEvent<HTMLInputElement>,
	allowNegatives?: boolean | undefined
) {
	var value = evt.clipboardData.getData("text");
	if (value && value.match(allowNegatives ? /[^-0-9]/ : /[^0-9]/)) {
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
export function ensureIntegerEntry(
	evt: React.KeyboardEvent<HTMLInputElement>,
	allowNegatives?: boolean | undefined
) {
	if (
		evt.key.length === 1 &&
		!evt.altKey &&
		!evt.ctrlKey &&
		evt.key.match(allowNegatives ? /[^-0-9]/ : /[^0-9]/)
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
