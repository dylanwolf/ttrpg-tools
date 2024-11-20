import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StepModel, StepState } from "../../StepModel";
import { CharacterState } from "./CharacterData";
import { SourceData } from "./SourceData";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import Button from "react-bootstrap/Button";
import { getTextFieldValueFrom } from "../../../../helpers/fieldHelpers";
import { NumericInput } from "../../../../components/fields/NumericInput";
import "./AdditionalBonuses.css";

interface AdditionalBonusesState extends StepState {
	Items?: AdditionalBonusItemState[] | undefined;
	BonusSelectList: string[];
}

interface AdditionalBonusItemState {
	Name?: string | undefined;
	Bonus?: string | undefined;
	Value?: number | undefined;
}

export class AdditionalBonusesStep extends StepModel<
	SourceData,
	CharacterState,
	AdditionalBonusesState
> {
	constructor(name: string) {
		super(name);
		this.onCharacterUpdate((source, state, newData) => {
			newData.AdditionalBonuses = (state.Items || []).filter(
				(i) => i.Bonus && i.Value !== undefined
			);
		});
		this.withHelp(
			"Allows you to add bonuses from items into calculations. This is not full inventory management; just add the applicable bonuses to see how they change your numbers."
		);
	}

	controlTypeId(): string {
		return "ryuutama-additional-bonuses";
	}

	initializeState(): AdditionalBonusesState {
		return {
			BonusSelectList: [],
			IsCompleted: false,
			IsVisible: false,
		};
	}

	clearState(newState: AdditionalBonusesState): void {
		newState.Items = [];
	}

	updateStateInternal(
		source: SourceData,
		data: CharacterState,
		newState: AdditionalBonusesState
	): void {
		newState.BonusSelectList = source.ItemBonusTypes;

		if (newState.Items === undefined)
			newState.Items = structuredClone(data.AdditionalBonuses);

		newState.IsCompleted = true;
		newState.IsVisible = true;
	}

	renderInternal(
		stepState: AdditionalBonusesState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function addItem() {
			var newItems = structuredClone(stepState.Items || []);
			newItems.push({ Bonus: stepState.BonusSelectList[0] });
			triggerUpdate(index, { Items: newItems });
		}

		function removeItem(idx: number) {
			var newItems = structuredClone(stepState.Items || []);
			newItems.splice(idx, 1);
			triggerUpdate(index, { Items: newItems });
		}

		function onItemValueChange(idx: number, field: string, value: any) {
			var newItems = structuredClone(stepState.Items || []);
			(newItems[idx] as any)[field] = value;
			triggerUpdate(index, { Items: newItems });
		}

		return (
			<>
				<div className="title">Additional Bonuses</div>
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Item Name</th>
							<th className="text-center">Bonus Type</th>
							<th className="text-center">Bonus Value</th>
							<th className="text-end">&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{(stepState.Items || []).map((i, idx) => (
							<tr key={`AdditionalBonuses-${idx}`}>
								<td>
									<input
										type="text"
										value={i.Name || ""}
										onChange={(e) =>
											onItemValueChange(idx, "Name", getTextFieldValueFrom(e))
										}
									/>
								</td>
								<td className="text-center">
									<select
										value={i.Bonus || ""}
										onChange={(e) =>
											onItemValueChange(idx, "Bonus", getTextFieldValueFrom(e))
										}
									>
										{stepState.BonusSelectList.map((bonus, bidx) => (
											<option key={`AdditionalBonuses-${idx}-Option-${bidx}`}>
												{bonus}
											</option>
										))}
									</select>
								</td>
								<td className="text-center">
									<NumericInput
										InitialValue={i.Value}
										OnChange={(value) => onItemValueChange(idx, "Value", value)}
									/>
								</td>
								<td className="text-end">
									<div onClick={(e) => removeItem(idx)} className="command">
										<FontAwesomeIcon icon={faXmark} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={4}>
								<Button onClick={addItem}>
									<FontAwesomeIcon icon={faPlus} /> Add Item
								</Button>
							</td>
						</tr>
					</tfoot>
				</table>
			</>
		);
	}
}
