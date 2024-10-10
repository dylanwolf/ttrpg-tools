import { downloadAsLoadableJson } from "../../helpers/JsonFileUtils";
import { CharacterBuilderState } from "./BuilderTabSessions";
import { UtilityKey } from "..";

export function downloadCharacterBuilderJson(
	state: CharacterBuilderState<any, any> | undefined
) {
	if (state) {
		downloadAsLoadableJson(
			UtilityKey.CHARACTER_BUILDER,
			{
				BuilderKey: state.Model.BuilderKey,
				CharacterData: state.Character,
			},
			`${state.Character.Title}-${state.Model.BuilderKey}.json`
		);
	}
}
