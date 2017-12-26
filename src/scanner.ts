import { Type } from './types.enum';
import { Token } from './token';
import { TokenType } from './token-type.enum';
import { error, isAlpha, isAlphaNumeric, isDigit } from './utils';
import { RESERVED_VORDS } from './reserved-words';

export class Scanner {
	private tokens: Token[] = [];
	private start = 0;
	private current = 0;
	private line = 1;

	constructor(private source: string) {
		this.tokenize();
	}

	public getTokens(): Token[] {
		return [ ...this.tokens ];
	}

	private get lexeme(): string {
		return this.source.substring(this.start, this.current);
	}

	private tokenize(): void {
		const length = this.source.length;

		while (this.current <= length) {
			this.start = this.current;
			this.scanToken();
		}

		const eof = new Token(TokenType.EOF, '', null, this.line);
		this.tokens = [ ...this.tokens, eof ];
	}

	private advance(): string {
		this.current = this.current + 1;

		return this.source[this.current - 1];
	}

	private scanToken(): void {
		const current = this.advance();

		// multi letter

		if (isDigit(current)) {
			this.number();
		} else if (isAlpha(current)) {
			this.identifier();
		}

		// single letter

		switch (current) {
			case Type.LEFT_PAREN:
				this.addToken(TokenType.LEFT_PAREN, null);
				break;
			case Type.RIGHT_PAREN:
				this.addToken(TokenType.RIGHT_PAREN, null);
				break;
			case Type.LEFT_BRACE:
				this.addToken(TokenType.LEFT_BRACE, null);
				break;
			case Type.RIGHT_BRACE:
				this.addToken(TokenType.RIGHT_BRACE, null);
				break;
			case Type.COMMA:
				this.addToken(TokenType.COMMA, null);
				break;
			case Type.DOT:
				this.addToken(TokenType.DOT, null);
				break;
			case Type.MINUS:
				this.addToken(TokenType.MINUS, null);
				break;
			case Type.PLUS:
				this.addToken(TokenType.PLUS, null);
				break;
			case Type.SEMICOLON:
				this.addToken(TokenType.SEMICOLON, null);
				break;
			case Type.STAR:
				this.addToken(TokenType.STAR, null);
				break;
			case Type.EQUAL: {
				const token = this.match(Type.EQUAL) ? TokenType.EQUAL_EQUAL : TokenType.EQUAL;
				this.addToken(token, null);
				break;
			}
			case Type.LESS: {
				const token = this.match(Type.EQUAL) ? TokenType.LESS_EQUAL : TokenType.LESS;
				this.addToken(token, null);
				break;
			}
			case Type.GREATER: {
				const token = this.match(Type.EQUAL) ? TokenType.GREATER_EQUAL : TokenType.GREATER;
				this.addToken(token, null);
				break;
			}
			case Type.BANG: {
				const token = this.match(Type.EQUAL) ? TokenType.BANG_EQUAL : TokenType.BANG;
				this.addToken(token, null);
				break;
			}
			case Type.SLASH:
				if (this.match(Type.SLASH)) {
					while (this.peek() !== Type.LINE_FEED && !this.isAtEnd()) {
						this.advance();
					}
				}

				this.addToken(TokenType.SLASH, null);
				break;
			case Type.DOUBLE_QUOTES:
			case Type.SINGLE_QUOTES:
				this.string(current);
				break;
			case Type.WHITE_SPACE:
			case Type.CARRIAGE:
			case Type.TAB:
				break;

			case Type.LINE_FEED:
				this.nextLine();
				break;
			default:
				break;
		}
	}

	private addToken(type: TokenType, literal: string | null | number): void {
		const lexeme = this.lexeme;
		const token = new Token(type, lexeme, literal, this.line);

		this.tokens = [ ...this.tokens, token ];
	}

	private string(type: Type.SINGLE_QUOTES | Type.DOUBLE_QUOTES): void {
		while (this.peek() !== type && !this.isAtEnd()) {
			if (this.peek() === Type.LINE_FEED) {
				this.nextLine();
			}

			this.advance();
		}

		if (this.isAtEnd()) {
			error(this.line, 'Unterminated string');
			return;
		}

		this.advance();

		// remove sorrounding quotes
		const start = this.start + 1;
		const current = this.current - 1;
		const value = this.source.substring(start, current);

		this.addToken(TokenType.STRING, value);
	}

	private number(): void {
		while (isDigit(this.peek())) {
			this.advance();
		}

		if (this.peek() === Type.DOT && isDigit(this.peekNext())) {
			this.advance();

			while (isDigit(this.peek())) {
				this.advance();
			}
		}

		this.addToken(TokenType.NUMBER, parseInt(this.lexeme, 10));
	}

	private identifier(): void {
		while (isAlphaNumeric(this.peek())) {
			this.advance();
		}

		const type = RESERVED_VORDS[this.lexeme] || TokenType.IDENTIFIER;

		this.addToken(type, null);
	}

	private match(symbol: string): boolean {
		if (this.isAtEnd()) {
			return false;
		}

		if (this.source[this.current] !== symbol) {
			return false;
		}

		this.current = this.current + 1;

		return true;
	}

	private peek(): string {
		if (this.isAtEnd()) {
			return '\0';
		}

		return this.source.charAt(this.current);
	}

	private peekNext(): string {
		if (this.current + 1 >= this.source.length) {
			return '\0';
		}

		return this.source.charAt(this.current + 1);
	}

	private isAtEnd(): boolean {
		return this.current >= this.source.length;
	}

	private nextLine(): void {
		this.line = this.line + 1;
	}
}
