import { getNumericFieldValueFrom } from "../../../helpers/fieldHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import "./AssignStatsStep.css";

export interface StatDefinition<TChoice> {
	Name: string;
	Locked: boolean | undefined;
	FixedValue: TChoice | undefined;
}

export interface SelectListState<TChoice> {
	Name: string;
	SelectedIndex: number;
	Options: TChoice[];
	Locked: boolean;
}

export interface AssignStatsStepState<TChoice> extends StepState {
	Available: TChoice[];
	Value: { [name: string]: TChoice } | undefined;
	Stats: StatDefinition<TChoice>[];
	SelectLists: SelectListState<TChoice>[];
}

function collectOptions<TChoice>(
	available: TChoice[],
	value: { [name: string]: TChoice },
	statName: string
) {
	var result: TChoice[] = [];

	var selectedValue = value[statName];
	if (selectedValue) {
		result.push(selectedValue);
	}
	result.push(...available);

	return result;
}

function updateState<TChoice>(
	newState: AssignStatsStepState<TChoice>,
	equalityFunc: (us: TChoice, them: TChoice) => boolean,
	choices: TChoice[],
	stats: StatDefinition<TChoice>[]
) {
	var remaining = [...choices];
	var newValue: { [name: string]: TChoice } = {};

	stats.forEach((stat) => {
		var currentValue =
			stat.FixedValue ||
			(newState && newState.Value && newState.Value[stat.Name]);

		if (currentValue !== undefined) {
			var match = remaining.filter((x) =>
				equalityFunc(x, currentValue as TChoice)
			)[0];
			if (match) {
				remaining.splice(remaining.indexOf(match), 1);
				newValue[stat.Name] = match;
			}
		}
	});

	var selectLists: SelectListState<TChoice>[] = stats.map((stat) => {
		var options = collectOptions(remaining, newValue, stat.Name);

		return {
			Name: stat.Name,
			Options: options,
			SelectedIndex: options.indexOf(newValue[stat.Name]),
			Locked: stat.Locked || false,
		};
	});

	newState.Available = remaining;
	newState.Stats = stats;
	newState.Value = newValue;
	newState.SelectLists = selectLists;
}

export class AssignStatsStep<
	TSource,
	TData extends ICharacterData,
	TChoice
> extends StepModel<TSource, TData, AssignStatsStepState<TChoice>> {
	Label: string;
	GetChoicesList: (source: TSource, data: TData) => TChoice[];
	ChoiceEquals: (us: TChoice, them: TChoice) => boolean;
	GetText: (choice: TChoice) => string;
	GetStats: (
		source: TSource,
		data: TData,
		lst: TChoice[]
	) => StatDefinition<TChoice>[];
	GetDefaultValue: (
		source: TSource,
		data: TData,
		lst: TChoice[]
	) => { [name: string]: TChoice };

	constructor(
		name: string,
		label: string,
		getChoicesList: (source: TSource, data: TData) => TChoice[],
		choiceEqualsFunc: (us: TChoice, them: TChoice) => boolean,
		getStats: (
			source: TSource,
			data: TData,
			lst: TChoice[]
		) => StatDefinition<TChoice>[],
		getDefaultValue: (
			source: TSource,
			data: TData,
			lst: TChoice[]
		) => { [name: string]: TChoice },
		getText: (choice: TChoice) => string,
		updateCharacter: (
			source: TSource,
			state: AssignStatsStepState<TChoice>,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetChoicesList = getChoicesList;
		this.GetStats = getStats;
		this.ChoiceEquals = choiceEqualsFunc;
		this.GetDefaultValue = getDefaultValue;
		this.GetText = getText;
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
			var choices = this.GetChoicesList(source, data);
			var stats = this.GetStats(source, data, choices);

			if (newState.Value === undefined)
				newState.Value = this.GetDefaultValue(source, data, choices);

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

			if (newIndex && stat.Options[newIndex]) {
				newValues[stat.Name] = stat.Options[newIndex];
			}

			triggerUpdate(index, {
				Value: newValues,
			});
		}

		return (
			<>
				<div className="title">{this.Label}</div>
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
											{this.GetText(choice)}
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
