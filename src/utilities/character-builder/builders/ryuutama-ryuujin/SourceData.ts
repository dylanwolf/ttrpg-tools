import { ICharacterBuilderSourceData } from "../../BuilderSourceSlice";

export const BUILDER_KEY = "ryuutama-ryuujin";

export interface IFromSource {
	DataSource?: string | undefined;
}

export interface SourceData extends ICharacterBuilderSourceData {
	Version: string;
	__CREDITS__: string;
	AdditionalSources: string[];
	RyuujinTypes: RyuujinType[];
	Artefacts: Artefact[];
	Benedictions: Benediction[];
	Reveils: Reveil[];
}

export interface RyuujinType extends IFromSource {
	Name: string;
	Artefacts: string[];
	Benedictions: string[];
}

export interface Artefact extends IFromSource {
	Name: string;
	Description: string;
}

export interface Benediction extends IFromSource {
	Name: string;
	Description: string;
	IsCommon?: boolean | undefined;
}

export interface Reveil extends IFromSource {
	Name: string;
	LPCost: number;
	Description: string;
}
