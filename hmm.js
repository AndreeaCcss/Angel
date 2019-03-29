const csv = require('fast-csv');
const fs = require('fs');
var clc = require("cli-color");
const stream = fs.createReadStream("data2.csv");

var selectedFlight = [];
var badData = [];
var businessPassengers = [];
var coachPassengers = [];

csv
 .fromStream(stream, {ignoreEmpty: true, headers : true})
 .validate(function(data){
     // conditions for nationality and name 
    if(!data.first_name || !data.second_name || !data.nationality){
        let badDatas = data
        badData.push(badDatas);
    };
    // destination receives input in the terminal, but must match the data file
    destination = data.flight_destination === process.argv[2];
    data.objects = data.objects.toLowerCase();
    data.objects = data.objects.split("-");
    if(!data.objects.includes("sombrero") && !data.objects.includes("firearm") && !data.objects.includes("water") && !data.objects.includes("soap") && !data.objects.includes("batteries") && destination && data.nationality && data.first_name && data.second_name){  
        let newObj = data;
        selectedFlight.push(newObj)
        // object that stores all the passangers that match 
    }else if(data.objects.includes("parrot") && destination){
        // exception - if they carry a parrot along with any of the forbidden objects -- allowed
        let nextObj = data
        selectedFlight.push(nextObj)
        // exception - if they carry only a sombrero and are mexicans going to JFK -- allowed
    } else if(data.objects.includes("sombrero") && !data.objects.includes("firearm") && !data.objects.includes("water") && !data.objects.includes("soap") && !data.objects.includes("batteries") && data.nationality == "Mexican" && destination ){
        selectedFlight.push(data);
    }; 

})
 .on("data-invalid", function(){
    console.log(clc.green.bold(randomMessage())); 
})
 .on("data", function (){
})
 .on("end", function(){
    addGreeting();
    separatePassangers();
    seatingAppForBusiness();
    seatingAppForTheRest();
    allPassengers = businessPassengers.concat(coachPassengers);
    printGreetings();
    printMap();
 });

// generate random message if passangers cant seat
let randomMessage = () => {
    let cantSeat = [ 'A MAMARLA!', 'TU FUERA!', 'AQUI NO!'];
    let randomNumber = Math.floor(Math.random()*cantSeat.length);
    let randomMessage = cantSeat[randomNumber];
    return randomMessage;
};

// passangers introduce themselves before being seated
let addGreeting = () => {
    // loop through all of the passagners and add the message in a new key value, with differencies if Spanish speaking
    for(i = 0; i < selectedFlight.length; i++){
        let nationality = selectedFlight[i].nationality;
        let name = selectedFlight[i].first_name;
        let lastName = selectedFlight[i].second_name;
        let team = selectedFlight[i].favorite_team;
        if(spanishSpeaking(nationality) && team){
            selectedFlight[i].sayHello = clc.green("Hola, soy ") + clc.cyanBright.bold(randomName(name, lastName)) + clc.green(" y soy del ") + clc.yellow(team) + clc.green("."); 
        } else if(spanishSpeaking(nationality)) {
            selectedFlight[i].sayHello = clc.green("Hola, soy ") + clc.cyanBright.bold(randomName(name, lastName)) + clc.green(" y no me gusta el futbol.");
        } else if (team){
            selectedFlight[i].sayHello = clc.green("Hey, I'm " ) + clc.cyanBright.bold(name) + clc.green(" and I support ") + clc.yellow(team) + clc.green(".");
        } else {
           selectedFlight[i].sayHello = clc.green("Hey, I'm ") + clc.cyanBright.bold(name) + clc.green(".");
        };
    };
};

let spanishSpeaking  = nationality => {
    return (nationality == "Mexican") || (nationality == "Spanish") || (nationality == "Colombian");
};

// generate random name
function randomName(name, lastName) {
    let names = [name, lastName];
    let randomNr = Math.floor(Math.random()*names.length);
    let randomName = names[randomNr];
    return randomName;
};

let totalSeats = [];
let row = [1, 2, 3, 4, 5, 6];
function makeRows() {
    totalSeats.push(row);
   for (i = 0; i < 20; i++){
      row = row.map(x => x + 6)
      totalSeats.push(row)
   }
   return totalSeats;
};

// flight object - first three keys are unused
let flight = {
    flight_seats: makeRows(),
 };

let seats = flight.flight_seats;

