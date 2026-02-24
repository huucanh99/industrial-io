const express = require("express");
const path = require("path");
const { execFile } = require("child_process");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const MODBUS_SCRIPT = path.join(__dirname, "modbus", "set-do.js");

function runSetDO(channel, state) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [MODBUS_SCRIPT, String(channel), state ? "1" : "0"],
      { timeout: 10000 },
      (err, stdout, stderr) => {
        if (err) return reject(stderr || err.message);
        resolve(stdout);
      }
    );
  });
}

app.post("/api/do/:ch", async (req, res) => {
  try {
    const ch = Number(req.params.ch);
    const state = !!req.body.state;

    if (!Number.isInteger(ch) || ch < 1 || ch > 8) {
      return res.status(400).json({ error: "Channel must be 1-8" });
    }

    const output = await runSetDO(ch, state);
    res.json({ success: true, channel: ch, state, output });

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log("================================");
  console.log(" Industrial IO Server Running");
  console.log(" http://localhost:" + PORT);
  console.log("================================");
});