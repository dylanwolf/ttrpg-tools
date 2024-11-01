import { ICharacterData } from "../../BuilderFactory";
import { Artefact, Benediction, Reveil, SourceData } from "./SourceData";

export interface CharacterState extends ICharacterData {
	AdditionalSources: string[];
	Version?: string | undefined;
	Sessions?: number | undefined;
	Level: number;
	RyuujinType?: string | undefined;
	Level1Artefact?: string | undefined;
	Level2Benediction?: string | undefined;
	Level3Benediction?: string | undefined;
	Level4Benediction?: string | undefined;
	Level5Benediction?: string | undefined;
	Level4ArtefactGift?: string | undefined;
	Reveils: string[];
}

export function getLPForLevel(level: number) {
	if (level >= 5) return 10;
	else if (level >= 3) return 5;
	return 3;
}

export function getLevelForSessions(sessions: number) {
	if (sessions >= 12) return 5;
	else if (sessions >= 7) return 4;
	else if (sessions >= 3) return 3;
	else if (sessions >= 1) return 2;
	return 1;
}

export function getSessionRangeForLevel(level: number) {
	switch (level) {
		case 1:
			return [0, 0];
		case 2:
			return [1, 2];
		case 3:
			return [3, 6];
		case 4:
			return [7, 11];
		case 5:
			return [12, undefined];
		default:
			return [0, undefined];
	}
}

export function getRyuujinType(src: SourceData, data: CharacterState) {
	return (
		src.RyuujinTypes.filter((x) => x.Name === data.RyuujinType)[0] || undefined
	);
}

export function getBenedictionsThroughLevel(
	data: CharacterState,
	level: number
) {
	return [
		data.Level2Benediction,
		(level >= 3 && data.Level3Benediction) || undefined,
		(level >= 4 && data.Level4Benediction) || undefined,
		(level >= 5 && data.Level5Benediction) || undefined,
	].filter((x) => x);
}

export function getArtefacts(
	source: SourceData,
	data: CharacterState
): Artefact[] {
	return [data.Level1Artefact, data.Level4ArtefactGift]
		.map((name) => source.Artefacts.filter((x) => x.Name === name)[0])
		.filter((x) => x);
}

export function getBenedictions(
	source: SourceData,
	data: CharacterState
): Benediction[] {
	return [
		data.Level2Benediction,
		data.Level3Benediction,
		data.Level4Benediction,
		data.Level5Benediction,
	]
		.map((name) => source.Benedictions.filter((x) => x.Name === name)[0])
		.filter((x) => x);
}

export function getReveils(source: SourceData, data: CharacterState): Reveil[] {
	return (data.Reveils || [])
		.map((name) => source.Reveils.filter((x) => x.Name === name)[0])
		.filter((x) => x);
}

export function toPdfFormFillArgs(source: SourceData, data: CharacterState) {
	return {
		CharacterName: data.Title,
		Race: data.RyuujinType,
		Level: data.Level,
		Artifact: [data.Level1Artefact, data.Level4ArtefactGift]
			.filter((x) => x)
			.join(", "),
		MaxLP: getLPForLevel(data.Level),
		CurrentLP: getLPForLevel(data.Level),
		Benediction1: data.Level2Benediction,
		Benediction2: data.Level3Benediction,
		Benediction3: data.Level4Benediction,
		Benediction4: data.Level5Benediction,
		Reveil1: data.Reveils && data.Reveils[0],
		Reveil2: data.Reveils && data.Reveils[1],
		Reveil3: data.Reveils && data.Reveils[2],
		Reveil4: data.Reveils && data.Reveils[3],
	};
}
