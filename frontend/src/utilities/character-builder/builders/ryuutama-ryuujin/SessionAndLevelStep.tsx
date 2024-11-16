import { between } from "../../../../helpers/mathHelpers";
import { StepModel, StepState } from "../../StepModel";
import {
	CharacterState,
	getLevelForSessions,
	getSessionRangeForLevel,
} from "./CharacterData";
import { SourceData } from "./SourceData";
import "./SessionAndLevelStep.css";
import { NumericInput } from "../../../../components/fields/NumericInput";

export interface SessionAndLevelStepState extends StepState {
	SessionValue: number | undefined;
	LevelValue: number | undefined;
}

export class SessionAndLevelStep extends StepModel<
	SourceData,
	CharacterState,
	SessionAndLevelStepState
> {
	constructor(name: string) {
		super(name);
		this.onCharacterUpdate((src, state, newData) => {
			newData.Sessions =
				state.SessionValue !== null ? state.SessionValue : undefined;
			newData.Level = state.LevelValue || 1;
		});
	}

	controlTypeId(): string {
		return "ryuujin-session-and-level";
	}

	initializeState(): SessionAndLevelStepState {
		return {
			SessionValue: undefined,
			LevelValue: undefined,
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: SessionAndLevelStepState) {
		newState.SessionValue = 0;
		newState.LevelValue = 1;
	}

	updateStateInternal(
		source: SourceData,
		data: CharacterState,
		newState: SessionAndLevelStepState
	): void {
		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			if (
				newState.SessionValue === undefined &&
				newState.LevelValue === undefined
			) {
				newState.LevelValue = data.Level;
			} else if (newState.LevelValue === undefined) {
				newState.LevelValue = getLevelForSessions(newState.SessionValue || 0);
			}

			newState.IsCompleted = newState.LevelValue !== undefined;
		}
	}
	renderInternal(
		stepState: SessionAndLevelStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onSessionChange(fieldValue: number | undefined) {
			if (fieldValue === undefined) {
				triggerUpdate(index, { SessionValue: null });
			} else if (fieldValue !== undefined) {
				triggerUpdate(index, {
					SessionValue: fieldValue,
					LevelValue: getLevelForSessions(fieldValue),
				});
			}
		}

		function onLevelChange(fieldValue: number | undefined) {
			if (fieldValue === undefined) {
				triggerUpdate(index, { LevelValue: null });
			} else if (fieldValue !== undefined) {
				var sessionRange = getSessionRangeForLevel(fieldValue);

				if (
					stepState.SessionValue === undefined ||
					between(stepState.SessionValue, sessionRange[0], sessionRange[1])
				) {
					triggerUpdate(index, {
						LevelValue: fieldValue,
					});
				} else {
					triggerUpdate(index, {
						LevelValue: fieldValue,
						SessionValue: undefined,
					});
				}
			}
		}

		return (
			<>
				<label>
					Number of Sessions Played:{" "}
					<NumericInput
						InitialValue={stepState.SessionValue}
						MinValue={0}
						NumericStep={1}
						OnChange={onSessionChange}
					/>
				</label>
				<label>
					Ryuujin Level:{" "}
					<NumericInput
						InitialValue={stepState.LevelValue}
						MinValue={0}
						MaxValue={5}
						NumericStep={1}
						OnChange={onLevelChange}
					/>
				</label>
			</>
		);
	}
}
