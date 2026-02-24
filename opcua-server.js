const {
  OPCUAServer,
  Variant,
  DataType
} = require("node-opcua");

const { setDO } = require("./modbus/modbus-driver");

const server = new OPCUAServer({
  port: 4840,
  resourcePath: "/UA/IO",
  buildInfo: {
    productName: "IndustrialIO",
    buildNumber: "1",
    buildDate: new Date()
  }
});

async function start() {
  await server.initialize();

  const addressSpace = server.engine.addressSpace;
  const namespace = addressSpace.getOwnNamespace();

  const device = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "IO_Module"
  });

  for (let i = 1; i <= 8; i++) {
    let state = false;

    namespace.addVariable({
      componentOf: device,
      browseName: `DO${i}`,
      nodeId: `ns=1;s=DO${i}`,
      dataType: "Boolean",
      value: {
        get: () => new Variant({ dataType: DataType.Boolean, value: state }),
        set: async (variant) => {
          state = variant.value;
          await setDO(i, state);
          return require("node-opcua").StatusCodes.Good;
        }
      }
    });
  }

  await server.start();
  console.log("OPC UA Server running at:");
  console.log(server.getEndpointUrl());
}

start();