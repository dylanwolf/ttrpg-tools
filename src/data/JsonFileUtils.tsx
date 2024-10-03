export function downloadAsJson(filename: string, output: any) {
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

export function saveAsBuilderJson(builderKey: string, characterData: any) {
	const output = {
		BuilderKey: builderKey,
		CharacterData: characterData,
	};

	const filename = `${characterData?.Title || "Character"}-${builderKey}.json`;

	downloadAsJson(filename, output);
}

interface JsonFileLoaderProps {
	onFileLoaded: (obj: any) => void;
	forwardedRef: React.MutableRefObject<any>;
}

export function JsonFileLoader(props: JsonFileLoaderProps) {
	function onSelectedFileChanged() {
		const file = (props.forwardedRef.current as any).files[0];
		if (file) {
			var reader = new FileReader();
			reader.addEventListener("load", (evt: any) => {
				const json = evt.target.result;
				try {
					const obj = JSON.parse(json);
					props.onFileLoaded(obj);
				} catch (ex) {
					console.error(ex);
					// TODO: Show error message if JSON load failed
				}
			});
			reader.readAsText(file);
		}
	}

	return (
		<>
			<input
				type="file"
				id="openCharacterJson"
				onChange={onSelectedFileChanged}
				ref={props.forwardedRef}
				style={{ display: "none" }}
			/>
		</>
	);
}
