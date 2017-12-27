import { Interpreter } from './interpreter';

export interface LoxCallable {
	arity(): number;
	call(interprete: Interpreter, args: any[]): any;
}
