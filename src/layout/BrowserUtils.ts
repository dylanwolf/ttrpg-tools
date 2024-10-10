export const DOMAIN_NAME = "ttrpgtools.dylanwolf.com";

export function setBrowserTitle(subtitle: string) {
	var title = document.getElementsByTagName("title")[0];
	if (title) {
		title.innerText = `${DOMAIN_NAME}${subtitle ? " - " : ""}${subtitle}`;
	}
}
