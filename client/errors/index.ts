import i18next from "i18next";

export class ClientError extends Error {
	code: string;

	constructor(code: string) {
		super();
		this.code = code;
	}
}

export function errorToText(error: ClientError, lang: string): string {
	switch (error.code) {
		case "USER_ID_MISMATCH":
			return i18next.t("errors.unknown", { lng: lang }); // ! TODO
		case "USER_MISMATCH":
			return i18next.t("errors.unknown", { lng: lang }); // ! TODO
		case "VOICE_PREDICT_ERROR":
			return i18next.t("errors.voicePredict", { lng: lang });
		case "VOICE_IS_EMPTY_OR_TOO_LONG":
			return i18next.t("errors.voiceIsEmptyOrTooLong", { lng: lang });
		case "TEXT_TOO_SMALL_OR_TOO_LONG":
			return i18next.t("errors.textTooSmallOrTooLong", { lng: lang });
		case "RATE_LIMIT":
			return i18next.t("errors.notSoFast", { lng: lang });
		default:
			return i18next.t("errors.unknown", { lng: lang });
	}
}
