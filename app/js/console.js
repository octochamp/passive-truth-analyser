document.addEventListener('DOMContentLoaded', function () {
    var oldConsoleLog = console.log;
    var logger = document.getElementById('consoleLog');

    console.log = function (message) {
        if (typeof message == 'object') {
            logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
        } else {
            logger.innerHTML += message + '<br />';
        }
        logger.scrollTop = logger.scrollHeight; // Auto-scroll to latest log entry
        oldConsoleLog.apply(console, arguments);
    };

    // Example usage
    console.log("This is a test message.");
    console.log({ objKey: 'objValue' });
});
