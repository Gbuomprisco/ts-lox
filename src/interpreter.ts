import { Token } from './token';
import { Literal, Expression, Grouping, Unary, Binary, Variable, Logical } from './expression';
import { TokenType } from './token-type.enum';
import {
	Statement,
	ExpressionStatement,
	PrintStatement,
	VariableDeclarationStatement,
	BlockStatement
} from './statement';

import { Environment } from './environment';
import { ConditionStatetement } from './statement';

export class Interpreter {
	public environment = new Environment(null);

	public interpret(statement: Statement) {
		try {
			const value = this.execute(statement);
			return value;
		} catch (e) {
			console.log(e);
			return;
		}
	}

	public visitBinary(binary: Binary) {
		const left = this.evaluate(binary.left);
		const right = this.evaluate(binary.right);

		switch (binary.operator.type) {
			case TokenType.PLUS:
				return left + right;
			case TokenType.STAR:
				return left * right;
			case TokenType.MINUS:
				return left - right;
			case TokenType.SLASH:
				return left / right;
			case TokenType.GREATER:
				return left > right;
			case TokenType.GREATER_EQUAL:
				return left >= right;
			case TokenType.EQUAL_EQUAL:
				return left === right;
			case TokenType.BANG_EQUAL:
				return left !== right;
			case TokenType.LESS:
				return left < right;
			case TokenType.LESS_EQUAL:
				return left <= right;
			case TokenType.AND:
				return left && right;
			case TokenType.OR:
				return left || right;
			default:
				return;
		}
	}

	public visitUnary(unary: Unary) {
		const right = this.evaluate(unary.right);

		switch (unary.operator.type) {
			case TokenType.MINUS:
				return -right;
			case TokenType.BANG:
				return !right;
			default:
				return null;
		}
	}

	public visitLiteral(literal: Literal): string | number | boolean | null {
		return literal.value;
	}

	public visitGrouping(grouping: Grouping): any {
		return this.evaluate(grouping.expression);
	}

	public visitVariable(variable: Variable): any {
		return this.environment.get(variable.value.lexeme);
	}

	public visitPrintStatement(statement: PrintStatement) {
		const value = this.evaluate(statement.expression);

		console.log(value);

		return null;
	}

	public visitExpressionStatement(statement: ExpressionStatement) {
		this.evaluate(statement.expression);

		return null;
	}

	public visitVariableStatement(statement: VariableDeclarationStatement) {
		const token = statement.token as Token;
		const value = this.evaluate(statement.initializer);

		this.environment.define(token.lexeme, value);

		return null;
	}

	public visitBlockStatement(block: BlockStatement): null {
		this.executeBlock(block.statements, new Environment(this.environment));
		return null;
	}

	public visitConditionStatement(statement: ConditionStatetement): null {
		if (Boolean(this.evaluate(statement.condition))) {
			this.execute(statement.elseIfBranch);
		} else if (statement.elseBranch !== null) {
			this.execute(statement.elseBranch);
		}

		return null;
	}

	public visitLogicalOperator(expression: Logical) {
		const left = this.evaluate(expression.left);

		if (expression.operator.type === TokenType.OR) {
			if (Boolean(left)) {
				return left;
			}
		} else {
			if (!Boolean(left)) {
				return left;
			}
		}

		return this.evaluate(expression.right);
	}

	private accept(expression: Expression) {
		return expression.accept(this);
	}

	private evaluate(expression: Expression) {
		return this.accept(expression);
	}

	private execute(statement: Statement) {
		return statement.accept(this);
	}

	private executeBlock(statements: Statement[], environment: Environment) {
		const previous = this.environment;

		try {
			this.environment = environment;

			statements.forEach((statement) => {
				this.execute(statement);
			});
		} finally {
			this.environment = previous;
		}
	}
}
