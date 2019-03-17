const csv = require('fast-csv');
const fs = require('fs');
const stream = fs.createReadStream("data2.csv");

var selectedFlight = [];
var badData = [];
var bPassangers = [];
var coachPassangers = [];

csv
 .fromStream(stream, {ignoreEmpty: true, headers : true})
 .validate(function(data){
     // conditipns for nationality and name 
    if(!data.first_name || !data.second_name || !data.nationality){
        let badDatas = data
        badData.push(badDatas);
    };
    let newObj;
    destination = data.flight_destination == "JFK";
    // forbidden objects
    if(!data.objects.includes("sombrero", "water", "soap", "batteries", "firearm") && destination && data.nationality && data.first_name && data.second_name){ 
        newObj = data;
        selectedFlight.push(newObj)
        // object that stores all the passangers that match 
     } else if(data.objects.includes("parrot" && destination)){
        // exception - if they carry a parrot along with any of the forbidden objects -- allowed
        let nextObj = data
        selectedFlight.push(nextObj)
     };
     // exception - if they carry only a sombrero and are mexicans going to JFK -- allowed
     if(data.objects == "sombrero" && data.nationality == "Mexican" && destination ){
        selectedFlight.push(data);
     }; 
})
 .on("data-invalid", function(){
    console.log(randomMessage());
})
 .on("data", function (){
})
 .on("end", function(){
    addGreeting();
    separatePassangers();
    seatingAppForBusiness();
    seatingAppForTheRest();
    allPassangers = bPassangers.concat(coachPassangers);
    printMap();
   
 });

// generate random message if passangers cant seat
function randomMessage() {
    let cantSeat = [ 'A MAMARLA!', 'TU FUERA!', 'AQUI NO!'];
    let randomNumber = Math.floor(Math.random()*cantSeat.length);
    let randomMessage = cantSeat[randomNumber];
    return randomMessage;
};

// passangers introduce themselves before being seated
// maybe shouldnt be a key-val pair in the passangers objects
function addGreeting(){
    // loop through all of the passagners and add the message in a new key value, with differencies if Spanish speaking
    for(i = 0; i < selectedFlight.length; i++){
        let nationality = selectedFlight[i].nationality;
        let name = selectedFlight[i].first_name;
        let lastName = selectedFlight[i].second_name;
        let team = selectedFlight[i].favorite_team;
        if(spanishSpeaking(nationality) && team){
            console.log(`Hola, soy ${randomName(name, lastName)} y soy del ${team}.`); 
        } else if(spanishSpeaking(nationality)) {
            console.log(`Hola, soy ${randomName(name, lastName)} y no me gusta el futbol.`);
        } else if (team){
            console.log(`Hey, I'm ${name} and I support ${team}.`);
        } else {
            console.log(`Hey, I'm ${name}.`);
        };
    };
};

function spanishSpeaking (nationality) {
    return (nationality == "Mexican") || (nationality == "Spanish") || (nationality == "Colombian");
};

// generate random name
function randomName(name, lastName) {
    let names = [name, lastName];
    let randomNr = Math.floor(Math.random()*names.length);
    let randomName = names[randomNr];
    return randomName;
};

// generate seats - in rows - unused
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

// flight object - first four keys are unused
let flight = {
    flight_code: "KL2345",
    flight_destination: "JFK",
    plane_model: 'A380',
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

// rest of the passagners need to seat from front to back
seatingForTheRest = flight.flight_columns.slice(18);
seatingForTheRestReversed = seatingForTheRest.reverse();
middleSeatsOnly = []; 
let getMiddleSeatsOnly = () => {
    for(x = 0; x < seatingForTheRestReversed.length; x++){
        if (x % 3 === 1) {
            middleSeatsOnly.push(seatingForTheRestReversed[x]);
        };
    };
    return middleSeatsOnly;
}
getMiddleSeatsOnly();

// separate the Business passangers from coach passangers
let separatePassangers = () => {
    for (i = 0; i < selectedFlight.length; i++ ){
        if(selectedFlight[i].is_business === "true") {
            let bPass = selectedFlight[i];
            bPassangers.push(bPass);
        } else if(selectedFlight[i].is_business === "false"){
            let coachPass = selectedFlight[i];
            coachPassangers.push(coachPass);
        };
    }; 
};

// assign seats to business passangers
let seatingAppForBusiness = () => {
    for(i = 0, j = 0; j < seatingForBusinessWithoutMiddleSeat.length, i < bPassangers.length; j++, i++){
        if(bPassangers[i].is_business === "true" ){
            bPassangers[i].seat = seatingForBusinessWithoutMiddleSeat[j];
        };
        console.log(bPassangers[i].first_name + " "  + bPassangers[i].second_name + " A LA " + bPassangers[i].seat)
    };
};

// assign seats to coach passangers
let seatingAppForTheRest = () => {
    for(l = 0, k = 0, m = 0; k < seatingForTheRestReversed.length, m < middleSeatsOnly.length, l < coachPassangers.length; k++, l++, m++){
        if(coachPassangers[l].is_business === "false" && coachPassangers[l].favorite_team === "RM" ){
            // if coach passangers are RM fans, must sit in middle seats
            coachPassangers[l].seat = middleSeatsOnly[m];
        } else {
            coachPassangers[l].seat = seatingForTheRestReversed[k];
        };
        console.log(coachPassangers[l].first_name + " "  + coachPassangers[l].second_name + " A LA " + coachPassangers[l].seat)
    };
};

// print a map with the initials of each passangers and the corresponding seat
let printMap = () => {
    for(i = 0; i < allPassangers.length; i++) {
        console.log(allPassangers[i].first_name[0] + "." + allPassangers[i].second_name[0] + "." + " " + allPassangers[i].seat)
    };
};
