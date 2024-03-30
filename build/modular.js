const fs = require('fs');
const { promisify } = require('util');

const config = require("./config.json")
const scanForIncludes = config.scanForIncludes

const includes_regex = /\[\{(.*?)\}\]/g;
const dev_script_regex = /<script src=".*modularDev\.js"><\/script>/g

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

// includes are static, lets lazy cache them
const includes_cache = {}

for (let i = 0; i < scanForIncludes.length; i++) {
    const html_filepath = scanForIncludes[i];

    console.log("Build: " + html_filepath + " initializing")
    readFile(html_filepath).catch(console.error).then((data) => {
        // Transform data Buffer to string.
        const raw_html = data.toString();
        let new_html = raw_html
    
        const includes_matches = raw_html.match(includes_regex);
    
        const filenames = raw_html.match(includes_regex);
        filenames.forEach((str, index) => {
            filenames[index] = str.slice(2, -2)
        })
    
        new_html = new_html.replace(dev_script_regex, "")
    
        const promises = []
    
        for (let i = 0; i < filenames.length; i++) {
            const replace_pattern = includes_matches[i];
            const filename = filenames[i];
    
            if (includes_cache[filename]) {
                promises[i] = new Promise((resolve) => {
                    const element_data = includes_cache[filename]
                    new_html = new_html.replace(replace_pattern, element_data)
                    resolve()
                })
            } else {
                promises[i] = readFile('./includes/' + filename).then((data) => {
                    const element_data = data.toString()
                    includes_cache[filename] = element_data
                    new_html = new_html.replace(replace_pattern, element_data)
                }).catch(() => {
                    new_html = new_html.replace(replace_pattern, "Failed to load: " + filename)
                })
            }
        }
    
        // html has been injected
        Promise.allSettled(promises).then(() => {
            console.log("Build: " + html_filepath + " success!")
            writeFile(html_filepath, new_html)
        })
    })
}