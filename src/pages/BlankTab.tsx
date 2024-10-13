import { createCharacterBuilderSession } from "../utilities/character-builder/BuilderTabSessions";

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
					{" "}
					<a
						href="#"
						onClick={(e) => onClickCreateCharacterBuilder("ryuutama", e)}
					>
						Create a Ryuutama PC
					</a>
				</li>
			</ul>
		</div>
	);
}
