pragma solidity 0.4.24;

import "../node_modules/chainlink/contracts/ChainlinkClient.sol";

contract MyContract is ChainlinkClient{
    uint256 private oraclePaymentAmount;
    bytes32 private jobId;

    mapping (bytes32 => bool) public resultReceived;
    mapping (bytes32 => int256) public swell;

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

    function getResult(bytes32 _requestId) public view returns (int256 result) {
        result = swell[_requestId];
    }

     function getResultReceived(bytes32 _requestId) public view returns (bool received) {
        received = resultReceived[_requestId];
    }

    function fulfill(bytes32 _requestId, int256 _result)
    public
    recordChainlinkFulfillment(_requestId)
    {
        swell[_requestId] = _result;
        resultReceived[_requestId] = true;
    }
}
