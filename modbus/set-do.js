/**
 * Usage:
 *   node src/set-do.js <channel 1..8> <state 0|1>
 *
 * Example:
 *   node src/set-do.js 1 1   // DO1 ON
 *   node src/set-do.js 1 0   // DO1 OFF
 */

const ModbusRTU = require("modbus-serial");

// TODO: đổi đúng cổng COM của em
const PORT = process.env.MODBUS_COM || "COM7";
const BAUDRATE = Number(process.env.MODBUS_BAUDRATE || 9600);
const SLAVE_ID = Number(process.env.MODBUS_SLAVE_ID || 1);

// Waveshare hay map DO coil thường bắt đầu từ 0 (DO1 = coil 0)
// Nếu module của em khác, chỉnh OFFSET ở đây:
const COIL_OFFSET = Number(process.env.MODBUS_COIL_OFFSET || 0);

async function main() {
  const ch = Number(process.argv[2]);
  const stateArg = String(process.argv[3]);

  if (!Number.isInteger(ch) || ch < 1 || ch > 8) {
    console.log("Channel must be 1..8");
    process.exit(1);
  }
  if (!(stateArg === "0" || stateArg === "1")) {
    console.log("State must be 0 or 1");
    process.exit(1);
  }

  const state = stateArg === "1";
  const coilAddr = COIL_OFFSET + (ch - 1);

  const client = new ModbusRTU();
  await client.connectRTUBuffered(PORT, { baudRate: BAUDRATE });
  client.setID(SLAVE_ID);

  await client.writeCoil(coilAddr, state);

  // đọc lại xác nhận
  const readBack = await client.readCoils(coilAddr, 1);
  const confirmed = !!readBack.data?.[0];

  console.log(`✅ DO${ch} -> ${state ? "ON" : "OFF"} | confirmed: ${confirmed ? "ON" : "OFF"}`);

  client.close();
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
