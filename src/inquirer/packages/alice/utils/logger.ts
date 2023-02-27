import type Uniproxy from "../uniproxy.js";

export default function log(this: Uniproxy, t: "info" | "error", ...args: string[]): void {
	if (this.opts.log) {
		console[t]("[alice-tg]", ...args);
	}
}
