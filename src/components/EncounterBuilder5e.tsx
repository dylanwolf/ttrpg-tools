import { Encounter5eMonster } from "../data/encounter-builder-5e";
import {
	ensureNumericEntry,
	getNumericFieldValueFrom,
	getTextFieldValueFrom,
	toNumericFieldValue,
} from "../helpers/fieldHelpers";
import { useAppSelector } from "../state/AppStore";
import {
	encounterBuilder5eSessionSelector,
	updateEncounterBuilder5eSession,
} from "../state/encounter-builder-5e/EncounterBuilder5eTabSessions";
import { DumpObject } from "./DumpObject";

export default function EncounterBuilder5eView() {
	const session = useAppSelector(encounterBuilder5eSessionSelector());
	if (!session?.Data) return <></>;

	function onTextValueChange(
		name: string,
		evt: React.ChangeEvent<HTMLInputElement>
	) {
		if (!session?.Data) return;
		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => ((data as any)[name] = getTextFieldValueFrom(evt))
		);
	}

	function onNumericValueChange(
		name: string,
		evt: React.ChangeEvent<HTMLInputElement>
	) {
		if (!session?.Data) return;
		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				(data as any)[name] = getNumericFieldValueFrom(evt);
			}
		);
	}

	function onAddMonster() {
		if (!session?.Data) return;

		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				if (data && data.Monsters) data.Monsters.push({ Count: 1 });
			}
		);
	}

	function onRemoveMonster(index: number) {
		if (!session?.Data) return;

		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				if (data && data.Monsters) data.Monsters.splice(index, 1);
			}
		);
	}

	function onMonstersValueChange(
		index: number,
		name: string,
		value: string | number | undefined
	) {
		if (!session?.Data) return;

		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				if (data && data.Monsters) {
					(data.Monsters[index] as any)[name] = value;
					if (name === "CR") data.Monsters[index].XP = undefined;
					if (name === "XP") data.Monsters[index].CR = undefined;
				}
			}
		);
	}

	return (
		<div>
			{session.Data.DifficultyThresholds ? (
				<div>
					Difficulty Thresholds:
					<div>
						Easy: {session.Data.DifficultyThresholds.Easy.toLocaleString()}
					</div>
					<div>
						Medium: {session.Data.DifficultyThresholds.Medium.toLocaleString()}
					</div>
					<div>
						Hard: {session.Data.DifficultyThresholds.Hard.toLocaleString()}
					</div>
					<div>
						Deadly: {session.Data.DifficultyThresholds.Deadly.toLocaleString()}
					</div>
				</div>
			) : (
				<></>
			)}
			{session.Data.EncounterMultiplier ? (
				<div>Encounter Multiplier: x{session.Data.EncounterMultiplier}</div>
			) : (
				<></>
			)}
			{session.Data.TotalMonsterXP ? (
				<div>
					Total Monster XP: {session.Data.TotalMonsterXP.toLocaleString()}
				</div>
			) : (
				<></>
			)}
			{session.Data.ExpectedDifficulty ? (
				<div>Expected Difficulty: {session.Data.ExpectedDifficulty}</div>
			) : (
				<></>
			)}
			<div>
				Title:
				<input
					type="text"
					value={session.Data.Title}
					onChange={(e) => onTextValueChange("Title", e)}
				/>
			</div>
			<div>
				<label>
					<input
						type="radio"
						name="encounter5e-charactermode"
						value="party"
						checked={session.Data.CharacterMode === "party"}
						onChange={(e) => onTextValueChange("CharacterMode", e)}
					/>{" "}
					A party of{" "}
					<input
						type="number"
						value={session.Data.CharacterCount || ""}
						disabled={session.Data.CharacterMode !== "party"}
						onKeyDown={ensureNumericEntry}
						min={1}
						max={10}
						step={1}
						onChange={(e) => onNumericValueChange("CharacterCount", e)}
					/>{" "}
					characters of level{" "}
					<input
						type="number"
						value={session.Data.CharacterLevel || ""}
						disabled={session.Data.CharacterMode !== "party"}
						onKeyDown={ensureNumericEntry}
						min={1}
						max={20}
						step={1}
						onChange={(e) => onNumericValueChange("CharacterLevel", e)}
					/>
				</label>
				<label>
					<input
						type="radio"
						name="encounter5e-charactermode"
						value="individual"
						checked={session.Data.CharacterMode === "individual"}
						onChange={(e) => onTextValueChange("CharacterMode", e)}
					/>{" "}
					Individual
				</label>
			</div>
			<div>Monsters:</div>
			{session.Data.Monsters?.map((m, idx) => {
				return (
					<MonsterEditor
						key={`Monster-${idx}`}
						monster={m}
						index={idx}
						onItemRemove={() => onRemoveMonster(idx)}
						onValueChange={(name, value) =>
							onMonstersValueChange(idx, name, value)
						}
					/>
				);
			})}
			<div>
				<a className="btn btn-primary" onClick={onAddMonster}>
					Add Monster
				</a>
			</div>
			<DumpObject object={session.Data} />
		</div>
	);
}

interface MonsterEditorProps {
	monster: Encounter5eMonster;
	index: number;
	onValueChange: (name: string, value: string | number | undefined) => void;
	onItemRemove: () => void;
}

var CR_OPTIONS = ["0", "1/8", "1/4", "1/2"];
for (var i = 1; i <= 30; i++) CR_OPTIONS.push(i.toString());

function MonsterEditor(props: MonsterEditorProps) {
	function onTextChange(name: string, evt: React.ChangeEvent<any>) {
		props.onValueChange(name, getTextFieldValueFrom(evt));
	}

	function onNumberChange(name: string, evt: React.ChangeEvent<any>) {
		props.onValueChange(name, getNumericFieldValueFrom(evt));
	}

	return (
		<div>
			<div>
				Name:{" "}
				<input
					type="text"
					value={props.monster.Name || ""}
					onChange={(e) => onTextChange("Name", e)}
				/>
			</div>
			<div>
				Count:{" "}
				<input
					type="number"
					min={0}
					step={1}
					value={toNumericFieldValue(props.monster.Count)}
					onChange={(e) => onNumberChange("Count", e)}
					onKeyDown={ensureNumericEntry}
				/>
			</div>
			<div>
				XP per Monster:{" "}
				<input
					type="number"
					min={0}
					step={1}
					value={toNumericFieldValue(props.monster.XP)}
					onChange={(e) => onNumberChange("XP", e)}
					onKeyDown={ensureNumericEntry}
				/>
			</div>
			<div>
				CR per Monster:{" "}
				<select
					value={props.monster.CR || "0"}
					onChange={(e) => onTextChange("CR", e)}
				>
					{CR_OPTIONS.map((cr) => (
						<option key={`MonsterCR-${props.index}-${cr}`} value={cr}>
							{cr}
						</option>
					))}
				</select>
			</div>
			<div>
				<a className="btn btn-primary" onClick={props.onItemRemove}>
					Remove
				</a>
			</div>
		</div>
	);
}
