async function llmRequest(request) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mistral",
                prompt: request,
                stream: "false"
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;  // If you want to propagate the error outside
    }
}

async function dataHandler(data) {
    console.log("------- Data received: -------")
    console.log(data);

    
    // Create 3 separate lines for explainString:
    // TODO: DIVIDE THIS BY CHARACTER, 21 CHARACTERS PER LINE
    let lineWords = explainString.split(/\s+/); // Split the string into words

    let explainString1 = "", explainString2 = "", explainString3 = "";

    if (lineWords.length > 0) {
        explainString1 = lineWords.slice(0, 4).join(' '); // First 4 words
    }
    if (lineWords.length > 4) {
        explainString2 = lineWords.slice(4, 8).join(' '); // Next 4 words
    }
    if (lineWords.length > 8) {
        explainString3 = lineWords.slice(8).join(' '); // Remaining words
    }

    if (match) {
        console.log("match positive: " + match)
        let evalScore = parseInt(match[1], 10);
        console.log("evalScore = " + evalScore);
        console.log("explainString = " + explainString);
        alertHandler(evalScore, explainString1, explainString2, explainString3);
    }
    else {
        console.log("match negative: " + match)
        console.log("no data score provided");
    }
}