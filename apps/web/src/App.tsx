import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

export default function App() {
	const [text, setText] = useState("");

	return (
		<main className="p-6">
			<h1 className="text-xl font-semibold mb-4">MindBuddy (α scaffold)</h1>
			<textarea
				className="border rounded w-full h-36 p-2"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Type here…"
			/>
		</main>
	);
}
