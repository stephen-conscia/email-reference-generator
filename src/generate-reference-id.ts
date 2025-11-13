// Reference ID example [J4L5/250917/101545]


export default function generateReference() {

  // Generate random string in the following format: character, number, character, number
  var randomString = '';
  var randomStringLength = 4; // Can be increased if required (regex must be updated to match if changed)

  for (let i = 0; i < randomStringLength; i++) {
    if (i % 2 === 0) {
      // Append random character between A-Z on even index
      randomString += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    } else {
      // Append random digit between 0-9 on odd index
      randomString += Math.floor(Math.random() * 10);
    }
  }

  // Generate date string
  var date = new Date();
  var year = date.getFullYear().toString().slice(-2);
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  var dateString = year + month + day;

  // Generate time string
  var hours = ('0' + date.getHours()).slice(-2);
  var minutes = ('0' + date.getMinutes()).slice(-2);
  var seconds = ('0' + date.getSeconds()).slice(-2);
  var timeString = hours + minutes + seconds;

  return `[Ref:${randomString}/${dateString}/${timeString}]`;
}
