import { Interpreter } from './interpreter';
import { Expression } from './expression';
import { Token } from './token';

declare type ExpressionVariation = Statement[] | Expression | Token | void;

export abstract class Statement {
	constructor(public first?: ExpressionVariation, second?: ExpressionVariation, third?: ExpressionVariation) {}

	public abstract accept(interpreter: Interpreter): null;
}

export class PrintStatement extends Statement {
	constructor(public expression: Expression) {
		super(expression);
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitPrintStatement(this);
	}
}

export class ExpressionStatement extends Statement {
	constructor(public expression: Expression) {
		super(expression);
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitExpressionStatement(this);
	}
}

export class VariableDeclarationStatement extends Statement {
	constructor(public token: Token | void, public initializer: Expression) {
		super(token, initializer);
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitVariableStatement(this);
	}
}

export class BlockStatement extends Statement {
	constructor(public statements: Statement[]) {
		super(statements);
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitBlockStatement(this);
	}
}

export class ConditionStatetement extends Statement {
	constructor(public condition: Statement, public elseIfBranch: Statement, public elseBranch: Statement) {
		super(condition, elseIfBranch, elseBranch);
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitConditionStatement(this);
	}
}

export class WhileStatement extends Statement {
	constructor(public condition: Expression, public body: Statement) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitWhileStatement(this);
	}
}

export class FunctionStatement extends Statement {
	constructor(public name: Token, public parameters: any[], public body: Statement[]) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitFunctionStatement(this);
	}
}

export class ReturnStatement extends Statement {
	constructor(public keyword: Token, public value: any) {
		super();
	}

	public accept(interpreter: Interpreter) {
		return interpreter.visitReturnStatement(this);
	}
}
