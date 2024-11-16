import { getNumericFieldValueFrom } from "../../../helpers/fieldHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import "./AssignStatsStep.css";

/**
 * Defines a stat that can be assigned a choice.
 */
export interface StatDefinition<TChoice> {
	/**
	 * The name of the stat
	 */
	Name: string;
	/**
	 * If true, the value of the stat cannot be changed through the UI.
	 */
	Locked?: boolean | undefined;
	/**
	 * If set, this forces the stat to the given value (if it is an available chioce).
	 */
	FixedValue?: TChoice | undefined;
}

/**
 * Tracks state of each select list representing a stat in an AssignStatsStep.
 */
export interface SelectListState<TChoice> {
	Name: string;
	SelectedIndex: number;
	Options: TChoice[];
	Locked: boolean;
}

/**
 * Tracks state of an AssignStatsStep.
 */
export interface AssignStatsStepState<TChoice> extends StepState {
	Available: TChoice[];
	Value: { [name: string]: TChoice } | undefined;
	Stats: StatDefinition<TChoice>[];
	SelectLists: SelectListState<TChoice>[];
}

/**
 * The default equality function for an AssignStatsStep, if one is not assigned.
 * @param us
 * @param them
 * @returns
 */
function defaultEqualityFunc<T>(us: T, them: T) {
	return us === them;
}

/**
 * Collects options to be shown in the given select list.
 * @param available The list of options that are not currently assigned to a stat.
 * @param value The current value of the AssignStatsStep.
 * @param statName The name of the stat. Its value will be pulled from the value dictionary (if it exists) and added as the first choice in the list.
 * @returns
 */
function collectOptions<TChoice>(
	available: TChoice[],
	value: { [name: string]: TChoice },
	statName: string
) {
	var result: TChoice[] = [];

	// Add the currently selected value as an option
	var selectedValue = value[statName];
	if (selectedValue) {
		result.push(selectedValue);
	}
	// Add the rest of the selected values
	result.push(...available);

	return result;
}

/**
 * Updates the state of an AssignStatsStep based on the given settings.
 *
 * This will remove stats or choices that aren't available based on the current state of the step, ensuring that the result is always valid based on the configuration.
 *
 * @param newState The state object that should be updated.
 * @param equalityFunc A function that can test for equality between two values, to determine if they match.
 * @param choices The defined list of choices.
 * @param stats The defined list of stats.
 */
function updateState<TChoice>(
	newState: AssignStatsStepState<TChoice>,
	equalityFunc: (us: TChoice, them: TChoice) => boolean,
	choices: TChoice[],
	stats: StatDefinition<TChoice>[]
) {
	// Create variables to track values
	var remaining = [...choices];
	var newValue: { [name: string]: TChoice } = {};

	// Loop through each stat
	stats.forEach((stat) => {
		// Get the current value, either from the stat's fixed value or the current state of the step
		var currentValue =
			stat.FixedValue ||
			(newState && newState.Value && newState.Value[stat.Name]);

		// If we got a current value, see if it's valid
		if (currentValue !== undefined) {
			// Find a match for the current value in the remaining values
			var match = remaining.filter((x) =>
				equalityFunc(x, currentValue as TChoice)
			)[0];

			// If we got a matching value, remove it from the remaining options and set it as the value of the stat.
			if (match) {
				remaining.splice(remaining.indexOf(match), 1);
				newValue[stat.Name] = match;
			}
		}
	});

	// Build select list states for each stat based on the remaining values.
	var selectLists: SelectListState<TChoice>[] = stats.map((stat) => {
		var options = collectOptions(remaining, newValue, stat.Name);

		return {
			Name: stat.Name,
			Options: options,
			SelectedIndex: options.indexOf(newValue[stat.Name]),
			Locked: stat.Locked || false,
		};
	});

	// Update the remaining state values
	newState.Available = remaining;
	newState.Stats = stats;
	newState.Value = newValue;
	newState.SelectLists = selectLists;
}

/**
 * Defines a step where a fixed list of choices are assigned to a list of stats.
 */
export class AssignStatsStep<
	TSource,
	TData extends ICharacterData,
	TChoice
