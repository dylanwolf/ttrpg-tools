export function getTextFieldValueFrom(
	evt: React.ChangeEvent<any>
): string | undefined {
	return evt.currentTarget.value?.trim() || undefined;
}

export function getNumericFieldValueFrom(
	evt: React.ChangeEvent<any>
): number | undefined {
	var strValue = getTextFieldValueFrom(evt);
	if (strValue === undefined || strValue === "") return undefined;
	return Number(strValue);
}

export function toNumericFieldValue(
	value: number | undefined | null
): number | string {
	return value === undefined || value === null ? "" : value;
}