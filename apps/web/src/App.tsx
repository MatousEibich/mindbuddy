import { useState, useRef, useEffect } from "react";
import { buildMindBuddyChain } from "@mindbuddy/core";
import type { Profile } from "@mindbuddy/core";
import "./App.css";
// Ensure MindBuddy is initialized
import "./init";

// Import the local profile utilities instead of the core ones
import { loadProfileFromStorage, saveProfileToStorage } from "./profileUtils";

function Settings({ profile, onSave, onClose }: { 
	profile: Profile; 
	onSave: (profile: Profile) => void;
	onClose: () => void; 
}) {
	const [draft, setDraft] = useState<Profile>({ ...profile });

	return (
		<aside className="fixed right-0 top-0 w-72 bg-white shadow p-4 h-full">
			<div className="flex justify-between mb-4">
				<h2 className="text-lg font-semibold">Settings</h2>
				<button onClick={onClose} className="text-gray-500">×</button>
			</div>

			<div className="mb-4">
				<label className="block text-sm font-medium mb-2">Name</label>
				<input 
					type="text"
					className="w-full border rounded p-2"
					value={draft.name} 
					onChange={e => setDraft({...draft, name: e.target.value})}
				/>
			</div>

			<div className="mb-4">
				<label className="block text-sm font-medium mb-2">Pronouns</label>
				<input 
					type="text"
					className="w-full border rounded p-2"
					value={draft.pronouns} 
					onChange={e => setDraft({...draft, pronouns: e.target.value})}
				/>
			</div>

			<div className="mb-4">
				<label className="block text-sm font-medium mb-2">Conversation Style</label>
				<div className="space-y-2">
					<label className="flex items-center">
						<input 
							type="radio" 
							className="mr-2" 
							checked={draft.style === "mom"} 
							onChange={() => setDraft({...draft, style: "mom"})}
						/>
						Nurturing
					</label>
					<label className="flex items-center">
						<input 
							type="radio" 
							className="mr-2" 
							checked={draft.style === "middle"} 
							onChange={() => setDraft({...draft, style: "middle"})}
						/>
						Balanced
					</label>
					<label className="flex items-center">
						<input 
							type="radio" 
							className="mr-2" 
							checked={draft.style === "neil"} 
							onChange={() => setDraft({...draft, style: "neil"})}
						/>
						Direct
					</label>
				</div>
			</div>

			<div className="mb-4">
				<label className="block text-sm font-medium mb-2">Core Facts</label>
				{draft.core_facts.map((fact, index) => (
					<div key={fact.id} className="mb-2">
						<input
							type="text"
							className="w-full border rounded p-2"
							value={fact.text}
							onChange={e => {
								const newFacts = [...draft.core_facts];
								newFacts[index] = { ...newFacts[index], text: e.target.value };
								setDraft({...draft, core_facts: newFacts});
							}}
						/>
					</div>
				))}
				<button 
					className="text-sm text-blue-500"
					onClick={() => {
						const maxId = draft.core_facts.length > 0 
							? Math.max(...draft.core_facts.map(f => f.id))
							: 0;
						setDraft({
							...draft, 
							core_facts: [
								...draft.core_facts, 
								{ id: maxId + 1, text: "" }
							]
						});
					}}
				>
					+ Add Fact
				</button>
			</div>

			<button 
				onClick={() => onSave(draft)}
				className="w-full bg-blue-500 text-white px-4 py-2 rounded"
			>
				Save
			</button>
		</aside>
	);
}

export default function App() {
	const [text, setText] = useState("");
	const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [showSettings, setShowSettings] = useState(false);
	// Use any type to avoid TypeScript issues
	const chainRef = useRef<any>(null);
	
	useEffect(() => {
		const initializeApp = async () => {
			try {
				const p = await loadProfileFromStorage();
				let prof = p;
				if (!p) {
					prof = await fetch("/profile.json").then(r => r.json());
					await saveProfileToStorage(prof);
				}
				setProfile(prof);
				chainRef.current = await buildMindBuddyChain(prof);
			} catch (error) {
				console.error("Error initializing app:", error);
			}
		};
		
		initializeApp();
	}, []);

	async function handleSave(p: Profile) {
		await saveProfileToStorage(p);
		setProfile(p);
		// rebuild chain so new style applies
		chainRef.current = await buildMindBuddyChain(p);
		setShowSettings(false);
	}

	async function send() {
		if (!text.trim() || !chainRef.current || !profile) return;
		
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

	if (!profile) {
		return <div className="p-6">Loading profile...</div>;
	}

	return (
		<main className="p-6 relative">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl">
					Hey {profile.name ?? "friend"}, I'm here for you! What's on your mind?
				</h1>
				<button 
					onClick={() => setShowSettings(true)}
					className="px-3 py-1 bg-gray-200 rounded"
				>
					⚙️
				</button>
			</div>
			
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
					onChange={e => setText(e.target.value)}
					onKeyDown={e => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}}
					placeholder="Type your message..."
				/>
				<button 
					onClick={send}
					disabled={isLoading || !text.trim()}
					className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
				>
					Send
				</button>
			</div>
			
			{showSettings && (
				<Settings 
					profile={profile} 
					onSave={handleSave}
					onClose={() => setShowSettings(false)}
				/>
			)}
		</main>
	);
}
