import { useState, useRef, useEffect } from "react";
import { buildMindBuddyChain } from "@mindbuddy/core";
import type { Profile } from "@mindbuddy/core";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

// Hard-code profile for now
const profile: Profile = {
	name: "User",
	pronouns: "they/them",
	style: "middle",
	core_facts: [{ id: 1, text: "This is a test fact about the user." }],
};

export default function App() {
	const [text, setText] = useState("");
	const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const chainRef = useRef<Awaited<ReturnType<typeof buildMindBuddyChain>>>();
	
	useEffect(() => {
		buildMindBuddyChain(profile).then(c => (chainRef.current = c));
	}, []);

	async function send() {
		if (!text.trim() || !chainRef.current) return;
		
		// Add user message to UI
		setMessages((old) => [...old, { role: "user", content: text }]);
		setIsLoading(true);
		
		try {
			// Get bot response using the chain
			const reply = await chainRef.current.invoke({ query: text });
			// Add bot message to UI
			setMessages((old) => [...old, { role: "assistant", content: reply.text }]);
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setText("");
			setIsLoading(false);
		}
	}

	return (
		<main className="p-6">
			<h1 className="text-xl font-semibold mb-4">MindBuddy (α scaffold)</h1>
			
			{/* Message history */}
			<div className="mb-4 border rounded p-2 h-60 overflow-y-auto">
				{messages.map((msg, i) => (
					<div key={i} className={`mb-2 ${msg.role === "assistant" ? "text-blue-600" : ""}`}>
						<strong>{msg.role === "user" ? profile.name : "MindBuddy"}:</strong> {msg.content}
					</div>
				))}
				{isLoading && <div className="text-gray-400">MindBuddy is thinking...</div>}
			</div>
			
			{/* Input area */}
			<div className="flex gap-2">
				<textarea
					className="border rounded w-full p-2"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Type here…"
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}}
				/>
				<button 
					onClick={send}
					disabled={isLoading || !text.trim()}
					className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
				>
					Send
				</button>
			</div>
		</main>
	);
}
