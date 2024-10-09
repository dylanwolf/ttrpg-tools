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
		var field = evt.currentTarget;
		var newValue = field.value;
		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => ((data as any)[name] = newValue)
		);
	}

	function onNumericValueChange(
		name: string,
		evt: React.ChangeEvent<HTMLInputElement>
	) {
		if (!session?.Data) return;
		var field = evt.currentTarget;
		var strValue = (field.value || "").trim();
		var newValue = strValue === "" ? undefined : Number(strValue);

		console.log(`${name} = ${newValue}`);
		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				console.log(data);
				console.log(name);
				console.log(newValue);
				(data as any)[name] = newValue;
				console.log(data);
			}
		);
	}

	return (
		<div>
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
			<DumpObject object={session.Data} />
		</div>
	);

	return <DumpObject object={session?.Data} />;
}
