export function isValidBuilderKey(txt: string) {
	return !txt.match(/[^a-z0-9\-]/);
}