> extends StepModel<TSource, TData, AssignStatsStepState<TChoice>> {
	Label: string | undefined;
	GetChoicesList: ((source: TSource, data: TData) => TChoice[]) | undefined;
	ChoiceEquals: (us: TChoice, them: TChoice) => boolean = defaultEqualityFunc;
	GetText: ((choice: TChoice) => string) | undefined;
	GetStats:
		| ((
				source: TSource,
				data: TData,
				lst: TChoice[]
		  ) => StatDefinition<TChoice>[])
		| undefined;
	GetDefaultValue:
		| ((
				source: TSource,
				data: TData,
				lst: TChoice[]
		  ) => { [name: string]: TChoice })
		| undefined;

	constructor(name: string) {
		super(name);
	}

	/**
	 * Sets a label that will be displayed when the step is rendered
	 * @param label
	 * @returns
	 */
	withLabel(label: string | undefined) {
		this.Label = label;
		return this;
	}

	/**
	 * Defines the function used to get choices that can be assigned.
	 * @param choicesFunc
	 * @returns
	 */
	withChoicesList(
		choicesFunc: ((source: TSource, data: TData) => TChoice[]) | undefined
	) {
		this.GetChoicesList = choicesFunc;
		return this;
	}

	/**
	 * Defines a function that can be used to compare two difference choices
	 * @param choiceEqualsFunc
	 * @returns
	 */
	withChoiceEqualsFunction(
		choiceEqualsFunc: ((us: TChoice, them: TChoice) => boolean) | undefined
	) {
		this.ChoiceEquals = choiceEqualsFunc || defaultEqualityFunc;
		return this;
	}

	/**
	 * Defines a function that returns the text value for a choice object.
	 * @param choiceTextFunc
	 * @returns
	 */
	withChoiceText(choiceTextFunc: ((choice: TChoice) => string) | undefined) {
		this.GetText = choiceTextFunc;
		return this;
	}

	/**
	 * Defines a function that returns the stats that choices can be assigned to.
	 * @param statFunc
	 * @returns
	 */
	withStatTargets(
		statFunc:
			| ((
					source: TSource,
					data: TData,
					lst: TChoice[]
			  ) => StatDefinition<TChoice>[])
			| undefined
	) {
		this.GetStats = statFunc;
		return this;
	}

	/**
	 * Defines a function used to set the value when the step loads. This function should load data from existing character data if availble, or supply a value for new characters.
	 * @param defaultValueFunc
	 * @returns
	 */
	withDefaultValue(
		defaultValueFunc:
			| ((
					source: TSource,
					data: TData,
					lst: TChoice[]
			  ) => { [name: string]: TChoice })
			| undefined
	) {
		this.GetDefaultValue = defaultValueFunc;
		return this;
	}

	controlTypeId(): string {
		return "assignstats";
	}

	initializeState(): AssignStatsStepState<TChoice> {
		return {
			Available: [],
			Stats: [],
			Value: undefined,
			SelectLists: [],
			IsCompleted: !this.IsRequired,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}
	clearState(newState: AssignStatsStepState<TChoice>): void {
		newState.Value = undefined;
		newState.Stats = [];
		newState.Available = [];
		newState.SelectLists = [];
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: AssignStatsStepState<TChoice>
	): void {
		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			var choices =
				(this.GetChoicesList && this.GetChoicesList(source, data)) || [];
			var stats = (this.GetStats && this.GetStats(source, data, choices)) || [];

			if (newState.Value === undefined)
				newState.Value =
					this.GetDefaultValue && this.GetDefaultValue(source, data, choices);

			updateState(newState, this.ChoiceEquals, choices, stats);

			newState.IsCompleted = this.IsRequired
				? newState.Available.length === 0
				: true;
		}
	}

	renderInternal(
		stepState: AssignStatsStepState<TChoice>,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;
		var values = stepState.Value || {};

		function onStatChange(
			stat: SelectListState<TChoice>,
			evt: React.ChangeEvent<HTMLSelectElement>
		) {
			var newIndex = getNumericFieldValueFrom(evt);

			var newValues: { [name: string]: TChoice } = {};
			Object.keys(values).forEach((key) => {
				if (key !== stat.Name && values[key]) {
					newValues[key] = values[key];
				}
			});

			if (newIndex !== undefined && stat.Options[newIndex]) {
				newValues[stat.Name] = stat.Options[newIndex];
			}

			triggerUpdate(index, {
				Value: newValues,
			});
		}

		return (
			<>
				{this.Label ? <div className="title">{this.Label}</div> : <></>}
				<div className="stats">
					{stepState.SelectLists.map((selectList) => {
						return (
							<div
								key={`AssignStats-${this.Name}-${selectList.Name}`}
								className="stat"
							>
								{selectList.Name}:
								<select
									value={selectList.SelectedIndex}
									onChange={(e) => onStatChange(selectList, e)}
									disabled={selectList.Locked}
								>
									<option value={-1}>--</option>
									{selectList.Options.map((choice, idx) => (
										<option key={`Choice-${this.Name}-${idx}`} value={idx}>
											{(this.GetText && this.GetText(choice)) ||
												choice?.toString() ||
												"(choice)"}
										</option>
									))}
								</select>
							</div>
						);
					})}
				</div>
			</>
		);
	}
}
