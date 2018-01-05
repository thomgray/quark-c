'use babel';


const signatureSnippet = (signature) => {
    const snippets = signature.map((arg, i) => `\${${i+1}:${arg}}`);
    return snippets.join(', ');
}

const getMethodSuggestion = ({name, type, signature}) => ({
    snippet: `${name}(${signatureSnippet(signature)})`,
    type: 'function',
    description: `${type} ${name}(${signature.join(', ')})`
});

export default class CProvider {
    constructor(compiler) {
        this.compiler = compiler;
        this.selector = '.source.c';
        this.disableForSelector = '.source.c .comment';
        this.inclusionPriority = 1;
        this.suggestionPriority = 2;
        this.filterSuggestions = true;
    }

    getSuggestions({editor, bufferPosition, scopeDescriptor, prefix}) {
        return new Promise((resolve) => {
            const cEditor = editor.cEditor;
            if (cEditor) {
                const imports = cEditor.imports;
                let suggestedMethods = [];
                imports.forEach((header) => {
                    suggestedMethods = suggestedMethods.concat(header.getCandidateFunctions(prefix));
                    resolve(suggestedMethods.map(getMethodSuggestion));
                });
            }
            resolve([]);
        });
    }
}
