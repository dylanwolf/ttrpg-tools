export function setBrowserTitle(subtitle: string) {
	var title = document.getElementsByTagName("title")[0];
	if (title) {
		title.innerText = `ttrpgbuilder.dylanwolf.com${
			subtitle ? " - " : ""
		}${subtitle}`;
	}
}
