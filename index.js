// this should create a pset with an amp input and fees paid with lbtc

const { default: ECPairFactory } = require("ecpair")
const { Updater, Blinder, Creator, Transaction, payments, networks, confidential, script } = require("liquidjs-lib")
const { ZKPGenerator, ZKPValidator } = require("liquidjs-lib/src/confidential")
const { Signer, Pset, Finalizer, Extractor } = require("liquidjs-lib/src/psetv2")
const { SLIP77Factory } = require("slip77")
const ecc = require("tiny-secp256k1")
const data = require("./data.json")
const { fetchTx } = require("./regtest")

const network = networks.testnet
const ECPair = ECPairFactory(ecc);

async function main() {
  try {
    const { masterBlindingKey, keys: { pub, priv }, utxos, addresses } = data
    const p2wpkh = payments.p2wpkh({network, pubkey: Buffer.from(pub, 'hex')})
    const masterKey = SLIP77Factory(ecc).fromMasterBlindingKey(masterBlindingKey)
    const key = masterKey.derive(p2wpkh.output.toString('hex'))
    console.log('blinding keypair:', key.privateKey.toString('hex'), key.publicKey.toString('hex'))
  
    if (!data.addresses.find(v => v.unblinded_address === p2wpkh.address && v.blinding_key === key.publicKey.toString('hex'))) {
      throw new Error(`No addresses found for pubkey ${pub}`)
    }
    if (!data.utxos.find(v => v.public_key === pub)) {
      throw new Error(`No utxos found for pubkey ${pub}`)
    }
    const unblindedUtxos = []
    const inputs = []
    for (let i = 0; i < utxos.length; i++) {
      const txid = utxos[i].txhash
      const txIndex = utxos[i].pt_idx
      const txHex = await fetchTx(txid)
      const tx = Transaction.fromHex(txHex)
      const prevout = tx.outs[txIndex]
      const unblinded = await confidential.unblindOutputWithKey(prevout, key.privateKey)
      if (utxos[i].assetblinder !== Buffer.from(unblinded.assetBlindingFactor).reverse().toString('hex')) {
        throw new Error('Invalid asset blinder')
      }
      if (utxos[i].amountblinder !== Buffer.from(unblinded.valueBlindingFactor).reverse().toString('hex')) {
        throw new Error('Invalid value blinder')
      }
      unblindedUtxos.push({...unblinded, index: i})
      inputs.push({ txid, txIndex, witnessUtxo: prevout, sighashType: Transaction.SIGHASH_ALL })
    }

    const pset = Creator.newPset()
    const updater = new Updater(pset)
    updater.addInputs(inputs)
    updater.addOutputs([
      {
        asset: network.assetHash,
        amount: 99500,
        script: p2wpkh.output,
        blindingPublicKey: key.publicKey,
        blinderIndex: 0,
      },
      {
        asset: utxos[1].asset_id,
        amount: utxos[1].satoshi,
        script: Buffer.from(addresses[1].script, 'hex'),
        blindingPublicKey: Buffer.from(addresses[1].blinding_key, 'hex'),
        blinderIndex: 0,
      },
      {
        asset: network.assetHash,
        amount: 500,
      },
    ])

    const generator = ZKPGenerator.fromOwnedInputs(unblindedUtxos)
    const validator = new ZKPValidator()

    const outputBlindingArgs = await generator.blindOutputs(
      pset,
      ZKPGenerator.ECCKeysGenerator(ecc),
    )
    const blinder = new Blinder(pset, unblindedUtxos, validator, generator)
    await blinder.blindLast({ outputBlindingArgs })

    for (let i = 0; i < pset.globals.outputCount; i++) {
      const v = pset.outputs[i]
      if (v.script.length > 0) {
        const verified = await validator.verifyValueRangeProof(v.valueCommitment, v.assetCommitment, v.valueRangeproof, v.script)
        console.log(`is out ${i} range proof verified? ${verified}`)
      }
    }

    const privateKey = [ECPair.fromPrivateKey(Buffer.from(priv, 'hex'))]
    const rawTx = signTransaction(pset, [privateKey, privateKey], Transaction.SIGHASH_ALL)
    console.log(rawTx)
  } catch(e) {
    console.error(e)
  }
}

function signTransaction(pset, signers, sighashType) {
  const signer = new Signer(pset);

  signers.forEach((keyPairs, i) => {
    const preimage = pset.getInputPreimage(i, sighashType);
    keyPairs.forEach((kp) => {
      const partialSig = {
        partialSig: {
          pubkey: kp.publicKey,
          signature: script.signature.encode(kp.sign(preimage), sighashType),
        },
      };
      signer.addSignature(i, partialSig, Pset.ECDSASigValidator(ecc));
    });
  });

  if (!pset.validateAllSignatures(Pset.ECDSASigValidator(ecc))) {
    throw new Error('Failed to sign pset');
  }

  const finalizer = new Finalizer(pset);
  finalizer.finalize();
  const rawTx = Extractor.extract(pset);
  return rawTx.toHex()
}

main()