import commander = require('commander');
import { readFileSync } from 'fs';

import { Scanner } from './scanner';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

commander.version('0.0.1').usage('<file ...>').parse(process.argv);

if (commander.args.length >= 1) {
	const source = readFileSync(commander.args[0], 'utf8');
	const scanner = new Scanner(source);
	const interpreter = new Interpreter();
	const tokens = scanner.getTokens();
	const statements = new Parser(tokens).parse();

	statements.forEach((statement) => {
		interpreter.interpret(statement);
	});
}
