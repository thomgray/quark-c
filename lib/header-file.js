'use babel';

import fs from 'fs';

const declaration = /^\s*(\w+)(\s*?\*+\s*?|\s+)(\w+)\s*\(\s*(.+?)?\s*\)\s*/;

const parseSignature = (signature) => {
    return signature.split(',').map(f => f.trim());
};

export default class HeaderFile {
    constructor({name, path}) {
        const textContent = fs.readFileSync(path, {encoding: 'utf8'});
        const statements = textContent.split(';');
        this._parseOnce(statements);
    }

    getCandidateFunctions(prefix) {
        return this.statements.filter((statement) => {
            return statement.name.startsWith(prefix);
        });
    }

    _parseOnce(statements) {
        this.statements = [];
        statements.forEach((statement) => {
            let declarationMatch;
            if (declarationMatch = declaration.exec(statement)) {
                const declaration = {
                    type: `${declarationMatch[1].trim()} ${declarationMatch[2].trim()}`.trim(),
                    name: declarationMatch[3].trim(),
                    signature: parseSignature(declarationMatch[4])
                };
                this.statements.push(declaration)
            }
        });
    }
}
