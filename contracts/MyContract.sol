pragma solidity 0.4.24;

import "../node_modules/chainlink/contracts/ChainlinkClient.sol";

contract MyContract is ChainlinkClient{
    uint256 private oraclePaymentAmount;
    bytes32 private jobId;

    bool public resultReceived;
    bytes32 public swell;

    constructor(
        address _link,
        address _oracle,
        bytes32 _jobId,
        uint256 _oraclePaymentAmount
        )
    public
    {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        oraclePaymentAmount = _oraclePaymentAmount;
    }

    function makeRequest(string query) external returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, this, this.fulfill.selector);
        req.add("q", query);
        req.add("copyPath", "data.weather.6.hourly.2.swellHeight_m");
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, oraclePaymentAmount);
    }

    function resetResult() external
    {
        resultReceived = false;
        swell = "";
    }

    function fulfill(bytes32 _requestId, bytes32 _result)
    public
    recordChainlinkFulfillment(_requestId)
    {
        resultReceived = true;
        swell = _result;
    }
}
