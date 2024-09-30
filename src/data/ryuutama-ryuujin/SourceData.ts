export const BUILDER_KEY = "ryuutama-ryuujin";

export interface IFromSource {
	DataSource?: string | undefined;
}

export interface SourceData {
	Version: string;
	AdditionalSources: string[];
	RyuujinTypes: RyuujinType[];
	Artefacts: Artefact[];
	Benedictions: Benediction[];
}

export interface RyuujinType {
	Name: string;
	Artefacts: string[];
	Benedictions: string[];
}

export interface Artefact {
	Name: string;
	Description: string;
}

export interface Benediction {
	Name: string;
	Description: string;
}
