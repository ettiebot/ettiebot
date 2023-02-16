import type Uniproxy from "../uniproxy";

export default function log(this: Uniproxy, t: "info" | "error", ...args: string[]): void {
	if (this.opts.log) {
		console[t]("[alice-client]", ...args);
	}
}
