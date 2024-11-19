// TODO: Create content page style
// TODO: Add acknowledgement for Elderberry Inn icons if used

/**
 * Static HTML providing information about the app.
 * @returns
 */
export default function AboutPage() {
	return (
		<div className="page-content">
			<h2>About ttrpgtools.dylanwolf.com</h2>

			<p>
				Public github:{" "}
				<a href="https://github.com/dylanwolf/ttrpg-tools">
					https://github.com/dylanwolf/ttrpg-tools
				</a>
			</p>

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

			<p>
				Dylan Wolf is a software developer and a hobbyist TTRPG/Unity game
				developer from east Tennessee. You can find his other work at{" "}
				<a href="https://links.dylanwolf.com">https://links.dylanwolf.com</a>.
			</p>

			<h3>Ryuutama Character Builders</h3>
			<p>
				This webtool has been approved for distribution and sale by Kotodama
				Heavy Industries, the publishers of the Ryuutama Natural Fantasy RPG in
				English. If you are interested in publishing your own Ryuutama works,
				please contact them directly through the official website to discuss
				options.
			</p>
			<p>
				You can find more about Ryuutama at{" "}
				<a href="https://www.kotohi.com">www.kotohi.com</a>.
			</p>
		</div>
	);
}
