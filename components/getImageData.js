const axios = require('axios');

async function getImageData(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = response.data;
    const blob = new Blob([buffer], { type: 'image/png' }); // Adjust the MIME type if necessary
    return blob;
  } catch (error) {
    console.error('Error fetching image data:', error);
    throw error;
  }
}

module.exports = {getImageData};