const MyContract = artifacts.require("MyContract");

module.exports = async function() {
  const myContract = await MyContract.deployed();
  await myContract.resetResult();

  resultReceived = await myContract.resultReceived();
  result = await myContract.result();
  console.log(`Received result: ${resultReceived}`);
  console.log(`Initial result: ${result.toString()}`);

  console.log("Making a Chainlink request using a Honeycomb job...");
  const query = [
    "32.7157,117.1611", // san diego 
    "19.8968,155.5828", // hawaii
  ]
  requestId = await myContract.makeRequest.call(query[0]);
  await myContract.makeRequest(query[0])
  console.log(`Request ID: ${requestId}`);

  console.log("Waiting for the request to be fulfilled...");
  while (true) {
    const responseEvents = await myContract.getPastEvents(
      "ChainlinkFulfilled",
      { filter: { id: requestId } }
    );
    if (responseEvents.length !== 0) {
      console.log("Request fulfilled!");
      break;
    }
  }

  resultReceived = await myContract.resultReceived();
  result = await myContract.result();
  console.log(`Received result: ${resultReceived}`);
  console.log(`Final result: ${result.toString()}`);

  process.exit();
};
