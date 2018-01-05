'use babel';

import fs from 'fs';
import { execSync } from 'child_process';
import HeaderFile from './header-file';

const cPathsCommand = 'gcc -v -E - < /dev/null 2>&1 | sed -ne \'/starts here/,/End of/p\' | grep "^ /" | sed -ne "s/^ //p"';

const pathPattern = /([a-zA-Z0-9.\/]|\\ )+/;

const getPathsOnly = (paths) => {
    return paths
        .map((path) => {
            let match = pathPattern.exec(path);
            if (match) {
                return match[0];
            }
        })
        .filter(path => path && path.length > 0)
        .map(getHeaderFilesInDirectory)
        .filter(fileObj => fileObj.files.length > 0);
};

const getHeaderFilesInDirectory = (dir) => {
    const files = fs.readdirSync(dir)
        .filter(file => file.match(/\.h$/));
    return {dir, files};
};

const getSearchPaths = () => {
    const rawResult = execSync(cPathsCommand, {encoding: 'utf8'});
    return getPathsOnly(rawResult.split('\n'));
};

export default class Compiler {
    constructor() {
        this.cSearchPaths = getSearchPaths();
        this.headerFiles = [];
    }

    getHeaderFile(headerFileName) {
        let headerFileObject = this.headerFiles.find((header) => {
            header.name === headerFileName;
        });
        if (headerFileObject) {
            return headerFileObject;
        }

        const headerFilePath = this.getPathForHeaderFile(headerFileName);
        if (headerFilePath) {
            headerFileObject = new HeaderFile({
                name: headerFileName,
                path: headerFilePath
            });
            this.headerFiles.push(headerFileObject);
            return headerFileObject;
        }
    }

    getPathForHeaderFile(headerFileName) {
        for (var i = 0; i < this.cSearchPaths.length; i++) {
            const {dir, files} = this.cSearchPaths[i];
            if (files.includes(headerFileName)) {
                return `${dir}/${headerFileName}`;
            }
        }
    }
}
