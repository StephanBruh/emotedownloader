const Fs = require('fs')  
const Path = require('path')  
const axios = require('axios');

const baseUrlFFZ = "https://api.frankerfacez.com/v1/room/";
const baseUrlBTTV = "https://api.betterttv.net/2/channels/";
const baseUrlTwitch = "https://api.twitch.tv/kraken/users?login="

const BTTVEmote = "https://cdn.betterttv.net/emote/"
axios.get(baseUrlFFZ + process.argv[2])
    .then(response => {
        console.log("Getting FFZ Emotes of " + process.argv[2])
        Object.values(response.data.sets)[0].emoticons.forEach(e => {
            // console.log(e.urls[Object.keys(e.urls)[Object.keys(e.urls).length - 1]])
            downloadEmote(process.argv[2], e.urls[Object.keys(e.urls)[Object.keys(e.urls).length - 1]].replace(/^.{2}/g, 'https://'), e.name,undefined, 'ffz')
        });
        
    })
    .catch(error => {
       if(error.status == 404){
           console.log("\x1b[31m", "No FFZ User Found: Status 404")
       }
    })

 axios.get(baseUrlBTTV + process.argv[2])
 .then(response => {
     if(response.data.status == 404){
         console.log("\x1b[31m", "No BTTV User Found: Status 404")
         return
     }
     console.log("\x1b[32m", "Getting BTTV Emotes of " + process.argv[2])
     response.data.emotes.forEach(e => {
         downloadEmote(process.argv[2], BTTVEmote + e.id + "/3x", e.code, "." + e.imageType, 'bttv')
     })
 })
 .catch(error => {
     if(error.response.status == 404){
         console.log("\x1b[31m", "No FFZ User Found: Status 404")
     }
 })

axios.get(baseUrlTwitch + process.argv[2], {
    headers: {
        'client-id': 'r0kkkg5s7h1rdvxwehjose1w7ms7ro',
        Accept: 'application/vnd.twitchtv.v5+json'
    }
})
    .then(response => {
        downloadTwitch(response.data['users'][0]._id)
    })
    .catch(error => {
        if(error.response.status == 404){
            console.log("\x1b[31m", "No FFZ User Found: Status 404")
        }
    })

var fs = require('fs');
var dir = process.argv[2];


if (!fs.existsSync('downloads')){
    fs.mkdirSync('downloads');
}

if (!fs.existsSync('downloads/' + dir)){
    fs.mkdirSync('downloads/' + dir);
}

if (!fs.existsSync('downloads/' + dir + '/ffz')){
    fs.mkdirSync('downloads/' + dir + '/ffz');
}

if (!fs.existsSync('downloads/' + dir + '/bttv')){
    fs.mkdirSync('downloads/'+ dir + '/bttv');
}

if (!fs.existsSync('downloads/' + dir + '/twitch')){
    fs.mkdirSync('downloads/' + dir + '/twitch');
}

async function downloadTwitch(id){
    axios.get("https://api.twitchemotes.com/api/v4/channels/" + id)
        .then(response => {
            response.data.emotes.forEach(e => {
                downloadEmote(process.argv[2], `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/4.0`, e.code, '.png', 'twitch')
            })
        })
        .catch(error => {
            if (error.response.status == 404){
                console.log("\x1b[31m", "User doens't have channel emotes")
            }else{
            // console.log(error)
            }
    })
}


async function downloadEmote (channel, url, name, imageType, thirdparty) {
    let type;
    if(typeof imageType === 'undefined') {
        type = ".png"
    }else {
        type = imageType
    }
    const path = Path.resolve(__dirname + '/downloads', `${channel}/${thirdparty}`, name + type)
    const writer = Fs.createWriteStream(path)
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    }).catch(error => {
        // console.log(error)
    })
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
    //   writer.on('error', reject)
    })
  }

