const OSC = require('osc-js')

let IP = '192.168.1.177';

const plugin = new OSC.DatagramPlugin({ send: { host: IP , port: 8080 }, open: { host: IP, port: 8081}})
const osc = new OSC({ plugin: plugin })

osc.open();

osc.on('*', message => {
  console.log('This is doing something')
  console.log(message)

})


function newcmd(string){
  let message = new OSC.Message('/eos/newcmd/'+string)
  osc.send(message)
}

newcmd('Chan 1 @ full#')

const closing = () => {
  osc.close()
}

setTimeout(closing, 5000);












/*
const osc = new OSC({ plugin: new OSC.DatagramPlugin({ send: { port: 8080, host: '192.168.1.177' } })});

const plugin = new OSC.WebsocketClientPlugin({ port: 8081 })
const listenosc = new OSC({ host: '192.168.1.177', plugin: plugin })


osc.open()
listenosc.open()
let message;

listenosc.on('*', message => {
  console.log('Is this Doing something?')
})

message = new OSC.Message('eos/get/patch/count')
osc.send(message)

const closing = () => {
    osc.close()
}

setTimeout(closing, 5000);*/