import {
	downloadAsLoadableJson,
	JSON_UTILITY_KEYS,
} from "../helpers/JsonFileUtils";
import { CharacterBuilderState } from "../state/character-builder/BuilderTabSessions";

export function downloadCharacterBuilderJson(
	state: CharacterBuilderState<any, any> | undefined
) {
	if (state) {
		downloadAsLoadableJson(
			JSON_UTILITY_KEYS.CHARACTER_BUILDER,
			{
				BuilderKey: state.Model.BuilderKey,
				CharacterData: state.Character,
			},
			`${state.Character.Title}-${state.Model.BuilderKey}.json`
		);
	}
}
