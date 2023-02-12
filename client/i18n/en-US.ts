export default {
	languageChanged: "OK, I'll speak English.",

	welcome: {
		text: "Hello, {{name}}! My name is Ettie. I can help you with various tasks, from answering simple questions to providing detailed explanations and discussions on various topics.You can talk to me about anything and get clear and relevant answers.You can configure me using the buttons below so that I can help you better. Or we can start communicating, just ask me a question.",
	},

	mainMenu: {
		translatorBtn: "🌍 Translator",
		historyBtn: "📚 History",
		subBtn: "💸 Subscription",
		langBtn: "🗺 Language",
		historyListBtn: "📜 Get history",
		delBtn: "❌ Delete",
		providerBtn: "🌐 Platform",
		ttsBtn: "🎙 Voicing",
		translate:
			"I use a third-party translator and use it to translate your question into English, after which I translate my answer into your language.So I understand your questions better.If you want - you can enable or disable it.\n ⚠️ But keep in mind - there may be problems!",
		history:
			"I keep the history of your questions and my answers so that I can maintain the coherence of the dialogue and answer your last question to you.If you want - you can enable or disable it.\n ⚠️ But keep in mind - I won't know what we talked about earlier!",
		historyList: "The history of our dialogue:\n{{list}}",
		historyListEmpty: "History is empty.",
		provider:
			"I use third-party neural networks to answer your questions.\nYou can choose which one to use.\n\nSelected: {{provider}}",
		tts: `In addition to the text, I can answer with my voice.\nYou can choose to allow speak me or not.\nYou can also customize voicing by selecting "Only voice" or "Voice with text".`,
	},

	basic: {
		enabled: " ☑️ Disable",
		disabled: "❌ Enable",
		backBtn: "🔙 Back",
		menuPlaceholder: "Hello, {{name}}! How can I help you?",
		processing: "I think... 🤔 ",
		change: "🪄 Change",
		onlyTTS: "🌝 Only voice",
		textWithTTS: "🌚 Voice with text",
	},

	errors: {
		unknown: "An unknown error has occurred. Try again.",
		setUpNeed: "You need to set me up before we start communicating. Write to me.",
		notSoFast: "Not so fast! Wait a bit, please.",
		voicePredict: "An error occurred during speech recognition. Try again.",
		voiceIsEmptyOrTooLong: "Either you didn't say anything, or you said too much. Try again.",
		textTooSmallOrTooLong: "The question is too short or too long. Try again.",
		tts: "There was an error in the voicing :(",
	},
};
