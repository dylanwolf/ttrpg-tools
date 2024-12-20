import { faGlobe } from "@fortawesome/free-solid-svg-icons/faGlobe";
import { faLink } from "@fortawesome/free-solid-svg-icons/faLink";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope";
import { faBluesky } from "@fortawesome/free-brands-svg-icons/faBluesky";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VERSION } from "../version";
import { AnalyticsTracker } from "./AnalyticsTracker";

/**
 * Renders the page footer for the app.
 * @returns
 */
export function SiteFooter() {
	return (
		<>
			<footer className="d-flex flex-wrap justify-content-between align-items-center py-4 my-4 mx-3 border-top">
				<div className="col-md-4 d-flex align-items-center">
					<span>
						Developed by <a href="https://www.dylanwolf.com/">Dylan Wolf</a> -
						Version {VERSION}
					</span>
				</div>
				<div className="nav col-md4 justify-content-end list-unstyled d-flex">
					<li className="ms-3">
						<a href="https://www.dylanwolf.com" target="_blank">
							<FontAwesomeIcon icon={faGlobe} />
						</a>
					</li>
					<li className="ms-3">
						<a href="mailto:dylan.wolf@gmail.com" target="_blank">
							<FontAwesomeIcon icon={faEnvelope} />
						</a>
					</li>
					<li className="ms-3">
						<a href="https://bsky.app/profile/dylanwolf.com" target="_blank">
							<FontAwesomeIcon icon={faBluesky} />
						</a>
					</li>
					<li className="ms-3">
						<a href="https://links.dylanwolf.com" target="_blank">
							<FontAwesomeIcon icon={faLink} />
						</a>
					</li>
				</div>
			</footer>
			{import.meta.env.PROD ? <AnalyticsTracker /> : <></>}
		</>
	);
}
