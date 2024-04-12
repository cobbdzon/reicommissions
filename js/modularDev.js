const CACHE_INCLUDES = false // set to false if editing an include
const includes_regex = /\[\{(.*?)\}\]/g;

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    const includes_matches = body.innerHTML.match(includes_regex);

    const includes_raw_args = body.innerHTML.match(includes_regex);
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

    const promises = []

    let i = 0
    async function loop_inject() {
        const replace_pattern = includes_matches[i];
        const filename = filenames[i];
        const file_args = includes_args[i];

        if (CACHE_INCLUDES && sessionStorage.getItem(filename)) {
            const element_data = sessionStorage.getItem(filename)
            body.innerHTML = body.innerHTML.replace(replace_pattern, element_data)
        } else {
            const response = await fetch('/includes/' + filename)

            if (response.ok) {
                const element_data = await response.text()
                sessionStorage.setItem(filename, element_data)

                // process arguments
                var proccessed_data = body.innerHTML.replace(replace_pattern, element_data)
                if (file_args.length > 0) {
                    for (let arg_i = 0; arg_i < file_args.length; arg_i++) {
                        const arg_data = file_args[arg_i];
                        const key = arg_data[0];
                        const value = arg_data[1];

                        proccessed_data = proccessed_data.replace(`[{${key}}]`, value)
                        console.log("lefart")
                    }
                }

                body.innerHTML = proccessed_data
                console.log("farted")
            } else {
                body.innerHTML = body.innerHTML.replace(replace_pattern, "Failed to load: " + filename)
            }
        }

        if (i < filenames.length) {
            i = i + 1
            loop_inject()
        }
    }

    loop_inject()

    Promise.allSettled(promises).then(() => {
        console.log("lecabron")
    })
})