// generate columns
let columns = [];
function makeColumns() {
    for (i = 0; i < 21; i++) {
        let items = seats[i]
        let columnA = items[0] + "A";
        let columnB = items[1] + "B";
        let columnC = items[2] + "C";
        let columnD = items[3] + "D";
        let columnE = items[4] + "E";
        let columnF = items[5] + "F";
        columns.push(columnA,columnB, columnC, columnD, columnE, columnF);
       
    };
    return columns;
};
makeColumns();
flight.flight_columns = columns;

// assign passangers that purchased business to seats 0 - 18, skipping middle seat
seatingForBusiness = flight.flight_columns.slice(0, 18);
seatingForBusinessWithoutMiddleSeat = [];
let seatingForBusinessFunction = () => { 
    for(x = 0; x < seatingForBusiness.length; x++){
        if (x % 3-1) {
            let eachSeat = seatingForBusiness[x];
            seatingForBusinessWithoutMiddleSeat.push(eachSeat)
        };
    };
    return seatingForBusinessWithoutMiddleSeat;
};
seatingForBusinessFunction();

// rest of the passagners must seat from front to back
seatingForTheRest = flight.flight_columns.slice(18);
seatingForTheRestReversed = seatingForTheRest.reverse();

/* 
middleSeatsOnly = []; 
let getMiddleSeatsOnly = () => {
    for(x = 0; x < seatingForTheRestReversed.length; x++){
        if (x % 3 === 1) {
            middleSeatsOnly.push(seatingForTheRestReversed[x]);
        };
    };
    return middleSeatsOnly;
};
getMiddleSeatsOnly();
*/

// separate the Business passangers from coach passangers
let separatePassangers = () => {
    for (i = 0; i < selectedFlight.length; i++ ){
        if(selectedFlight[i].is_business === "true") {
            let bPass = selectedFlight[i];
            businessPassengers.push(bPass);
        } else if(selectedFlight[i].is_business === "false"){
            let coachPass = selectedFlight[i];
            coachPassengers.push(coachPass);
        };
    }; 
};

// assign seats to business passangers
let seatingAppForBusiness = () => {
    for(i = 0, j = 0, k = 0; k < seatingForTheRestReversed.length, j < seatingForBusinessWithoutMiddleSeat.length, i < businessPassengers.length; j++, i++, k++){
        if(seatingForBusinessWithoutMiddleSeat[j]){
            businessPassengers[i].seat = seatingForBusinessWithoutMiddleSeat[j];
        } else {
            businessPassengers[i].seat = seatingForTheRestReversed[k];
        };
    };
};

let seatingAppForTheRest = () => {
    for(l = 0, k = 0; k < seatingForTheRestReversed.length, l < coachPassengers.length; l++, k++){
        coachPassengers[l].seat = seatingForTheRestReversed[k];
    };
};

//before being told where to sit, passengers introduce themselves
function printGreetings() {
    for( i = 0; i < allPassengers.length; i ++ ) {
        if(allPassengers[i].seat == undefined) {
            console.log(allPassengers[i].sayHello);
            console.log(clc.cyanBright.bold(allPassengers[i].first_name) + " "  + clc.cyanBright.bold(allPassengers[i].second_name) + clc.green(", on the next flight!"))
        } else {
            console.log(allPassengers[i].sayHello);
            console.log(clc.cyanBright.bold(allPassengers[i].first_name) + " "  + clc.cyanBright.bold(allPassengers[i].second_name) + clc.green (" A LA ") + clc.yellowBright.bold(allPassengers[i].seat) + clc.green("."));
        };
    };
};

// print a map with the seats of the flight
// include initials of each passangers to the corresponding seat
let printMap = () => {
    for(i = 0; i < flight.flight_columns.length; i++) {
        for(n = 0; n < allPassengers.length; n++ ){
            if(flight.flight_columns[i] == allPassengers[n].seat) {
                flight.flight_columns[i] = `[${allPassengers[n].first_name[0]}. ${allPassengers[n].second_name[0]}.]`;
            };
        };   
    };
    for(i = 0; i < flight.flight_columns.length; i++) {
        if(!flight.flight_columns[i].includes('.')) {
            flight.flight_columns[i] = '[_____]'
        };
    };
    var map = [], size = 6;
    while (flight.flight_columns.length > 0)
        map.push(flight.flight_columns.splice(0, size));
    
    var letters = "      A       B       C       D       E       F      ";
    console.log(letters);
    for (i = 0; i< map.length; i++){
        if(i < 9){
            console.log(` ${i+1} ${map[i]}`)
        } else {
            console.log(`${i+1} ${map[i]}`)
        };
    };    
};
