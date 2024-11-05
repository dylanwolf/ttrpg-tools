import { clamp } from "../../../../helpers/mathHelpers";
import { StepModel, StepState } from "../../StepModel";
import { isInSelectedSource } from "./BuilderModel";
import { CharacterState } from "./CharacterData";
import { Reveil, SourceData } from "./SourceData";
import "./ReveilSelector.css";

interface ReveilSelectorState extends StepState {
	SelectList: Reveil[];
	RemainingChoices: number;
	Selected: string[] | undefined;
}

export class RyuujinReveilSelectorStep extends StepModel<
	SourceData,
	CharacterState,
	ReveilSelectorState
> {
	constructor(name: string) {
		super(
			name,
			(src, state, newData) => (newData.Reveils = state.Selected || [])
		);
	}

	controlTypeId(): string {
		return "ryuutama-ryuujin-reveil";
	}

	initializeState(): ReveilSelectorState {
		return {
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
			SelectList: [],
			Selected: undefined,
			RemainingChoices: 0,
		};
	}

	clearState(newState: ReveilSelectorState): void {
		newState.Selected = undefined;
	}

	updateStateInternal(
		source: SourceData,
		data: CharacterState,
		newState: ReveilSelectorState
	): void {
		if (newState.IsVisible) {
			var totalReveils = clamp(data.Level - 1, 0, 4);

			var allReveils = isInSelectedSource(data, source.Reveils);
			var allReveilNames = allReveils.map((x) => x.Name);

			newState.SelectList = allReveils;

			if (newState.Selected === undefined)
				newState.Selected = (data.Reveils || []).filter((x) =>
					allReveilNames.includes(x)
				);

			newState.RemainingChoices = totalReveils - newState.Selected.length;
			newState.IsCompleted = newState.RemainingChoices === 0;
		} else {
			this.clearState(newState);
			newState.IsCompleted = true;
			newState.IsVisible = false;
		}
	}

	renderInternal(
		stepState: ReveilSelectorState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onChange(reveil: Reveil) {
			var newValues = stepState.Selected || [];

			if (newValues.includes(reveil.Name)) {
				newValues = newValues.filter((x) => x !== reveil.Name);
			} else if (stepState.RemainingChoices > 0) {
				newValues = newValues.concat(reveil.Name);
			} else {
				return;
			}

			triggerUpdate(index, { Selected: newValues });
		}

		return (
			<>
				<div className="title">Reveils</div>
				<div className="available">
					<div className="level">Remaining: {stepState.RemainingChoices}</div>
				</div>
				<table className="table table-sm">
					<thead>
						<tr>
							<th>&nbsp;</th>
							<th>Name</th>
							<th>LP Cost</th>
							<th>Source</th>
						</tr>
					</thead>
					<tbody className="table-group-divider">
						{stepState.SelectList.map((reveil) => (
							<tr key={`RyuujinReveilSelector-${this.Name}-${reveil.Name}`}>
								<td>
									<input
										type="checkbox"
										value={reveil.Name}
										disabled={stepState.RemainingChoices <= 0}
										checked={(stepState.Selected || []).includes(reveil.Name)}
										onChange={function () {
											onChange(reveil);
										}}
									/>
								</td>
								<td>{reveil.Name}</td>
								<td>{reveil.LPCost}</td>
								<td>{reveil.DataSource || "Ryuutama"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		);
	}
}
