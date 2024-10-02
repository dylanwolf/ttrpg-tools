import { RootStepCollection } from "./StepModel";

var MODELS: { [key: string]: RootStepCollection<any, any> } = {};
var SOURCES: { [key: string]: any } = {};
var CHARACTER_SHEETS: {
	[key: string]: (source: any, data: any) => JSX.Element;
} = {};

export function registerBuilderModel<TSource, TData>(
	model: RootStepCollection<TSource, TData>
) {
	// console.log(model.BuilderKey);
	// console.log(model);
	MODELS[model.BuilderKey] = model;
}

export function registerCharacterSheetRenderer<TSource, TData>(
	builderKey: string,
	renderer: (src: TSource, data: TData) => JSX.Element
) {
	CHARACTER_SHEETS[builderKey] = renderer;
}

export function getBuilderModel<TSource, TData>(key: string) {
	return MODELS[key] as RootStepCollection<TSource, TData>;
}

export async function getBuilderSource<TSource>(key: string) {
	console.log(`getBuilderData(${key})`);
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
