'use babel';

import {CompositeDisposable} from 'atom';

const libImport = /^\s*#include\s+<(\w+.h)>$/

export default class CEditor {
    constructor({editor, compiler}) {
        this.subscriptions = new CompositeDisposable();
        this.editor = editor;
        this.compiler = compiler;
        this.buffer = editor.getBuffer();
        
        this.imports = [];
        this._parseOnce();
    }

    destroy() {
        this.subscriptions.dispose;
    }

    getImports() {
        return this.imports;
    }

    _parseOnce() {
        const lines = this.buffer.getLines();
        lines.forEach((line) => {
            let match;
            if (match = libImport.exec(line)) {
                const headerFileName = match[1];
                this.imports.push(this.compiler.getHeaderFile(headerFileName));
            }
        });
    }
}