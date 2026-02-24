const ModbusRTU = require("modbus-serial");

const PORT = "COM7";
const BAUDRATE = 9600;
const SLAVE_ID = 1;

async function setDO(channel, state) {
  const client = new ModbusRTU();
  await client.connectRTUBuffered(PORT, { baudRate: BAUDRATE });
  client.setID(SLAVE_ID);

  const coil = channel - 1;
  await client.writeCoil(coil, state);

  client.close();
}

module.exports = { setDO };