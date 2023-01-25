const OSC = require('osc-js')


const osc = new OSC({
    plugin: new OSC.DatagramPlugin({ send: { port: 8081, host: '192.168.1.177' } })
  });


  osc.open();

  let message = new OSC.Message('/eos/get/patch/count');
osc.send(message);
message = new OSC.Message('eos/get/group/count')
osc.send(message)

const closing = () => {
    osc.close()
}

setTimeout(closing, 5);