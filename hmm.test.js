const { printMap, spanishSpeaking, totalSeats, flight, columns, makeColumns, randomMessage, makeRows} = require("./hmm");
global.console.log = jest.fn();

test('Spanish speaking', () => {
    expect(spanishSpeaking()).toBeFalsy();
});

test('prints randomn message', () => {
    let message = randomMessage();
    let expectedMessage = /((AQUI NO!)|(A MAMARLA!)|(TU FUERA!))/;
    expect(message).toMatch(expectedMessage) 
});

test('expect makeRows to return flightSeats', () => {
    let seats = makeRows();
    expect(seats).toEqual(totalSeats);
});

test('rows are attached to flight objects', () => {
    expect(flight).toHaveProperty("flight_seats", makeRows());
});

test('tests makeColumns to return columns', () => {
    let columnsReturned = makeColumns();
    expect(columnsReturned).toEqual(columns);
});

test('expect flight object to have another key-value pair for columns', () => {
     expect(flight).toHaveProperty('flight_columns', columns);
}); 

test('should be defined', () => {
    expect(printMap).toBeDefined();
});

test('expect it not to be array', () => {
    expect(printMap).not.toBe(Array);
});