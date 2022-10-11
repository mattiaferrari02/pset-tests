const axios = require('axios');

TESTNET_APIURL = 'https://blockstream.info/liquidtestnet/api';
const APIURL = process.env.APIURL || TESTNET_APIURL;

async function faucet(address) {
  try {
    const resp = await axios.post(`${APIURL}/faucet`, { address });
    if (resp.status !== 200) {
      throw new Error('Invalid address');
    }
    const { txId } = resp.data;

    sleep(1000);
    let rr = { data: [] };
    const filter = () => rr.data.filter(x => x.txid === txId);
    while (!rr.data.length || !filter().length) {
      sleep(1000);
      rr = await axios.get(`${APIURL}/address/${address}/utxo`);
    }

    return filter()[0];
  } catch (e) {
    const errMsg = e.response && e.response.data ? e.response.data : e.request.data
    console.error(errMsg);
    throw new Error(errMsg);
  }
}

async function mint(address, quantity) {
  try {
    const resp = await axios.post(`${APIURL}/mint`, { address, quantity });
    if (resp.status !== 200) {
      throw new Error('Invalid request');
    }
    const { txId, asset } = resp.data;
    sleep(1000);
    let rr = { data: [] };
    const filter = () => rr.data.filter(x => x.txid === txId);
    while (!rr.data.length || !filter().length) {
      sleep(1000);
      rr = await axios.get(`${APIURL}/address/${address}/utxo`);
    }

    return { asset, txid: filter()[0].txid, index: filter()[0].vout };
  } catch (e) {
    const errMsg = e.response && e.response.data ? e.response.data : e.request.data
    console.error(errMsg);
    throw new Error(errMsg);
  }
}

async function fetchTx(txId) {
  try {
    const resp = await axios.get(`${APIURL}/tx/${txId}/hex`);
    return resp.data;
  } catch(e) {
    const errMsg = e.response && e.response.data ? e.response.data : e.request.data
    console.error(errMsg);
    throw new Error(errMsg);
  }
}

async function fetchUtxo(txId) {
  try {
    const txHex = await fetchTx(txId);
    const resp = await axios.get(`${APIURL}/tx/${txId}`);
    return { txHex, ...resp.data };
  } catch(e) {
    const errMsg = e.response && e.response.data ? e.response.data : e.request.data
    console.error(errMsg);
    throw new Error(errMsg);
  }
}

async function broadcast(
  txHex,
  verbose = true,
  api = APIURL,
) {
  try {
    const resp = await axios.get(`${api}/broadcast?tx=${txHex}`);
    return resp.data;
  } catch (e) {
    const errMsg = e.response && e.response.data ? e.response.data : e.request.data
    if (verbose) console.error(errMsg);
    throw new Error(errMsg);
  }
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

module.exports = {
  TESTNET_APIURL,
  faucet,
  mint,
  fetchTx,
  fetchUtxo,
  broadcast,
  sleep
}
