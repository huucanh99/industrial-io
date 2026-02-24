const express = require("express");
const {
  OPCUAClient,
  AttributeIds,
  DataType
} = require("node-opcua");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const OPC_ENDPOINT = "opc.tcp://localhost:4840/UA/IO";

async function writeDO(channel, state) {
  const client = OPCUAClient.create({ endpointMustExist: false });

  await client.connect(OPC_ENDPOINT);
  const session = await client.createSession();

  await session.write({
    nodeId: `ns=1;s=DO${channel}`,
    attributeId: AttributeIds.Value,
    value: {
      value: {
        dataType: DataType.Boolean,
        value: state
      }
    }
  });

  await session.close();
  await client.disconnect();
}

app.post("/api/do/:ch", async (req, res) => {
  try {
    const ch = Number(req.params.ch);
    const state = !!req.body.state;

    if (!Number.isInteger(ch) || ch < 1 || ch > 8) {
      return res.status(400).json({
        ok: false,
        error: "Channel must be 1-8"
      });
    }

    await writeDO(ch, state);

    res.json({
      ok: true,
      channel: ch,
      state
    });

  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log("================================");
  console.log(" Industrial IO Server Running");
  console.log(" http://localhost:" + PORT);
  console.log("================================");
});