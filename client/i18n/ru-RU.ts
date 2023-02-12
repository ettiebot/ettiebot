export default {
	languageChanged: "Окей, буду говорить по-русски.",

	welcome: {
		text: "Привет, {{name}}! Меня зовут Етти. Я могу помочь тебе с различными задачами, от ответов на простые вопросы до предоставления подробных объяснений и обсуждений различных тем.\nСо мной можно поговорить о чём угодно и получить понятные и актуальные ответы.\nТы можешь настроить меня с помощью кнопок ниже, чтобы я могла помочь тебе лучше. Либо мы можем начать общение, просто задай мне вопрос.",
	},

	mainMenu: {
		translatorBtn: "🌍 Переводчик",
		historyBtn: "📚 История",
		subBtn: "💸 Подписка",
		langBtn: "🗺 Язык",
		historyListBtn: "📜 Узнать историю",
		delBtn: "❌ Удалить",
		translate:
			"Я использую сторонний переводчик и с помощью него перевожу твой вопрос на английский язык, после чего перевожу свой ответ на твой язык.\nТак я лучше понимаю твои вопросы.\nЕсли ты хочешь - ты можешь включить или отключить его.\n⚠️ Но имей ввиду - могут появиться проблемы!",
		history:
			"Я сохраняю историю твоих вопросов и моих ответов, чтобы я могла сохранять связность диалога и ответить тебе на твой прошлый вопрос.\nЕсли ты хочешь - ты можешь включить или отключить её.\n⚠️ Но имей ввиду - я не буду знать, о чём мы общались ранее!",
		historyList: "История нашего диалога:\n{{list}}",
		historyListEmpty: "История пуста.",
	},

	basic: {
		enabled: "☑️ Отключить",
		disabled: "❌ Включить",
		backBtn: "🔙 Назад",
		menuPlaceholder: "Привет, {{name}}! Чем я могу тебе помочь?",
		processing: "Думаю... 🤔",
	},

	errors: {
		unknown: "Произошла неизвестная ошибка. Попробуй ещё раз.",
		setUpNeed: "Нужно настроить меня, прежде чем мы начнём общение. Напиши мне.",
		notSoFast: "Не так быстро! Подожди немного, пожалуйста.",
		voicePredict: "Произошла ошибка при распознавании речи. Попробуй ещё раз.",
		voiceIsEmptyOrTooLong:
			"Либо ты ничего не сказал(-а), либо ты сказал(-а) слишком много. Попробуй ещё раз.",
		textTooSmallOrTooLong: "Вопрос слишком короткий или слишком длинный. Попробуй ещё раз.",
	},
};
