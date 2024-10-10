import {
	ensureIntegerEntry,
	ensureIntegerPaste,
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
import "./EncounterBuilder5e.css";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons/faSkull";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons/faAnglesRight";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { downloadEncounterBuilder5eJson } from "../data/EncounterBuilder5e";

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
				if (data && data.Monsters) data.Monsters.push({ Count: 1, CR: "0" });
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

	function onAddIndividualCharacter() {
		if (!session?.Data) return;

		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				if (data && data.Characters)
					data.Characters.push({ Level: 1, Count: 1 });
			}
		);
	}

	function onRemoveIndividualCharacter(index: number) {
		if (!session?.Data) return;

		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				if (data && data.Characters) data.Characters.splice(index, 1);
			}
		);
	}

	function onIndividualCharactersValueChange(
		index: number,
		name: string,
		value: string | number | undefined
	) {
		if (!session?.Data) return;

		updateEncounterBuilder5eSession(
			session.SessionKey,
			session.Data,
			(data) => {
				if (data && data.Characters) {
					(data.Characters[index] as any)[name] = value;
				}
			}
		);
	}

	return (
		<>
			<Navbar bg="secondary" variant="pills" className="sticky-top">
				<Nav>
					<Button
						variant="primary"
						onClick={() => downloadEncounterBuilder5eJson(session.Data)}
					>
						<FontAwesomeIcon icon={faDownload} />
						Download as JSON
					</Button>
				</Nav>
			</Navbar>
			<div className="encounter-builder-5e-header">
				<label>
					Encounter Title:{" "}
					<input
						type="text"
						value={session.Data.Title}
						onChange={(e) => onTextValueChange("Title", e)}
					/>
				</label>
			</div>
			<div className="encounter-builder-5e">
				<div className="box monster-box">
					<Alert variant="primary">
						<FontAwesomeIcon icon={faCircleInfo} className="indicator" />
						Build a list of monsters to determine the monster's total XP.
					</Alert>
					<Navbar bg="light" variant="pills">
						<Navbar.Toggle aria-controls="encounter5e-toolbar"></Navbar.Toggle>
						<Navbar.Collapse id="encounter5e-toolbar">
							<Nav>
								<Button variant="primary" onClick={onAddMonster}>
									<FontAwesomeIcon icon={faSkull} />
									Add Monster
								</Button>
							</Nav>
						</Navbar.Collapse>
					</Navbar>
					<table className="table table-sm">
						<thead>
							<tr>
								<th className="align-middle">Name</th>
								<th className="text-center align-middle">#</th>
								<th className="text-center align-middle">CR (each)</th>
								<th className="text-center align-middle">XP (each)</th>
								<th className="text-center align-middle">Total XP</th>
								<th>&nbsp;</th>
							</tr>
						</thead>
						<tbody className="table-group-divider">
							{session.Data.Monsters?.map((m, idx) => {
								return (
									<tr key={`Monster-${idx}`}>
										<td className="align-middle">
											<input
												type="text"
												className="name-field"
												value={m.Name || ""}
												onChange={(e) =>
													onMonstersValueChange(
														idx,
														"Name",
														getTextFieldValueFrom(e)
													)
												}
											/>
										</td>
										<td className="text-center align-middle">
											<input
												type="number"
												value={toNumericFieldValue(m.Count)}
												min={0}
												step={1}
												onKeyDown={ensureIntegerEntry}
												onPaste={ensureIntegerPaste}
												onChange={(e) =>
													onMonstersValueChange(
														idx,
														"Count",
														getNumericFieldValueFrom(e)
													)
												}
											/>
										</td>
										<td className="text-center align-middle">
											<select
												value={m.CR || "0"}
												onChange={(e) =>
													onMonstersValueChange(
														idx,
														"CR",
														getTextFieldValueFrom(e)
													)
												}
											>
												{CR_OPTIONS.map((cr) => (
													<option key={`MonsterCR-${idx}-${cr}`} value={cr}>
														{cr}
													</option>
												))}
											</select>
										</td>
										<td className="text-center align-middle">
											<input
												type="number"
												value={toNumericFieldValue(m.XP)}
												min={0}
												step={1}
												onKeyDown={ensureIntegerEntry}
												onPaste={ensureIntegerPaste}
												onChange={(e) =>
													onMonstersValueChange(
														idx,
														"XP",
														getNumericFieldValueFrom(e)
													)
												}
											/>
										</td>
										<td className="text-center align-middle">
											{m.TotalXP ? m.TotalXP.toLocaleString() : ""}
										</td>
										<td className="text-center align-middle">
											<div
												className="command"
												onClick={(e) => onRemoveMonster(idx)}
											>
												<FontAwesomeIcon icon={faXmark} />
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={4} className="text-end align-middle">
									{session.Data.EncounterMultiplier ? (
										<>
											Encounter Multiplier: x{session.Data.EncounterMultiplier}
										</>
									) : (
										<></>
									)}
								</td>
								<td className="text-center align-middle">
									{session.Data.TotalMonsterXP
										? session.Data.TotalMonsterXP.toLocaleString()
										: ""}
								</td>
								<td>&nbsp;</td>
							</tr>
						</tfoot>
					</table>
				</div>
				<div className="box party-box">
					<Alert variant="primary">
						<FontAwesomeIcon icon={faCircleInfo} className="indicator" />
						Compare the total monster XP to the budget for your party to
						determine the expected difficulty.
					</Alert>
					<div>
						{session.Data.DifficultyThresholds ? (
							<table className="table table-sm table-light">
								<thead>
									<tr>
										<th className="align-middle">Difficulty</th>
										<th className="text-end align-middle">XP Budget</th>
									</tr>
								</thead>
								<tbody className="table-group-divider">
									<tr
										className={
											session.Data.ExpectedDifficulty === "Easy"
												? "table-primary"
												: ""
										}
									>
										<td className="align-middle">
											{session.Data.ExpectedDifficulty === "Easy" ? (
												<FontAwesomeIcon
													icon={faAnglesRight}
													className="indicator"
												/>
											) : (
												<></>
											)}
											Easy
										</td>
										<td className="text-end align-middle">
											{session.Data.DifficultyThresholds.Easy?.toLocaleString()}
										</td>
									</tr>
									<tr
										className={
											session.Data.ExpectedDifficulty === "Medium"
												? "table-primary"
												: ""
										}
									>
										<td className="align-middle">
											{session.Data.ExpectedDifficulty === "Medium" ? (
												<FontAwesomeIcon
													icon={faAnglesRight}
													className="indicator"
												/>
											) : (
												<></>
											)}
											Medium
										</td>
										<td className="text-end align-middle">
											{session.Data.DifficultyThresholds.Medium?.toLocaleString()}
										</td>
									</tr>
									<tr
										className={
											session.Data.ExpectedDifficulty === "Hard"
												? "table-primary"
												: ""
										}
									>
										<td className="align-middle">
											{session.Data.ExpectedDifficulty === "Hard" ? (
												<FontAwesomeIcon
													icon={faAnglesRight}
													className="indicator"
												/>
											) : (
												<></>
											)}
											Hard
										</td>
										<td className="text-end align-middle">
											{session.Data.DifficultyThresholds.Hard?.toLocaleString()}
										</td>
									</tr>
									<tr
										className={
											session.Data.ExpectedDifficulty === "Deadly"
												? "table-primary"
												: ""
										}
									>
										<td className="align-middle">
											{session.Data.ExpectedDifficulty === "Deadly" ? (
												<FontAwesomeIcon
													icon={faAnglesRight}
													className="indicator"
												/>
											) : (
												<></>
											)}
											Deadly
										</td>
										<td className="text-end align-middle">
											{session.Data.DifficultyThresholds.Deadly?.toLocaleString()}
										</td>
									</tr>
								</tbody>
							</table>
						) : (
							<></>
						)}
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
								value={toNumericFieldValue(session.Data.CharacterCount)}
								disabled={session.Data.CharacterMode !== "party"}
								onKeyDown={ensureIntegerEntry}
								onPaste={ensureIntegerPaste}
								min={1}
								step={1}
								onChange={(e) => onNumericValueChange("CharacterCount", e)}
							/>{" "}
							characters of level{" "}
							<input
								type="number"
								value={toNumericFieldValue(session.Data.CharacterLevel)}
								disabled={session.Data.CharacterMode !== "party"}
								onKeyDown={ensureIntegerEntry}
								onPaste={ensureIntegerPaste}
								min={1}
								max={20}
								step={1}
								onChange={(e) => onNumericValueChange("CharacterLevel", e)}
							/>
						</label>
					</div>
					<div>
						<label>
							<input
								type="radio"
								name="encounter5e-charactermode"
								value="individual"
								checked={session.Data.CharacterMode === "individual"}
								onChange={(e) => onTextValueChange("CharacterMode", e)}
							/>{" "}
							Enter characters individually
						</label>
					</div>
					{session.Data.CharacterMode === "individual" ? (
						<div>
							<Navbar bg="light" variant="pills">
								<Navbar.Toggle aria-controls="encounter5e-toolbar"></Navbar.Toggle>
								<Navbar.Collapse id="encounter5e-toolbar">
									<Nav>
										<Button
											variant="primary"
											onClick={onAddIndividualCharacter}
										>
											<FontAwesomeIcon icon={faUser} />
											Add Character
										</Button>
									</Nav>
								</Navbar.Collapse>
							</Navbar>
							<table className="table table-sm">
								<thead>
									<tr>
										<th className="align-middle">Name(s)</th>
										<th className="text-center align-middle">#</th>
										<th className="text-center align-middle">Level</th>
										<th className="text-center align-middle">
											Easy / Med / Hard / Deadly
										</th>
										<th>&nbsp;</th>
									</tr>
								</thead>
								<tbody className="table-group-divider">
									{session.Data.Characters?.map((c, idx) => {
										return (
											<tr key={`Character-${idx}`}>
												<td className="align-middle">
													<input
														type="text"
														className="name-field"
														value={c.Name || ""}
														onChange={(e) =>
															onIndividualCharactersValueChange(
																idx,
																"Name",
																getTextFieldValueFrom(e)
															)
														}
													/>
												</td>
												<td className="text-center align-middle">
													<input
														type="number"
														value={toNumericFieldValue(c.Count)}
														onKeyDown={ensureIntegerEntry}
														onPaste={ensureIntegerPaste}
														min={0}
														step={1}
														onChange={(e) =>
															onIndividualCharactersValueChange(
																idx,
																"Count",
																getNumericFieldValueFrom(e)
															)
														}
													/>
												</td>
												<td className="text-center align-middle">
													<input
														type="number"
														value={toNumericFieldValue(c.Level)}
														onKeyDown={ensureIntegerEntry}
														onPaste={ensureIntegerPaste}
														min={1}
														max={20}
														step={1}
														onChange={(e) =>
															onIndividualCharactersValueChange(
																idx,
																"Level",
																getNumericFieldValueFrom(e)
															)
														}
													/>
												</td>
												<td className="text-center align-middle">
													{c.XPBudget
														? [
																c.XPBudget.Easy,
																c.XPBudget.Medium,
																c.XPBudget.Hard,
																c.XPBudget.Deadly,
														  ]
																.map((x) => x.toLocaleString())
																.join(" / ")
														: ""}
												</td>
												<td className="text-center align-middle">
													<div
														className="command"
														onClick={(e) => onRemoveIndividualCharacter(idx)}
													>
														<FontAwesomeIcon icon={faXmark} />
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					) : (
						<></>
					)}
				</div>
			</div>
			{(window as any).__DEBUG__ ? <DumpObject object={session.Data} /> : <></>}
		</>
	);
}

var CR_OPTIONS = ["0", "1/8", "1/4", "1/2"];
for (var i = 1; i <= 30; i++) CR_OPTIONS.push(i.toString());
