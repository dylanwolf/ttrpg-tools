import { registerCharacterSheetRenderer } from "../../BuilderFactory";
import { BUILDER_KEY, SourceData } from "./SourceData";
import "./CharacterSheet.css";
import {
	CharacterState,
	getArtefacts,
	getBenedictions,
	getLPForLevel,
	getReveils,
} from "./CharacterData";

registerCharacterSheetRenderer(
	BUILDER_KEY,
	(src: SourceData, data: CharacterState) => {
		var lp = getLPForLevel(data.Level);
		var artefacts = getArtefacts(src, data);
		var benedictions = getBenedictions(src, data);
		var reveils = getReveils(src, data);

		return (
			<div className="character-sheet ryuujin-character-sheet">
				<div className="character-name">{data.Title}</div>
				<div className="blocks">
					<div className="block level centered">
						<div className="title">Level</div>
						<div className="content">{data.Level}</div>
					</div>
					{data.Sessions !== undefined ? (
						<div className="block level centered">
							<div className="title"># of Sessions</div>
							<div className="content">{data.Sessions.toLocaleString()}</div>
						</div>
					) : (
						<></>
					)}
					<div className="block level">
						<div className="title">Ryuujin Type</div>
						<div className="content">{data.RyuujinType}</div>
					</div>
					<div className="block level centered">
						<div className="title">LP</div>
						<div className="content">{lp}</div>
					</div>
				</div>
				<div className="table-section artefacts">
					<div className="title">Artefacts</div>
					<table className="table table-striped table-dark">
						<thead>
							<tr>
								<th>Name</th>
								<th>Description</th>
								<th>Source</th>
							</tr>
						</thead>
						<tbody>
							{artefacts.map((a) => (
								<tr key={`Ryuujin-Artefact-${a.Name}`}>
									<td>{a.Name}</td>
									<td>{a.Description}</td>
									<td>{a.DataSource || "Ryuutama"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{benedictions.length > 0 ? (
					<div className="table-section benedictions">
						<div className="title">Benedictions</div>
						<table className="table table-striped table-dark">
							<thead>
								<tr>
									<th>Name</th>
									<th>Description</th>
									<th>Source</th>
								</tr>
							</thead>
							<tbody>
								{benedictions.map((b) => (
									<tr key={`Ryuujin-Benediction-${b.Name}`}>
										<td>{b.Name}</td>
										<td>{b.Description}</td>
										<td>{b.DataSource || "Ryuutama"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<></>
				)}
				{reveils.length > 0 ? (
					<div className="table-section reveils">
						<div className="title">Reveils</div>
						<table className="table table-striped table-dark">
							<thead>
								<tr>
									<th>Name</th>
									<th>LP Cost</th>
									<th>Description</th>
									<th>Source</th>
								</tr>
							</thead>
							<tbody>
								{reveils.map((r) => (
									<tr key={`Ryuujin-Reveil-${r.Name}`}>
										<td>{r.Name}</td>
										<td>{r.LPCost}</td>
										<td>{r.Description}</td>
										<td>{r.DataSource || "Ryuutama"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<></>
				)}
			</div>
		);
	}
);
