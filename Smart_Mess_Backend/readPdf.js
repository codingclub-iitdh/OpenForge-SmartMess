const fs = require('fs');
const pdfParse = require('pdf-parse');
console.log('pdfParse type:', typeof pdfParse);
if (typeof pdfParse === 'object') {
    console.log('Keys:', Object.keys(pdfParse));
}
const dataBuffer = fs.readFileSync('C:/Users/Mahesh/OneDrive/Desktop/SmartMess/revised mess menu.pdf');

try {
    const fn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
    fn(dataBuffer).then(function(data) {
        console.log(data.text);
    });
} catch(err) {
    console.error(err);
}
