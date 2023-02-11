const OSC = require('osc-js')

let IP = '192.168.1.177';

const plugin = new OSC.DatagramPlugin({ send: { host: IP , port: 8080 }, open: { host: IP, port: 8081}})
const osc = new OSC({ plugin: plugin })

osc.open();

function newcmd(string){
    let message = new OSC.Message('/eos/newcmd/'+string)
    osc.send(message)
}

let satArr = [30, 50, 100];

function setRandomColors(){
    let randomNumber = Math.floor(Math.random() * 3)
    let randomHue = Math.floor(Math.random() * 360)
    newcmd(`group 2 + group 3 saturation ${satArr[randomNumber]}#`)
    newcmd(`group 2 hue ${randomHue}#`)
    if(randomHue + 180 < 360){
        newcmd(`group 3 hue ${randomHue + 180}#`)
    }else {
        newcmd(`group 3 hue ${randomHue -180}#`)
    }
}

function closing(){
    osc.close()
}

setRandomColors();
setInterval(setRandomColors, 4000)
setTimeout(closing, 50000)