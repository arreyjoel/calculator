function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        return 'error';
    }
    return a / b;
}

function operate(operator, num1, num2) {
    switch (operator) {
        case '+':
            return add(num1, num2);
        case '-':
            return subtract(num1, num2);
        case '*':
            return multiply(num1, num2);
        case '/':
            return divide(num1, num2);
        case '':
            // if there is no operator, we return the first number
            return num1;
    }
}

// Main variable to hold the states of the calculator
const memory = {
    'displayString': '0',
    'displayNumber': 0,
    'numberStored': 0,
    'lastOperator': '',
    'operationCount': 0,
    'isDecimalActive': false
}

// Set up event listeners
const numbers = document.querySelectorAll('button[class="number"]');
const operators = document.querySelectorAll('button[class="operator"]');
const clear = document.querySelector('button[class="clear"]');
const decimal = document.querySelector('button[class="decimal"]');
const equalSign = document.querySelector('button[class="equal-sign"]');
const backspace = document.querySelector('button[class="backspace"]');

document.addEventListener('keypress', handleKeypress);
document.addEventListener('keydown', handleKeydown) // backspaced is not picked up by keypress

numbers.forEach(number => {number.addEventListener('click', handleNumbers)});
operators.forEach(operator => {operator.addEventListener('click', handleOperators)});
clear.addEventListener('click', handleClear);
equalSign.addEventListener('click', handleEquals);
decimal.addEventListener('click', handleDecimal);
backspace.addEventListener('click', handleBackspace);

function handleNumbers(eventOrNumber) {
    
    // Handle the button press for all number buttons and keys
    let number;

    if (eventOrNumber.type === 'click') {
        number = parseInt(this.value)
    }
    else {
        number = eventOrNumber;
    }
    // if we do a click event the variable will be an event 
    // but if we keypress, a number is passed

    const isDecimalActive = memory.isDecimalActive;
    const displayNumber = memory.displayNumber;

    if (displayNumber === 0) {
        if (isDecimalActive) {
            // if current display is 0 and decimal is pressed then we need to
            // continue adding numbers
            memory.displayNumber = parseFloat('0' + '.' + number.toString());
            memory.isDecimalActive = false;
        }
        else {
            // otherwise we replace the 0 (so we dont end up with 091232)
            memory.displayNumber = number;
        }
    }
    else if (displayNumber % 1 === 0 && isDecimalActive) {
        // if currently displayed number is int, but decimal was pressed
        // then we need to convert to float
        memory.displayNumber = parseFloat(displayNumber.toString() + '.' + number.toString());
        memory.isDecimalActive = false;
    }
    else {
        // any other case, we are safe to parseFloat because it will return an int if there are no decimals
        memory.displayNumber = parseFloat(displayNumber.toString() + number.toString());
    }

    updateDisplay()
}

function handleOperators() {

    // Handle all operation keys (-, +, *, /)
    
    memory.operationCount++;
    // We need to keep track of this, because if it is the first
    // operation then what we do is different

    const operator = memory.lastOperator || this.value;
    // if there was already an operator, we use that
    // (eg. for 8 x 8 x 8 x 8 without = sign)

    if (memory.operationCount < 2) {
        memory.numberStored = memory.displayNumber;
        // if its the first operation, 
        // we just store the current number from display
    }
    else {
        // otherwise we need to make an operation
        // and store the result in memory

        memory.numberStored = operate(operator, memory.numberStored, memory.displayNumber);
        memory.displayNumber = memory.numberStored;

    }

    updateDisplay();

    // reset display number (if user presses a button again)
    // and set last operator
    memory.displayNumber = 0;
    memory.lastOperator = this.value;
}

function handleClear() {

    // just resets the memory and updates screen

    memory.displayString = 0;
    memory.displayNumber =  0;
    memory.numberStored = 0;
    memory.lastOperator = '';
    memory.operationCount = 0;
    memory.isDecimalActive = false;
    updateDisplay();
}

function handleEquals() {

    const result = operate(memory.lastOperator, memory.numberStored, memory.displayNumber);
    memory.displayNumber = result;
    updateDisplay();
    memory.operationCount = 0; 
    // if equal is pressed, opcount needs to be reset otherwise we 
    // do an operation with the number on screen and the number in memory
    // if we press an operator afterwards
}

function handleDecimal() {

    // setting the state which updateDisplay and handleNumbers depend on

    if (!memory.isDecimalActive){
        memory.isDecimalActive = true;
    }
    else {
        memory.isDecimalActive = false;
    }
    updateDisplay();
}

function handleBackspace() {

    // delete currently displayed number
    memory.displayNumber = 0;
    updateDisplay();
}

function updateDisplay() {

    // called after each button press
    // converts displayNumber to a string fit to be displayed on screen

    const screen = document.querySelector('input[class="calculator-screen"]'); 

    const displayNumber = memory.displayNumber;
    const displayNumberLength = displayNumber.toString().length;

    if (displayNumberLength < 11) {
        // If its not too long we can just parseFloat as a fixed decimal 
        // (to get rid of trailing 0s) and then convert to string
        // We dont need to handle float vs int because parseFloat does that already
        memory.displayString = parseFloat(displayNumber.toFixed(11)).toString();
    }
    else {
        // Otherwise we convert to exponential (making sure the 'e-10' part still fits)
        memory.displayString = displayNumber.toExponential(7);
    }

    screen.value = memory.displayString;
    
}

function handleKeypress(e) {

    const keyCode = e.keyCode;
    
    if (keyCode >= 48 && keyCode <= 57) {
        // numbers 0 - 9
        handleNumbers(parseInt(e.key));
    }
    else if (keyCode === 13 || keyCode === 32) {
        // Enter or space
        handleEquals()
    }
    else if (keyCode === 46) {
        // dot
        handleDecimal()
    }
}

function handleKeydown(e) {

    const keyCode = e.keyCode;
    
    if (keyCode === 8) {
        handleBackspaced()
    }
}