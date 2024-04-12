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

        const includes_raw_args = raw_html.match(includes_regex);
        includes_raw_args.forEach((str, index) => {
            includes_raw_args[index] = str.slice(2, -2)
        });
    
        const filenames = []
        includes_raw_args.forEach((str, index) => {
            filenames[index] = str.split(", ")[0]
            console.log(filenames[index])
        });
    
        const includes_args = []
        includes_raw_args.forEach((str, index) => {
            const args = []
    
            const string_args = str.split(", ")
            string_args.splice(0, 1) // remove filename
    
            string_args.forEach((str, index) => {
                //splitted_args = str.split("=")
                //const key = splitted_args[0]
                //const value = splitted_args[1]
                args[index] = str.split("=")
            })
    
            includes_args[index] = args
        })
    
        new_html = new_html.replace(dev_script_regex, "")
    
        const promises = []
    
        for (let i = 0; i < filenames.length; i++) {
            const replace_pattern = includes_matches[i];
            const filename = filenames[i];
            const file_args = includes_args[i];
    
            if (includes_cache[filename]) {
                promises[i] = new Promise((resolve) => {
                    const element_data = includes_cache[filename]
                    new_html = new_html.replace(replace_pattern, element_data)
                    resolve()
                })
            } else {
                promises[i] = readFile('./includes/' + filename).then((data) => {
                    const element_data = data.toString()

                    // process arguments
                    var proccessed_data = new_html.replace(replace_pattern, element_data)
                    if (file_args.length > 0) {
                        for (let arg_i = 0; arg_i < file_args.length; arg_i++) {
                            const arg_data = file_args[arg_i];
                            const key = arg_data[0];
                            const value = arg_data[1];

                            proccessed_data = proccessed_data.replace(`[{${key}}]`, value)
                            console.log("lefart")
                        }
                    }

                    new_html = proccessed_data
                    includes_cache[filename] = proccessed_data
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