import { TokenType } from './token-type.enum';
import { Type } from './types.enum';

export const RESERVED_VORDS: { [key: string]: TokenType } = {
	[Type.OR]: TokenType.OR,
	[Type.AND]: TokenType.AND,
	[Type.VAR]: TokenType.VAR,
	[Type.RETURN]: TokenType.RETURN,
	[Type.FUNCTION]: TokenType.FUNCTION,
	[Type.IF]: TokenType.IF,
	[Type.ELSE]: TokenType.ELSE,
	[Type.SUPER]: TokenType.SUPER,
	[Type.THIS]: TokenType.THIS,
	[Type.NIL]: TokenType.NIL,
	[Type.CLASS]: TokenType.CLASS,
	[Type.FOR]: TokenType.FOR,
	[Type.WHILE]: TokenType.WHILE,
	[Type.TRUE]: TokenType.TRUE,
	[Type.FALSE]: TokenType.FALSE,
	[Type.PRINT]: TokenType.PRINT
};
