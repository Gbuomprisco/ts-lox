export class Environment {
	private values: { [key: string]: object } = {};

	constructor(private enclosing: Environment) {
		this.enclosing = enclosing || null;
	}

	public define(name: string, value: any): void {
		if (this.enclosing !== null) {
			this.enclosing.define(name, value);
		} else {
			this.values[name] = value;
		}
	}

	public get(name: string) {
		let variable;

		if (this.enclosing !== null) {
			variable = this.enclosing.get(name);
		} else {
			variable = this.values[name];
		}

		if (variable === undefined) {
			throw new Error(`variable ${name} is not defined`);
		}

		return variable;
	}
}
