import { TabSavedState as TabSavedState } from "../helpers/JsonFileUtils";

export enum UtilityKey {
	CHARACTER_BUILDER = "character-builder",
	ENCOUNTER_BUILDER_5E = "encounter-builder-5e",
}

export function createTabSavedState(
	utilityKey: UtilityKey,
	state: any
): TabSavedState | undefined {
	switch (utilityKey) {
		case UtilityKey.CHARACTER_BUILDER:
			if (state?.Character && (state?.BuilderKey || state?.Model?.BuilderKey)) {
				return {
					Utility: utilityKey,
					Data: {
						BuilderKey: state?.BuilderKey || state?.Model?.BuilderKey,
						CharacterData: state?.Character,
					},
				};
			}
			return undefined;
		case UtilityKey.ENCOUNTER_BUILDER_5E:
			if (state)
				return {
					Utility: utilityKey,
					Data: state,
				};
			return undefined;
		default:
			throw {
				Title: "Utility not recognized",
				Message: `Could not create saved session for the utility "${utilityKey}".`,
			};
	}
}

export function createTabSessionForUtility(
	utilityKey: UtilityKey,
	args?: any
): Promise<void> {
	switch (utilityKey) {
		case UtilityKey.CHARACTER_BUILDER:
			return import("./character-builder/BuilderTabSessions").then((mod) =>
				mod.createCharacterBuilderSession(args.BuilderKey, args.CharacterData)
			);
		case UtilityKey.ENCOUNTER_BUILDER_5E:
			return import("./encounter-builder-5e/Sessions").then((mod) =>
				mod.createEncounterBuilder5eSession(args)
			);
		default:
			throw {
				Title: "Utility not recognized",
				Message: `Could not create a session for the utility "${utilityKey}".`,
			};
	}
}
