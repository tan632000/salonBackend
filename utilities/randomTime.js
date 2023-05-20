// Set the range of hours for the random time
let startHour = 9; // start hour (inclusive)
let endHour = 17; // end hour (exclusive)

// Get a random hour within the range
let randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;

// Create a new Date object with the random hour
let randomDate = new Date();
randomDate.setHours(randomHour);

// Format the date in the desired format
const formattedDate = randomDate.getDate() + ':' + (randomDate.getMonth()+1) + ':' + randomDate.getFullYear() + ' ' + randomDate.getHours() + ':' + randomDate.getMinutes() + ':' + randomDate.getSeconds();

module.exports = formattedDate