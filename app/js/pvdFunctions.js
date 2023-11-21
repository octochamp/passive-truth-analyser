function splitTextIntoLines(explanation) {
    const maxLineLength = 20;
    const words = explanation.split(' ');
    const lines = ['', '', '', '', ''];
  
    let currentLineIndex = 0;
    let currentLineLength = 0;
  
    for (const word of words) {
        if (currentLineIndex === 4 && currentLineLength + word.length + 3 > maxLineLength) {
            // If we're on the fifth line and can't fit the current word + "..."
            lines[currentLineIndex] += '...';
            break;
        }
      
        if (currentLineLength + word.length + (currentLineLength > 0 ? 1 : 0) <= maxLineLength) {
            // Add the word to the current line with a space if it's not the first word
            lines[currentLineIndex] += (currentLineLength > 0 ? ' ' : '') + word;
            currentLineLength += word.length + (currentLineLength > 0 ? 1 : 0);
        } else {
            // Move to the next line
            currentLineIndex++;
            currentLineLength = 0;
            // Add the word to the new line
            lines[currentLineIndex] = word;
            currentLineLength = word.length;
        }
    }

    // If we reached the end of the words array without adding '...', add it to the fifth line
    if (currentLineIndex === 4 && !lines[4].endsWith('...')) {
        lines[4] += '...';
    }
  
    // Assign the lines to the variables
    const [expStr1, expStr2, expStr3, expStr4, expStr5] = lines;
  
    return { expStr1, expStr2, expStr3, expStr4, expStr5 };
}

function contentBuilder(evaluation) {
    switch(evaluation) {
        case "0":
            return { colour: "1,0,0", vibrate: "1280", text1: "TOTALLY", text2: "INACCURATE", lines: 2, lcd:"on" }
        case "1":
            return { colour: "0.75,0,0", vibrate: "640", text1: "INCORRECT", text2: "", lines: 1, lcd:"on" }
        case "2":
            return { colour: "0.5,0,0.25", vibrate: "320", text1: "SEEMS", text2: "WRONG", lines: 2, lcd:"on" }
        case "3":
            return { colour: "0.25,0,0.5", vibrate: "160", text1: "MAYBE", text2: "FALSE", lines: 2, lcd:"on" }
        case "4":
            return { colour: "0,0,1", vibrate: "80", text1: "UNSURE", text2: "", lines: 1, lcd:"on" }
        case "5":
            return { colour: "0,0,1", vibrate: "80", text1: "AMBIGUOUS", text2: "", lines: 1, lcd:"on" }
        case "6":
            return { colour: "0,0.25,0.5", vibrate: "40", text1: "MAYBE", text2: "", lines: 1, lcd:"on" }
        case "7":
            return { colour: "0,0.5,0.25", vibrate: "20", text1: "SEEMS", text2: "RIGHT", lines: 2, lcd:"on" }
        case "8":
            return { colour: "0,0.75,0", vibrate: "10", text1: "CORRECT", text2: "", lines: 1, lcd:"on" }
        case "9":
            return { colour: "0,1,0", vibrate: "5", text1: "TOTALLY", text2: "ACCURATE", lines: 2, lcd:"on" }
        default:
            console.warn("Unexpected evaluation value:", evaluation);
            return {
                colour: "1,1,1", // default values
                vibrate: "80",
                text1: "Unexpected",
                text2: "Value",
                lines: 2,
                lcd: "on"
            };
    }
}

async function dataHandler(data) {
    let parsedData = JSON.parse(data);
    console.log("");
    console.log("------- New data received, beginning handler process");

//----- IGNORE EMPTY DATA FROM WEBSOCKET -----
    if (!parsedData.eval) {
        console.warn("Incomplete data received, ignoring...");
        return; // exit the function early
    }

    let request = parsedData.request
    let evaluation = parsedData.eval
    let explanation = parsedData.explanation
    console.log("Statement: '" + request + "'");

    if (evaluation === "X") {
        explanation = "..."
        let content = {
            colour: "1,0.25,0.9",
            vibrate: "1",
            text1: "No",
            text2: "Response",
            lines: 2,
            lcd: "off"
        }
        alertHandler(content.colour, content.vibrate, content.text1, content.text2, content.lines, content.lcd, evaluation, explanation);
    } else {
        if (explanation) {
            const { expStr1, expStr2, expStr3, expStr4 } = splitTextIntoLines(explanation);
        }
        let content = contentBuilder(evaluation)
        alertHandler(content.colour, content.vibrate, content.text1, content.text2, content.lines, content.lcd, evaluation, explanation);
    }
}