import { StepModel, StepState } from "../../models/StepModel";

export interface PoolDefinition {
	Name: string;
	MaxValue?: number | undefined;
}

interface AssignPoolStepState extends StepState {
	TotalAvailable: number;
	Remaining: number;
	Pools: PoolDefinition[];
	Values: { [name: string]: number };
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
		isRequired?: boolean | undefined
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetAvailable = getAvailable;
		this.GetPools = getPools;
		this.GetDefaultValue = getDefaultValue;
		this.IsRequired = isRequired === undefined ? true : isRequired;
	}

	initializeState(): AssignPoolStepState {
		return {
			TotalAvailable: 0,
			Remaining: 0,
			Pools: [],
			Values: {},
			IsCompleted: !this.IsRequired,
			IsVisible: true,
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
		var available = this.GetAvailable(source, data);
		var pools = this.GetPools(source, data);

		var newValue: { [name: string]: number } = {};

		var remaining = available;
		pools.forEach((p) => {
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
		newState.IsCompleted = !this.IsRequired || remaining === 0;
		newState.IsVisible = true;
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
			var newValue = parseInt(field.value);
			var currentValue = stepState.Values[name];

			if (
				newValue >= 0 &&
				(maxValue === undefined || maxValue >= newValue) &&
				newValue - currentValue <= stepState.Remaining
			) {
				var newValues = structuredClone(stepState.Values);
				newValues[name] = newValue;
				triggerUpdate(index, { Values: newValues });
			}
		}

		return (
			<div className={`step step-assignpool step-${this.Name}`}>
				<div className="available">Available: {stepState.Remaining}</div>
				{stepState.Pools.map((p) => (
					<div className="pool" key={`AssignPool-${this.Name}-${p.Name}`}>
						{p.Name}:{" "}
						<input
							type="number"
							value={stepState.Values[p.Name] || 0}
							onChange={function (e) {
								onChange(p.Name, p.MaxValue, e);
							}}
						/>
					</div>
				))}
			</div>
		);
	}
}
