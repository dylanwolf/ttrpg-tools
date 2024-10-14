import React from "react";
import { createCharacterBuilderSession } from "../utilities/character-builder/BuilderTabSessions";
import { MessageWindowArgs } from "../state/modal-ui/ModalUISlice";
import { createTabSessionForUtility, UtilityKey } from "../utilities";

function downloadAsJson(filename: string, output: any) {
	const json = JSON.stringify(output, null, 2);
	const blob = new Blob([json], { type: "application/json " });
	const href = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = href;
	link.download = filename;
	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	URL.revokeObjectURL(href);
}

export function downloadAsLoadableJson(
	utilityKey: UtilityKey,
	data: any,
	filename: string
) {
	const output = {
		Utility: utilityKey,
		Data: data,
	};
	downloadAsJson(filename, output);
}

export interface JsonFileResult {
	Utility: UtilityKey;
	Data: any;
}

export interface JsonFileLoaderProps {
	onLoadStarted?: (() => void) | undefined;
	onLoadCompleted?: ((obj: JsonFileResult) => void) | undefined;
	onError?: ((ex: MessageWindowArgs) => void) | undefined;
}

export class JsonFileLoader extends React.Component<JsonFileLoaderProps> {
	fileInputRef: React.RefObject<HTMLInputElement> =
		React.createRef<HTMLInputElement>();
	fileReader: FileReader = new FileReader();

	constructor(props: JsonFileLoaderProps) {
		super(props);
		this.fileReader.addEventListener("load", this.onFileRead.bind(this));
	}

	LoadFile() {
		if (this.fileInputRef.current) {
			this.fileInputRef.current.click();
		}
	}

	triggerOnLoadStarted() {
		if (this.props.onLoadStarted) this.props.onLoadStarted();
	}

	triggerOnLoadCompleted(fileContent: JsonFileResult) {
		if (this.props.onLoadCompleted) this.props.onLoadCompleted(fileContent);
	}

	triggerOnError(ex: MessageWindowArgs) {
		console.error(`Error loading file`, ex);
		if (this.props.onError) this.props.onError(ex);
	}

	loadCharacterBuilder(fileContent: JsonFileResult) {
		const data = fileContent.Data;
		if (data.BuilderKey && data.CharacterData) {
			createCharacterBuilderSession(data.BuilderKey, data.CharacterData)
				.then(() => this.triggerOnLoadCompleted(fileContent))
				.catch((ex) =>
					this.triggerOnError({
						Title: "Error loading JSON file",
						Message: `The following error occurred loading the file. It may not be a JSON file or a file associated with this app.\n\n${ex}`,
					})
				);
		}
	}

	// loadEncounterBuilder5e(fileContent: JsonFileResult) {
	// 	const data = fileContent.Data;
	// 	if (data) {
	// 		try {
	// 			createEncounterBuilder5eSession(data);
	// 			this.triggerOnLoadCompleted(fileContent);
	// 		} catch (ex) {
	// 			this.triggerOnError({
	// 				Title: "Error loading JSON file",
	// 				Message: `The following error occurred loading the file. It may not be a JSON file or a file associated with this app.\n\n${ex}`,
	// 			});
	// 		}
	// 	}
	// }

	handleFileLoad(fileContent: JsonFileResult) {
		if (fileContent.Utility && fileContent.Data) {
			createTabSessionForUtility(fileContent.Utility, fileContent.Data)
				.then(() => this.triggerOnLoadCompleted(fileContent))
				.catch((ex) => this.triggerOnError(ex));
		} else {
			this.triggerOnError({
				Title: "Error loading file",
				Message: `The file type was not recognized. It may not be a file associated with this application.`,
			});
		}
	}

	onFileRead(evt: ProgressEvent<FileReader>) {
		if (evt.target && evt.target.result) {
			const json = evt.target.result as string;
			try {
				const obj = JSON.parse(json) as JsonFileResult;
				if (obj) this.handleFileLoad(obj);
			} catch (ex) {
				this.triggerOnError({
					Title: "Error loading file",
					Message: `The following error occurred loading the file. It may not be a JSON file or a file associated with this app.\n\n${ex}`,
				});
			}
		}
	}

	onFileSelected() {
		const file =
			this.fileInputRef.current &&
			this.fileInputRef.current.files &&
			this.fileInputRef.current.files[0];

		if (file) {
			this.triggerOnLoadStarted();
			this.fileReader.readAsText(file);
		}
	}

	render() {
		return (
			<input
				type="file"
				id="openFileJson"
				ref={this.fileInputRef}
				onChange={this.onFileSelected.bind(this)}
				style={{ display: "none" }}
			/>
		);
	}
}
