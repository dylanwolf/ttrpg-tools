import { StepModel, StepState } from "../../models/StepModel";

export interface PoolDefinition {
	Name: string;
	MaxValue?: number | undefined;
}

interface AssignPoolStepState extends StepState {
	TotalAvailable: number;
	Remaining: number;
	Pools: PoolDefinition[];
	Values: { [name: string]: number | null };
}

export function removeNullValues(values: { [name: string]: number | null }) {
	var result: { [name: string]: number } = {};

	Object.keys(values).forEach((key) => {
		result[key] = values[key] || 0;
	});

	return result;
}

export class AssignPoolStep<TSource, TData> extends StepModel<
	TSource,
	TData,
	AssignPoolStepState
> {
	Label: string;
	GetAvailable: (src: TSource, data: TData) => number;
	GetPools: (src: TSource, data: TData) => PoolDefinition[];
	GetDefaultValue: (src: TSource, data: TData) => { [name: string]: number };
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;
	IsRequired: boolean;

	constructor(
		name: string,
		label: string,
		getAvailable: (src: TSource, data: TData) => number,
		getPools: (src: TSource, data: TData) => PoolDefinition[],
		getDefaultValue: (src: TSource, data: TData) => { [name: string]: number },
		updateCharacter: (
			source: TSource,
			state: AssignPoolStepState,
			newData: TData
		) => void,
		isRequired?: boolean | undefined,
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetAvailable = getAvailable;
		this.GetPools = getPools;
		this.GetDefaultValue = getDefaultValue;
		this.IsRequired = isRequired === undefined ? true : isRequired;
		this.GetIsVisible = getIsVisible;
	}

	initializeState(): AssignPoolStepState {
		return {
			TotalAvailable: 0,
			Remaining: 0,
			Pools: [],
			Values: {},
			IsCompleted: !this.IsRequired,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: AssignPoolStepState): void {
		newState.TotalAvailable = 0;
		newState.Pools = [];
		newState.Values = {};
	}

	updateState(
		source: TSource,
		data: TData,
		newState: AssignPoolStepState
	): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			var available = this.GetAvailable(source, data);
			var pools = this.GetPools(source, data);

			var newValue: { [name: string]: number | null } = {};

			var remaining = available;
			pools.forEach((p) => {
				if (newState.Values[p.Name] === null) {
					newValue[p.Name] = null;
					return;
				}

				var value = newState.Values[p.Name] || 0;

				if (value > remaining) value = remaining;
				if (p.MaxValue !== undefined && value > p.MaxValue) value = p.MaxValue;

				newValue[p.Name] = value;
				remaining -= value;
			});

			newState.Values = newValue;
			newState.Pools = pools;
			newState.TotalAvailable = available;
			newState.Remaining = remaining;

			newState.IsCompleted = this.IsRequired ? newState.Remaining === 0 : true;
		}
	}

	render(
		stepState: AssignPoolStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onChange(
			name: string,
			maxValue: number | undefined,
			evt: React.ChangeEvent<HTMLInputElement>
		) {
			var field = evt.currentTarget;

			if (field.value.trim() === "") {
				var newValues = structuredClone(stepState.Values);
				newValues[name] = null;

				console.log(newValues);
				triggerUpdate(index, { Values: newValues });
			} else {
				var newValue = parseInt(field.value);
				var currentValue = stepState.Values[name];

				if (
					newValue >= 0 &&
					(maxValue === undefined || maxValue >= newValue) &&
					newValue - (currentValue || 0) <= stepState.Remaining
				) {
					var newValues = structuredClone(stepState.Values);
					newValues[name] = newValue;
					triggerUpdate(index, { Values: newValues });
				}
			}
		}

		return (
			<div
				className={`step step-assignpool step-${this.Name} step-${
					stepState.IsCompleted ? "complete" : "incomplete"
				}`}
			>
				<div className="available">Available: {stepState.Remaining}</div>
				{stepState.Pools.map((p) => (
					<div className="pool" key={`AssignPool-${this.Name}-${p.Name}`}>
						{p.Name}:{" "}
						<input
							type="number"
							value={
								stepState.Values[p.Name] !== null
									? stepState.Values[p.Name] || 0
									: ""
							}
							onChange={function (e) {
								onChange(p.Name, p.MaxValue, e);
							}}
							min={0}
							max={p.MaxValue}
						/>
					</div>
				))}
			</div>
		);
	}
}
