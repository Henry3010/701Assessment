const OSC = require('osc-js')


const osc = new OSC({
    plugin: new OSC.DatagramPlugin({ send: { port: 8081, host: '192.168.1.177' } })
  });

osc.open();
let message;

function setChannelLevel(channel, intens){
  message = new OSC.Message(`/eos/user/0/newcmd/Chan ${channel} @ ${intens}#`)
  osc.send(message)
}
function setGroupLevel(group, intens){
  message = new OSC.Message(`/eos/user/0/newcmd/Group ${group} @ ${intens}#`)
  osc.send(message)
}
function setChannelToCP(channel, CP){
  message = new OSC.Message(`/eos/user/0/newcmd/Chan ${channel} Color_Palette ${CP}#`)
  osc.send(message)
}
function setGroupToCP(group, CP){
  message = new OSC.Message(`/eos/user/0/newcmd/Group ${group} Color_Palette ${CP}#`)
  osc.send(message)
}
function setChannelToPreset(channel, preset){
  message = new OSC.Message(`/eos/newcmd/Chan ${channel} Preset ${preset}#`)
  osc.send(message)
}
function setGroupToPreset(group, preset){
  message = new OSC.Message(`/eos/newcmd/Group ${group} Preset ${preset}#`)
  osc.send(message)
}



setChannelLevel(1,75)
setGroupLevel(1,25)
setChannelToCP(1,1)
setGroupToCP(1,1)
setChannelToPreset(1,1)
setGroupToPreset(1,2)

const closing = () => {
    osc.close()
}

setTimeout(closing, 1000);
