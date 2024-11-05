import { getNewSessionId } from "../../helpers/sessionHelpers";
import { RootStepCollection } from "./StepModel";

/**
 * Base interface for a builder's character data class.
 */
export interface ICharacterData {
	Title: string;
}

/**
 * Dictionary of step models that have been registered
 */
var MODELS: { [key: string]: RootStepCollection<any, any> } = {};

/**
 * Dictionary of character sheets that have been registered
 */
var CHARACTER_SHEETS: {
	[key: string]: (source: any, data: any) => JSX.Element;
} = {};

/**
 * Registers a new step model. A builder should call this when it is first imported.
 * @param model
 */
export function registerBuilderModel<TSource, TData extends ICharacterData>(
	model: RootStepCollection<TSource, TData>
) {
	console.debug(`Registered model for ${model.BuilderKey}`);
	MODELS[model.BuilderKey] = model;
}

/**
 * Registers a new character sheet. A builder should call this when it is first imported.
 * @param builderKey
 * @param renderer
 */
export function registerCharacterSheetRenderer<TSource, TData>(
	builderKey: string,
	renderer: (src: TSource, data: TData) => JSX.Element
) {
	console.debug(`Registered character sheet for ${builderKey}`);
	CHARACTER_SHEETS[builderKey] = renderer;
}

/**
 * Retrieves the step model fro the given character builder
 * @param builderKey
 * @returns
 */
export function getBuilderModel<TSource, TData extends ICharacterData>(
	builderKey: string
) {
	return MODELS[builderKey] as RootStepCollection<TSource, TData>;
}

/**
 * Fetches builder source data for the given character builder from the web site
 * @param builderKey
 * @returns
 */
export async function fetchBuilderSource<TSource>(builderKey: string) {
	// random ?v= parameter prevents caching
	console.debug(`getBuilderData(${builderKey})`);
	return (await (
		await fetch(`/${builderKey}.json?v=${getNewSessionId()}`)
	)?.json()) as TSource;
}

/**
 * Renders a character sheet that matches the given builder key, source data, and character data.
 * @param builderKey
 * @param source
 * @param data
 * @returns
 */
export function renderCharacterSheet<TSource, TData>(
	builderKey: string,
	source: TSource,
	data: TData
) {
	return CHARACTER_SHEETS[builderKey](source, data);
}
