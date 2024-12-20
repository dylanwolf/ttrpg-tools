import { createTabSessionForUtility, UtilityKey } from "../utilities";
import { createCharacterBuilderSession } from "../utilities/character-builder/BuilderTabSessions";

/**
 * Renders static content when no tab is selected.
 * @returns
 */
export default function BlankTab() {
	function onClickCreateCharacterBuilder(builderKey: string, evt: any) {
		createCharacterBuilderSession(builderKey);
		evt.preventDefault();
		return false;
	}

	return (
		<div className="m-4">
			<h2>Get Started</h2>
			<ul>
				<li>
					<a
						href="#"
						onClick={(e) => onClickCreateCharacterBuilder("ryuutama", e)}
					>
						Create a Ryuutama PC
					</a>
				</li>
				<li>
					<a
						href="#"
						onClick={(e) =>
							onClickCreateCharacterBuilder("ryuutama-ryuujin", e)
						}
					>
						Create a Ryuutama Ryuujin (GM character)
					</a>
				</li>
				<li>
					<a
						href="#"
						onClick={(e) =>
							createTabSessionForUtility(UtilityKey.ENCOUNTER_BUILDER_5E)
						}
					>
						Create a 5E Encounter
					</a>
				</li>
			</ul>
		</div>
	);
}
