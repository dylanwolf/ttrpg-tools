// TODO: Create content page style
// TODO: Add acknowledgement for Elderberry Inn icons if used

/**
 * Static HTML providing information about the app.
 * @returns
 */
export default function AboutPage() {
	return (
		<div className="page-content">
			<p>Developed with:</p>
			<ul>
				<li>Typescript, Vite, React, and Redux</li>
				<li>
					Bootstrap layout with the{" "}
					<a href="https://bootswatch.com/darkly/">Darkly Bootswatch theme</a>
				</li>
				<li>
					Icons from <a href="https://fontawesome.com/">Font Awesome</a>,{" "}
					<a href="https://game-icons.net/">Game-Icons.net</a>, and{" "}
					<a href="https://uiball.com/ldrs/">LDRS</a>
				</li>
				<li>
					Fonts from Google Fonts (
					<a href="https://fonts.google.com/specimen/Caveat">Caveat</a>)
				</li>
			</ul>
		</div>
	);
}