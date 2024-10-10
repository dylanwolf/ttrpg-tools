import { RootStepCollection } from "./StepModel";

export interface ICharacterData {
	Title: string;
}

var MODELS: { [key: string]: RootStepCollection<any, any> } = {};
var SOURCES: { [key: string]: any } = {};
var CHARACTER_SHEETS: {
	[key: string]: (source: any, data: any) => JSX.Element;
} = {};

export function registerBuilderModel<TSource, TData extends ICharacterData>(
	model: RootStepCollection<TSource, TData>
) {
	console.debug(`Registered model for ${model.BuilderKey}`);
	MODELS[model.BuilderKey] = model;
}

export function registerCharacterSheetRenderer<TSource, TData>(
	builderKey: string,
	renderer: (src: TSource, data: TData) => JSX.Element
) {
	console.debug(`Registered character sheet for ${builderKey}`);
	CHARACTER_SHEETS[builderKey] = renderer;
}

export function getBuilderModel<TSource, TData extends ICharacterData>(
	key: string
) {
	return MODELS[key] as RootStepCollection<TSource, TData>;
}

export async function getBuilderSource<TSource>(key: string) {
	console.debug(`getBuilderData(${key})`);
	if (!SOURCES[key]) {
		SOURCES[key] = (await (await fetch(`/${key}.json`))?.json()) as TSource;
	}
	return SOURCES[key];
}

export function renderCharacterSheet<TSource, TData>(
	builderKey: string,
	source: TSource,
	data: TData
) {
	return CHARACTER_SHEETS[builderKey](source, data);
}
