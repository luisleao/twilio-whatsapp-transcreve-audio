
// This is your new function. To start, set the name and path on the left.
const axios = require('axios');

function getBase64(url) {
    return axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

/*
    Salve o arquivo de credencial como um 'asset' privado (private) na sua Twilio Function.
    Caso não utilize Twilio Functions, basta salvar o nome do arquivo no env GOOGLE_APPLICATION_CREDENTIALS e remover a linha a seguir
*/

process.env.GOOGLE_APPLICATION_CREDENTIALS = Runtime.getAssets()['/ARQUIVO-CREDENCIAL.json'].path;
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();



exports.handler = async function(context, event, callback) {
	let twiml = new Twilio.twiml.MessagingResponse();
  console.log('event', event);
  
  if (event.file && event.language) {
    
    const config = {
        encoding: 'OGG_OPUS',
        sampleRateHertz: 16000,
        languageCode: event.language == '1' ? 'en-US' : 'pt-BR',
        enableAutomaticPunctuation: true,
        model: "default"
    };
        
    const audio = {
        content: await getBase64(event.file)
    };

    const request = {
        config: config,
        audio: audio,
    };
    try {
      
      const [response] = await client.recognize(request);
      let text = response.results.map( result => { return result.alternatives[0].transcript }).join('\n');
      twiml.message(text);
    } catch (e) {
      twiml.message('🇧🇷 Para receber a transcrição, você precisa encaminhar um arquivo de áudio.\nLembre-se que a duração do áudio é de até 60 segundos. \n\n🇺🇸 To receive the transcription, you need to send an audio file. Please be in mind that the audio should have until 60 seconds.')
    }
  } else {
    twiml.message('🇧🇷 Um erro aconteceu ao receber seu áudio.\n\n🇺🇸 An error happened while receiving your audio.');
  }
  return callback(null, twiml);
};