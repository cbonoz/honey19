import React, { Component } from "react";
import { Button, Typography, Grid, TextField } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

import MyContract from "./contracts/MyContract.json";
import getWeb3 from "./utils/getWeb3";

import { theme } from "./utils/theme";
import Header from "./components/Header";
import "./App.css";

const GAS = 500000;
const GAS_PRICE = "20000000000";

// TODO: make variable.
const LAT_LNGS = [
  "32.7157,117.1611", // san diego 
  "19.8968,155.5828", // hawaii
]

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    resultReceived: false,
    latlngs: LAT_LNGS,
    result: {},
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      if (networkId !== 3) {
        throw new Error("Select the Ropsten network from your MetaMask plugin");
      }
      const deployedNetwork = MyContract.networks[networkId];
      const contract = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({ web3, accounts, contract });

      window.ethereum.on("accountsChanged", async accounts => {
        const newAccounts = await web3.eth.getAccounts();
        this.setState({ accounts: newAccounts });
      });

      // Refresh on-chain data every 1 second
      const component = this;
      async function loopRefresh() {
        await component.refreshState();
        setTimeout(loopRefresh, 1000);
      }
      loopRefresh();
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  refreshState = async () => {
    // get values of results received and result.
    const resultReceived = await this.state.contract.methods.resultReceived().call();
    const result = (await this.state.contract.methods.result().call()).toString();
    this.setState({ resultReceived, result });
  };

  handleUpdateForm = (name, value) => {
    this.setState({ [name]: value });
  };

  handleRequestResult = async () => {
    const {latlngs} = this.state
    // TODO: convert to 2 calls.
    await this.state.contract.methods
      .makeRequest(latlngs[0])
      .send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
  };

  handleResetResult = async () => {
    await this.state.contract.methods
      .resetResult()
      .send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
  };

  render() {
    if (!this.state.web3) {
      return (
        <ThemeProvider theme={theme}>
          <div className="App">
            <Header />

            <Typography>Loading Web3, accounts, and contract...</Typography>
          </div>
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <Header />

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Oracle is going to get you some swells`}
          </Typography>

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Ready?: ${this.state.resultReceived}`}
          </Typography>

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Swells: ${JSON.stringify(this.state.result)}`}
          </Typography>

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleResetResult()}
              >
                Reset Result
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleRequestResult()}
              >
                Request Result
              </Button>
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;