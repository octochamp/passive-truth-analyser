function splitTextIntoLines(explanation) {
    const maxLineLength = 20;
    const words = explanation.split(' ');
    const lines = ['', '', '', ''];
  
    let currentLineIndex = 0;
    let currentLineLength = 0;
  
    for (const word of words) {
      if (currentLineLength + word.length + (currentLineLength > 0 ? 1 : 0) <= maxLineLength) {
        // Add the word to the current line with a space if it's not the first word
        lines[currentLineIndex] += (currentLineLength > 0 ? ' ' : '') + word;
        currentLineLength += word.length + (currentLineLength > 0 ? 1 : 0);
      } else {
        // Move to the next line
        currentLineIndex++;
        currentLineLength = 0;
  
        // If we've reached the fourth line, add an ellipsis and break
        if (currentLineIndex >= 3) {
          lines[currentLineIndex] = '...';
          break;
        }
  
        // Add the word to the new line
        lines[currentLineIndex] = word;
        currentLineLength = word.length;
      }
    }
  
    // Assign the lines to the variables
    const [expStr1, expStr2, expStr3, expStr4] = lines;
  
    return { expStr1, expStr2, expStr3, expStr4 };
  }

function contentBuilder(evaluation) {
    switch(evaluation) {
        case "0":
            return { colour: "1,0,0", vibrate: "5", text1: "Totally", text2: "inaccurate", lines: 2 }
        case "1":
            return { colour: "0.75,0,0", vibrate: "10", text1: "Incorrect", text2: "", lines: 1 }
        case "2":
            return { colour: "0.5,0,0.25", vibrate: "20", text1: "Seems", text2: "wrong", lines: 2 }
        case "3":
            return { colour: "0.25,0,0.5", vibrate: "40", text1: "Sketchy", text2: "", lines: 1 }
        case "4":
            return { colour: "0,0,1", vibrate: "80", text1: "Not", text2: "sure?", lines: 2 }
        case "5":
            return { colour: "0,0,1", vibrate: "160", text1: "Ambiguous", text2: "", lines: 1 }
        case "6":
            return { colour: "0,0.25,0.5", vibrate: "320", text1: "Maybe", text2: "", lines: 1 }
        case "7":
            return { colour: "0,0.5,0.25", vibrate: "640", text1: "Seems", text2: "right", lines: 2 }
        case "8":
            return { colour: "0,0.75,0", vibrate: "1280", text1: "Correct", text2: "", lines: 1 }
        case "9":
            return { colour: "0,1,0", vibrate: "2560", text1: "Totally", text2: "accurate", lines: 2 }
    }
}

async function dataHandler(data) {
    let parsedData = JSON.parse(data);
    console.log("------- Data received: -------")
    console.log(parsedData);
    let request = parsedData[0]
    let evaluation = parsedData[1]
    let explanation = parsedData[2]

    if (evaluation === "X") {
        console.log("Request: " + request);
        console.log("Evaluation: " + evaluation);
        let content = {
            colour: "0.5, 0.5, 0.5",
            vibrate: "0",
            text1: "Nothing to process",
            text2: "",
            lines: 1
        }
        alertHandler(content.colour, content.vibrate, content.text1, content.text2, content.lines, explanation);
    }
    else {
        console.log("Request: " + request);
        console.log("Evaluation: " + evaluation);
        console.log("Explanation:");
        const { expStr1, expStr2, expStr3, expStr4 } = splitTextIntoLines(explanation);
        console.log(expStr1);
        console.log(expStr2);
        console.log(expStr3);
        console.log(expStr4);
        let content = contentBuilder(evaluation)
        alertHandler(content.colour, content.vibrate, content.text1, content.text2, content.lines, explanation);
    }
}

async function testDataHandler(request, evaluation, explanation) {
    console.log("Evaluation: " + evaluation);
    console.log("Explanation: " + explanation);

    if (evaluation === "X") {
        console.log("Request: " + request);
        console.log("Evaluation: " + evaluation);
        let content = {
            colour: "0.5, 0.5, 0.5",
            vibrate: "0",
            text1: "Nothing to process",
            text2: "",
            lines: 1
        }
        alertHandler(content.colour, content.vibrate, content.text1, content.text2, content.lines, explanation);
    }
    else {
        console.log("Request: " + request);
        console.log("Evaluation: " + evaluation);
        console.log("Explanation:");
        const { expStr1, expStr2, expStr3, expStr4 } = splitTextIntoLines(explanation);
        console.log(expStr1);
        console.log(expStr2);
        console.log(expStr3);
        console.log(expStr4);
        let content = contentBuilder(evaluation)
        alertHandler(content.colour, content.vibrate, content.text1, content.text2, content.lines, explanation);
    }
}