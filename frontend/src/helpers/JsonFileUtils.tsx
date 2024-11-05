import React from "react";
import { MessageWindowArgs } from "../state/modal-ui/ModalUISlice";
import { createTabSessionForUtility, UtilityKey } from "../utilities";

/**
 * Converts an object to JSON and uses the browser File API to download it with the given filename.
 * @param filename
 * @param output
 * @returns
 */
export function downloadAsJson(filename: string, output: any) {
	if (!output) return;

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

/**
 * Saved state that can be used to recreate a tab later.
 */
export interface TabSavedState {
	Utility: UtilityKey;
	Data: any;
}

/**
 * Props that can be passed into JsonFileLoader to allow opening files as JSON.
 */
export interface JsonFileLoaderProps {
	/**
	 * Triggers when a file is selected and is being processed.
	 */
	onLoadStarted?: (() => void) | undefined;
	/**
	 * Triggers when a file is successfully loaded.
	 */
	onLoadCompleted?: ((obj: TabSavedState) => void) | undefined;
	/**
	 * Triggers when an error occurs.
	 */
	onError?: ((ex: MessageWindowArgs) => void) | undefined;
}

/**
 * Component used to load a JSON file using an HTML file input element.
 *
 * This component will allow for a single file to be opened. If it is successful, it will attempt to read the file, parse it to JSON, find a UtilityKey to match it up to one of the site's tools, and call the appropriate function to create a session.
 */
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

	triggerOnLoadCompleted(fileContent: TabSavedState) {
		if (this.props.onLoadCompleted) this.props.onLoadCompleted(fileContent);
	}

	triggerOnError(ex: MessageWindowArgs) {
		console.error(`Error loading file`, ex);
		if (this.props.onError) this.props.onError(ex);
	}

	handleFileLoad(fileContent: TabSavedState) {
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
				const obj = JSON.parse(json) as TabSavedState;
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
