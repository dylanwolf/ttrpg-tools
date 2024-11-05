import Markdown from "react-markdown";

interface MarkdownTextProps {
	children: string | undefined;
	inline?: boolean | undefined;
}

function LinkRenderer(props: any) {
	return (
		<a href={props.href} target="_blank">
			{props.children}
		</a>
	);
}

export function MarkdownWrapper(props: MarkdownTextProps) {
	return (
		<Markdown
			className={props.inline ? "markdown-inline" : "markdown-block"}
			components={{ a: LinkRenderer }}
		>
			{props.children}
		</Markdown>
	);
}
