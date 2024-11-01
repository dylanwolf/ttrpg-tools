import x, { getLastCommit } from 'git-last-commit'
import { fileURLToPath } from 'url';
import fs from 'fs'
import path from 'path'

getLastCommit((err, commit) => {
    try {
        const commitDate = commit.committedOn
        const dateObj = new Date(commitDate*1000)
        const dateStr = dateObj.toLocaleString()

        if (commitDate && dateObj && dateStr)   {
            const code = `export const VERSION = "${dateStr} UTC";`
            const baseFilename = fileURLToPath(import.meta.url)
            const fullFilename = path.join(path.dirname(baseFilename), 'src/version.ts')

            fs.writeFileSync(fullFilename, code)
        }
    }
    catch (ex) {

    }    
})