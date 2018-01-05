'use babel';

import { CompositeDisposable } from 'atom';
import CProvider from '../providers/c';
import Compiler from './compiler';
import {parseHeaderFile} from './header-file';
import CEditor from './c-editor';

export default {

    subscriptions: null,
    cHeaders: null,
    compiler: null,

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.compiler = new Compiler()

        atom.workspace.observeTextEditors((editor) => {
            const editorSubscriptions = new CompositeDisposable();
        
            let cEditor = null;
        
            const initialiseCEditor = () => {
                cEditor = new CEditor({
                    editor,
                    compiler: this.compiler
                });
                editor.cEditor = cEditor;
            };
        
            editorSubscriptions.add(editor.onDidChangeGrammar((grammar) => {
                if (grammar.name === 'C') {
                    initialiseCEditor();
                } else {
                    if (cEditor) {
                        cEditor.destroy();
                    }
                    cEditor = null;
                }
            }));
        
            if (editor.getGrammar().name === 'C') {
                initialiseCEditor();
            }
        
            editorSubscriptions.add(editor.onDidDestroy(() => {
                delete editor.cEditor;
                editorSubscriptions.dispose();
                if (cEditor) {
                    cEditor.destroy();
                }
                this.subscriptions.remove(editorSubscriptions);
            }))
        
            this.subscriptions.add(editorSubscriptions)
        })
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    provide() {
        return [
            new CProvider(this.compiler)
        ];
    },

    getCHeaders() {
        if (this.cHeaders) {
            return this.cHeaders;
        }
    }
};
