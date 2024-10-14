import { CharacterBuilderState } from "./BuilderTabSessions";
import { createTabSavedState, UtilityKey } from "..";
import { downloadAsJson } from "../../helpers/JsonFileUtils";

export function downloadCharacterBuilderJson(
	state: CharacterBuilderState<any, any> | undefined
) {
	if (state) {
		downloadAsJson(
			`${state.Character.Title}-${state.Model.BuilderKey}.json`,
			createTabSavedState(UtilityKey.CHARACTER_BUILDER, state)
		);
	}
}
