const OSC = require('osc-js')


const osc = new OSC({
    plugin: new OSC.DatagramPlugin({ send: { port: 8081, host: '192.168.1.177' } })
  });


osc.open();
const message = new OSC.Message('/hallo/rebecca');
osc.send(message);

