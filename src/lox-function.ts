import { Interpreter } from './interpreter';
import { FunctionStatement } from './statement';
import { LoxCallable } from './lox-callable';
import { Environment } from './environment';

export class LoxFunction implements LoxCallable {
	constructor(public declaration: FunctionStatement) {}

	public call(interpreter: Interpreter, args: any[]): any {
		const environment = new Environment(interpreter.globals);
		for (let i = 0; i < this.arity; i++) {
			environment.define(this.declaration.parameters[i].lexeme, args[i]);
		}

		const executions = interpreter.executeBlock(this.declaration.body, environment);

		return executions[executions.length - 1];
	}

	public get arity(): number {
		return this.declaration.parameters.length;
	}
}
