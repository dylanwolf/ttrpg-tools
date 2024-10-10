export enum UtilityKey {
	CHARACTER_BUILDER = "character-builder",
	ENCOUNTER_BUILDER_5E = "encounter-builder-5e",
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
