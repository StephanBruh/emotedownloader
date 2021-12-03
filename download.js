const Fs = require('fs')  
const Path = require('path')  
const axios = require('axios');

const baseUrlFFZ = "https://api.frankerfacez.com/v1/room/";
const baseUrlBTTV = "https://api.betterttv.net/3/cached/users/twitch/";
const baseUrlTwitch = "https://api.twitch.tv/kraken/users?login="
const baseUrlSevenTV = "https://api.7tv.app/v2/users/" // https://api.7tv.app/v2/users/id/emotes

const BTTVEmote = "https://cdn.betterttv.net/emote/" //https://cdn.betterttv.net/emote/id/3x
const SevenTVEmote = "https://cdn.7tv.app/emote/" // https://cdn.7tv.app/emote/id/3x

getFFZ(process.argv[2])
getBTTV(process.argv[2])
getSevenTV(process.argv[2])


async function getFFZ(input) {
    axios.get(baseUrlFFZ + input)
    .then(response => {
        console.log(`Getting FFZ Emotes of ${input}`)
        Object.values(response.data.sets)[0].emoticons.forEach(e => {
            downloadEmote(process.argv[2], e.urls[Object.keys(e.urls)[Object.keys(e.urls).length - 1]].replace(/^.{2}/g, 'https://'), e.name,undefined, 'ffz')
        });
        
    })
    .catch(error => {
       if(error.status == 404){
           console.log("No FFZ User Found: Status 404")
       }
})
}

async function getBTTV(input) {
    let user = await axios.get(`https://api.ivr.fi/twitch/resolve/${input}`, {timeout: 10000});
    console.log((`${baseUrlBTTV}${user.data.id}`))
    axios.get(`${baseUrlBTTV}${user.data.id}`)
    .then(response => {
        if(response.data.status == 404){
            console.log("No BTTV Emotes found Status 404")
            return
        }
        console.log(`Getting BTTV Emotes of ${input}`)
        response.data.channelEmotes.forEach(e => {
            downloadEmote(process.argv[2], `${BTTVEmote}${e.id}/3x`, e.code, `.${e.imageType}`, 'bttv')
        })
        response.data.sharedEmotes.forEach(e => {
            downloadEmote(process.argv[2], `${BTTVEmote}${e.id}/3x`, e.code, `.${e.imageType}`, 'bttv')
        })
    })
    .catch(error => {
        console.log(error)
    })
}

async function getSevenTV(input) {
    let user = await axios.get(`https://api.ivr.fi/twitch/resolve/${input}`, {timeout: 10000});
    axios.get(`${baseUrlSevenTV}${user.data.id}/emotes`)
    .then(response => {
        if(response.data.status == 404){
            console.log(`No 7TV Emotes found for ${input} Status 404`)
            return
        }
        console.log(`Getting 7TV Emotes of ${input}`)
        response.data.forEach(e => {
            downloadEmote(process.argv[2], SevenTVEmote + e.id + "/2x", e.name, ".webp", '7tv')
        })
    })
    .catch(error => {
        if(error.response.status == 404){
            console.log(`No 7TV Emotes found for ${input} Status 404`)
        }
    })
}

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

if (!fs.existsSync('downloads/' + dir + '/7tv')){
    fs.mkdirSync('downloads/' + dir + '/7tv');
}

async function downloadEmote (channel, url, name, imageType, thirdparty) {
    let type;
    if(typeof imageType === 'undefined') {
        type = ".png"
    }else {
        type = imageType
    }
    const path = Path.resolve( `${__dirname}/downloads`, `${channel}/${thirdparty}`, `${name}${type}`)
    const writer = Fs.createWriteStream(path)
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    }).catch(error => {
        console.log(error)
    })
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
    })
  }

