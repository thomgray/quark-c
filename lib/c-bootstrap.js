'use babel';

import { execSync } from 'child_process';
import fs from 'fs';

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
}

const getHeaderFilesInDirectory = (dir) => {
    const files = fs.readdirSync(dir)
        .filter(file => file.match(/\.h$/));
    return {dir, files};
}

export default function() {
    const rawResult = execSync(cPathsCommand).split('\n');
    return getPathsOnly(rawResult);
    // return execSync(cPathsCommand, (err, stdout, stderr) => {
    //     const cSearchPaths = getPathsOnly(stdout.split('\n'));
    //     callback({cSearchPaths})
    // });
}