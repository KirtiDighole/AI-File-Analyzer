const pdfParse = require('pdf-parse');
const csv = require('csv-parser');
const { Readable } = require('stream');

async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(JSON.stringify(results, null, 2)))
      .on('error', reject);
  });
}

module.exports = { parsePDF, parseCSV };
