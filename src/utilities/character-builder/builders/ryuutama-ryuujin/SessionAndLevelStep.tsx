import {
	ensureIntegerEntry,
	ensureIntegerPaste,
	getNumericFieldValueFrom,
	toNumericFieldValue,
} from "../../../../helpers/fieldHelpers";
import { between } from "../../../../helpers/mathHelpers";
import { StepModel, StepState } from "../../StepModel";
import {
	CharacterState,
	getLevelForSessions,
	getSessionRangeForLevel,
} from "./CharacterData";
import { SourceData } from "./SourceData";
import "./SessionAndLevelStep.css";

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
		super(name, (src, state, newData) => {
			newData.Sessions = state.SessionValue;
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

		function onSessionChange(evt: React.ChangeEvent<HTMLInputElement>) {
			var fieldValue = getNumericFieldValueFrom(evt);
			if (fieldValue === undefined) {
				triggerUpdate(index, { SessionValue: null });
			} else if (fieldValue !== undefined) {
				triggerUpdate(index, {
					SessionValue: fieldValue,
					LevelValue: getLevelForSessions(fieldValue),
				});
			}
		}

		function onLevelChange(evt: React.ChangeEvent<HTMLInputElement>) {
			var fieldValue = getNumericFieldValueFrom(evt);
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
					<input
						type="number"
						inputMode="numeric"
						value={
							stepState.SessionValue !== undefined ? stepState.SessionValue : ""
						}
						min={0}
						step={1}
						onChange={onSessionChange}
						onKeyDown={ensureIntegerEntry}
						onPaste={ensureIntegerPaste}
					/>
				</label>
				<label>
					Ryuujin Level:{" "}
					<input
						type="number"
						inputMode="numeric"
						value={toNumericFieldValue(stepState.LevelValue)}
						min={1}
						max={5}
						step={1}
						onChange={onLevelChange}
						onKeyDown={ensureIntegerEntry}
						onPaste={ensureIntegerPaste}
					/>
				</label>
			</>
		);
	}
}
