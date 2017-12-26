import { Token } from './token';
import { Interpreter } from './interpreter';

export abstract class Expression {
	public abstract accept(interpreter: Interpreter): any;
}

export class Binary extends Expression {
	constructor(public left: Expression, public operator: Token, public right: Expression) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitBinary(this);
	}
}

export class Unary extends Expression {
	constructor(public operator: Token, public right: Expression) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitUnary(this);
	}
}

export class Grouping extends Expression {
	constructor(public expression: Expression) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitGrouping(this);
	}
}

export class Literal extends Expression {
	constructor(public value: string | number | boolean | null) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitLiteral(this);
	}
}

export class Variable extends Expression {
	constructor(public value: Token) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitVariable(this);
	}
}

export class Logical extends Expression {
	constructor(public left: Expression, public operator: Token, public right: Expression) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitLogicalOperator(this);
	}
}
