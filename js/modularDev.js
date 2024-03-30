const includes_regex = /\[\{(.*?)\}\]/g;

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    const includes_matches = body.innerHTML.match(includes_regex);

    const filenames = body.innerHTML.match(includes_regex);
    filenames.forEach((str, index) => {
        filenames[index] = str.slice(2, -2)
    });

    const promises = []

    let i = 0
    async function loop_inject() {
        const replace_pattern = includes_matches[i];
        const filename = filenames[i];

        if (sessionStorage.getItem(filename)) {
            const element_data = sessionStorage.getItem(filename)
            body.innerHTML = body.innerHTML.replace(replace_pattern, element_data)
        } else {
            const response = await fetch('/includes/' + filename)

            if (response.ok) {
                const element_data = await response.text()
                sessionStorage.setItem(filename, element_data)
                body.innerHTML = body.innerHTML.replace(replace_pattern, element_data)
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