import { TokenType } from './token-type.enum';
import { Token } from './token';
import { Expression, Binary, Unary, Literal, Grouping, Variable, Logical, Assignment } from './expression';
import { error } from './utils';

import {
	Statement,
	PrintStatement,
	ExpressionStatement,
	VariableDeclarationStatement,
	BlockStatement,
	ConditionStatetement,
	WhileStatement
} from './statement';

import { Type } from './types.enum';

export class Parser {
	private current = 0;
	private statements: (Statement | VariableDeclarationStatement)[] = [];

	constructor(private tokens: Token[]) {}

	public parse() {
		while (!this.isAtEnd()) {
			this.statements.push(this.declaration());
		}

		return this.statements;
	}

	private block(): Statement[] {
		const statements = [];

		while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
			statements.push(this.declaration());
		}

		this.consume(TokenType.RIGHT_BRACE, 'Expected }');

		return statements;
	}

	private blockStatement(statements: Statement[]): BlockStatement {
		return new BlockStatement(statements);
	}

	private conditionStatement(): Statement {
		this.consume(TokenType.LEFT_PAREN, 'Missing (');
		const condition = this.expression();
		this.consume(TokenType.RIGHT_PAREN, 'Missing )');
		const elseIfBranch = this.statement();

		let elseBranch;

		if (this.match(TokenType.ELSE)) {
			elseBranch = this.statement();
		}

		return new ConditionStatetement(condition, elseIfBranch, elseBranch);
	}

	private expression(): Expression {
		return this.assignment();
	}

	private advance(): Token {
		if (!this.isAtEnd()) {
			this.current = this.current + 1;
		}

		return this.previous();
	}

	private previous(): Token {
		return this.tokens[this.current - 1];
	}

	private check(type: TokenType): boolean {
		if (this.isAtEnd()) {
			return false;
		}

		return this.peek().type === type;
	}

	private peek(): Token {
		return this.tokens[this.current];
	}

	private isAtEnd(): boolean {
		return this.peek().type === TokenType.EOF;
	}

	private match(...types: TokenType[]) {
		for (let i = 0; i < types.length; i++) {
			if (this.check(types[i])) {
				this.advance();
				return true;
			}
		}

		return false;
	}

	private equality(): Expression {
		let expr = this.comparison();

		while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
			const operator = this.previous();
			const right = this.comparison();

			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	private comparison(): Expression {
		let expr = this.addition();

		while (this.match(TokenType.LESS, TokenType.LESS_EQUAL, TokenType.GREATER, TokenType.GREATER_EQUAL)) {
			const operator = this.previous();
			const right = this.addition();

			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	private unary(): Expression {
		if (this.match(TokenType.BANG, TokenType.MINUS)) {
			const operator = this.previous();
			const right = this.unary();

			return new Unary(operator, right);
		}

		return this.primary();
	}

	private addition(): Expression {
		let expr = this.multiplication();

		while (this.match(TokenType.MINUS, TokenType.PLUS)) {
			const operator = this.previous();
			const right = this.multiplication();

			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	private multiplication(): Expression {
		let expr = this.unary();

		while (this.match(TokenType.SLASH, TokenType.STAR)) {
			const operator = this.previous();
			const right = this.unary();

			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	private and(): Expression {
		let expression = this.equality();

		while (this.match(TokenType.AND)) {
			const operator = this.previous();
			const right = this.equality();
			expression = new Logical(expression, operator, right);
		}

		return expression;
	}

	private or(): Expression {
		let expression = this.and();

		while (this.match(TokenType.OR)) {
			const operator = this.previous();
			const right = this.and();
			expression = new Logical(expression, operator, right);
		}

		return expression;
	}

	private declaration() {
		if (this.match(TokenType.VAR)) {
			return this.variableDeclarationStatement();
		}

		return this.statement();
	}

	private primary(): Expression {
		if (this.match(TokenType.TRUE)) {
			return new Literal(true);
		}

		if (this.match(TokenType.FALSE)) {
			return new Literal(false);
		}

		if (this.match(TokenType.NIL)) {
			return new Literal(null);
		}

		if (this.match(TokenType.NUMBER, TokenType.STRING)) {
			return new Literal(this.previous().literal);
		}

		if (this.match(TokenType.LEFT_PAREN)) {
			const expression = this.expression();
			this.consume(TokenType.RIGHT_PAREN, 'Expected ) after expression');

			return new Grouping(expression);
		}

		if (this.match(TokenType.IDENTIFIER)) {
			return new Variable(this.previous());
		}

		throw new Error(this.peek() + ': Expected expression.');
	}

	private assignment() {
		const expression = this.or();

		if (this.match(TokenType.EQUAL)) {
			const equals = this.previous();
			const value = this.assignment();

			if (expression instanceof Variable) {
				const token = (expression as Variable).value;
				return new Assignment(token, value);
			}

			throw new Error();
		}

		return expression;
	}

	private statement() {
		if (this.match(TokenType.PRINT)) {
			return this.printStatement();
		}

		if (this.match(TokenType.LEFT_BRACE)) {
			return this.blockStatement(this.block());
		}

		if (this.match(TokenType.IF)) {
			return this.conditionStatement();
		}

		if (this.match(TokenType.WHILE)) {
			return this.whileStatement();
		}

		if (this.match(TokenType.FOR)) {
			return this.forLoopStatement();
		}

		return this.expressionStatement();
	}

	private printStatement(): PrintStatement {
		const expression = this.expression();

		this.consume(TokenType.SEMICOLON, 'Semicolon missing after value');

		return new PrintStatement(expression);
	}

	private expressionStatement(): ExpressionStatement {
		const expression = this.expression();

		this.consume(TokenType.SEMICOLON, 'Semicolon missing after statement');

		return new ExpressionStatement(expression);
	}

	private variableDeclarationStatement(): VariableDeclarationStatement {
		const name = this.consume(TokenType.IDENTIFIER, 'expected variable name');

		if (this.match(TokenType.EQUAL)) {
			const initializer = this.expression();
			this.consume(TokenType.SEMICOLON, 'Semicolon missing after declaration');

			return new VariableDeclarationStatement(name, initializer);
		}

		throw new Error();
	}

	private whileStatement() {
		this.consume(TokenType.LEFT_PAREN, 'Expected ( after while statement');
		const condition = this.expression();
		this.consume(TokenType.RIGHT_PAREN, 'Expected ) after while statement');
		const body = this.statement();

		return new WhileStatement(condition, body);
	}

	private forLoopStatement() {
		this.consume(TokenType.LEFT_PAREN, 'Expected (');

		let initializer;
		let condition;
		let increment;

		if (this.match(TokenType.SEMICOLON)) {
			initializer = null;
		} else if (this.match(TokenType.VAR)) {
			initializer = this.variableDeclarationStatement();
		} else {
			initializer = this.expressionStatement();
		}

		if (!this.check(TokenType.SEMICOLON)) {
			condition = this.expression();
		}

		this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

		if (!this.check(TokenType.RIGHT_PAREN)) {
			increment = this.expression();
		}

		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

		let body = this.statement();

		if (increment !== null) {
			body = new BlockStatement([ body, new ExpressionStatement(increment) ]);
		}

		if (condition === null) {
			condition = new Literal(true);
		}

		body = new WhileStatement(condition, body);

		if (initializer !== null) {
			body = new BlockStatement([ initializer, body ]);
		}

		return body;
	}

	private consume(type: TokenType, message: string): Token | void {
		if (this.check(type)) {
			return this.advance();
		}

		return error(this.peek().line, message);
	}

	private synchronize(): void {
		this.advance();

		while (!this.isAtEnd()) {
			if (this.previous().type === TokenType.SEMICOLON) {
				return;
			}

			switch (this.peek().type) {
				case TokenType.CLASS:
				case TokenType.FUNCTION:
				case TokenType.VAR:
				case TokenType.FOR:
				case TokenType.IF:
				case TokenType.WHILE:
				case TokenType.PRINT:
				case TokenType.RETURN:
					return;
			}

			this.advance();
		}
	}
}
