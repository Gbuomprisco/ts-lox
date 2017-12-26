import { TokenType } from './token-type.enum';

export class Token {
	constructor(
		public type: TokenType,
		public lexeme: string,
		public literal: string | number | null | boolean,
		public line: number
	) {}

	public toString(): string {
		return `${this.type} ${this.lexeme} ${this.literal}`;
	}
}
