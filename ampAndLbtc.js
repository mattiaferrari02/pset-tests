// this should create a pset with an amp input and fees paid with lbtc

const { CreatorInput, CreatorOutput, Updater, Blinder, Creator, Transaction, address } = require("liquidjs-lib")
const { ZKPGenerator, ZKPValidator } = require("liquidjs-lib/src/confidential")
const ecc = require("tiny-secp256k1")

const ownedInputs = [
    { // amp asset input
        "asset": {"type":"Buffer","data":[34,195,213,4,133,177,80,13,88,165,51,86,211,104,74,81,130,132,26,187,209,9,71,252,182,247,199,106,184,38,161,190]},
        "assetBlinder":{"type":"Buffer","data":[202,184,130,89,46,194,140,30,71,11,236,164,87,85,185,199,196,90,171,109,175,144,181,204,59,196,147,123,200,210,250,169]},
        "index":0,
        "value":"1",
        "valueBlinder":{"type":"Buffer","data":[157,43,219,217,100,106,65,97,4,59,20,66,56,214,192,66,64,91,198,238,133,13,9,185,160,164,204,84,59,9,152,61]},
        "txHash":"1f78b56be4ecb6591b4c6069e629f39470c7569d3737e7d8223cf76a77dc3015"
    },
    {   // lbtc input
        "asset":{"type":"Buffer","data":[73,154,129,133,69,246,186,227,159,192,59,99,127,42,78,30,100,229,144,202,193,188,58,111,109,113,170,68,67,101,76,20]},
        "assetBlinder":{"type":"Buffer","data":[209,34,145,61,53,225,89,105,41,142,40,221,219,32,200,192,161,123,187,156,54,204,254,104,62,70,6,46,200,182,157,223]},
        "index":1, 
        "value":"100000",
        "valueBlinder":{"type":"Buffer","data":[203,82,29,50,143,94,118,53,226,9,222,211,212,219,248,163,197,49,98,163,208,89,197,143,40,163,142,42,96,45,236,25]},
        "txHash":"82436b9e07f0f9d909d73faade015bdcd4374961cb0e80b9a23f76b8ae444fa3"
    }
]

const utxos = [
    {   // amp utxo
        "txid":"1f78b56be4ecb6591b4c6069e629f39470c7569d3737e7d8223cf76a77dc3015",
        "vout": 0,
        "prevout":{
            "asset":{"type":"Buffer","data":[10,162,128,114,2,70,73,212,210,150,88,55,14,174,66,26,145,85,51,67,80,5,101,0,153,148,198,241,108,189,193,101,177]},
            "value":{"type":"Buffer","data":[9,250,97,45,80,241,84,216,121,154,178,124,193,84,154,218,104,227,140,57,38,79,179,211,216,139,14,251,238,169,26,137,12]},
            "nonce":{"type":"Buffer","data":[2,116,78,37,142,99,154,209,143,17,208,42,95,13,217,133,254,114,252,13,68,131,126,40,155,20,203,9,39,189,237,224,218]},
            "script":{"type":"Buffer","data":[169,20,244,78,91,56,161,83,80,4,252,23,253,188,69,204,83,21,214,91,240,157,135]},
            "rangeProof":{"type":"Buffer","data":[96,51,0,0,0,0,0,0,0,1,88,94,38,0,47,180,187,19,231,8,190,91,208,195,11,216,44,77,108,133,29,155,51,21,236,230,74,192,176,182,214,95,96,211,24,50,3,134,235,210,32,23,103,155,253,126,184,153,192,247,248,73,101,114,151,223,126,193,207,27,129,234,90,77,237,41,34,120,21,159,0,217,94,106,104,103,86,115,67,117,144,216,247,105,170,83,164,208,69,205,115,201,224,40,56,41,222,233,7,87,171,253,171,170,101,2,18,37,80,92,197,46,231,208,32,238,89,138,33,137,47,167,60,42,215,105,105,249,186,61,197,139,51,43,129,82,56,171,119,141,88,204,138,185,249,68,106,53,2,76,90,171,221,106,58,195,165,87,119,58,37,85,188,9,171,123,241,106,55,153,151,196,115,37,115,102,202,248,114,53,116,92,131,178,142,31,81,188,25,180,103,244,109,246,242,102,115,68,18,192,231,135,39,52,4,146,63,180,149,92,171,128,241,64,253,58,173,1,63,205,199,30,183,67,239,217,166,102,73,60,179,18,161,214,129,52,106,85,145,48,140,39,232,190,83,233,29,46,100,234,198,160,183,106,183,138,23,10,19,25,49,252,21,169,113,189,47,203,236,39,221,0,162,45,4,13,104,161,244,244,252,93,75,14,171,102,125,151,55,4,212,109,90,213,184,153,79,92,249,191,119,170,86,254,77,122,196,9,12,13,9,227,72,69,227,240,174,21,55,255,199,46,146,68,174,66,109,103,194,244,198,240,70,178,163,251,186,244,139,208,46,76,132,225,199,108,210,88,15,179,249,215,49,173,74,159,127,71,54,117,134,143,248,38,95,4,128,115,220,167,169,165,86,162,60,145,120,113,11,224,135,22,127,45,7,234,98,108,97,69,178,148,9,201,48,19,244,176,118,11,191,2,198,205,213,77,168,67,75,144,50,255,194,160,142,135,194,247,59,184,144,202,232,144,199,157,184,178,97,155,214,125,253,13,214,232,182,154,190,109,104,242,34,129,85,0,209,76,114,255,93,196,149,229,221,219,183,253,249,241,94,96,87,129,37,10,210,195,108,85,146,158,215,99,169,141,180,51,117,76,217,167,162,165,116,181,251,130,37,59,194,195,101,91,61,84,217,234,111,80,98,131,15,36,162,87,183,72,86,73,4,230,78,252,155,172,168,78,85,228,24,11,169,45,109,121,85,53,229,141,142,15,19,146,247,248,186,64,84,204,60,18,185,194,195,197,158,79,202,248,133,104,56,96,120,85,33,244,71,199,214,148,246,185,82,117,245,86,214,201,59,106,152,214,235,45,37,162,179,248,150,158,49,254,40,5,7,53,78,46,24,134,114,214,97,64,63,252,205,183,13,133,213,184,198,45,32,94,173,68,49,93,39,179,30,238,234,46,228,147,221,52,55,30,87,46,31,119,118,230,241,79,110,171,39,17,79,32,112,166,27,200,188,74,163,172,30,235,65,44,121,24,8,188,244,77,232,143,201,23,133,53,176,243,175,58,9,245,200,121,170,201,186,81,53,250,186,45,223,207,169,16,42,75,245,101,128,231,69,196,25,164,59,59,156,124,189,24,179,238,144,191,160,212,185,162,180,233,119,203,63,65,250,95,4,176,218,243,53,186,2,230,195,157,17,241,247,11,93,138,164,118,194,252,22,181,187,155,76,189,214,205,205,24,143,77,87,131,8,215,99,139,109,222,121,224,192,111,98,78,108,22,200,142,58,149,186,132,236,147,122,65,174,171,88,1,200,142,83,77,41,183,222,165,109,197,91,123,114,66,46,249,59,11,12,240,125,143,53,125,130,150,67,47,174,50,38,204,216,86,180,229,123,202,48,88,219,82,166,149,221,56,119,201,180,216,178,192,178,10,178,49,41,177,4,13,139,213,67,126,127,136,230,179,203,47,48,76,231,242,50,177,119,29,252,123,193,154,139,236,39,147,229,93,185,145,0,76,115,185,147,158,77,133,223,16,60,15,121,239,230,69,108,133,163,155,242,127,93,63,73,6,13,126,86,119,121,234,201,234,201,221,87,241,199,83,203,230,122,96,236,86,233,141,31,40,57,222,189,217,183,108,125,43,80,249,84,87,168,50,171,228,156,78,219,192,73,228,247,103,24,228,158,201,51,123,109,251,118,40,201,28,206,143,120,228,152,53,242,110,141,65,225,126,191,115,226,77,62,159,46,20,244,33,45,186,191,113,155,162,225,129,176,169,49,239,60,244,72,49,31,89,94,116,164,51,151,105,133,214,111,245,45,120,130,39,54,226,97,101,162,24,210,201,116,17,61,237,40,144,62,198,228,223,121,242,73,19,70,124,60,43,189,178,202,232,235,173,230,28,201,34,42,91,102,77,133,168,200,13,201,151,141,211,222,236,123,93,12,37,132,127,187,57,52,254,56,56,236,16,17,209,196,49,25,146,70,192,59,185,232,124,201,62,245,56,95,152,8,54,124,156,255,137,91,151,218,130,148,49,71,156,254,171,77,22,100,45,149,65,156,23,52,114,146,255,195,7,133,161,5,236,117,207,161,203,124,228,224,95,10,252,137,233,138,111,177,135,68,70,117,44,171,242,38,47,120,160,76,152,117,93,43,173,201,13,47,215,248,168,81,44,201,65,70,40,237,6,38,70,87,38,106,48,130,214,158,146,16,250,186,174,244,63,125,245,39,128,163,62,239,1,172,165,190,94,179,15,79,55,53,117,74,13,12,53,143,199,203,122,0,108,101,168,85,70,114,187,6,166,195,218,252,244,66,147,214,240,177,175,16,234,153,8,66,140,195,63,95,153,182,125,159,149,223,20,55,129,29,133,153,103,38,98,197,198,205,9,145,198,135,34,141,144,233,221,55,9,200,25,200,83,184,77,5,171,88,35,236,81,152,110,89,104,228,113,236,19,169,140,201,238,80,190,118,237,24,217,171,41,59,211,85,78,240,14,205,222,32,123,230,136,5,232,240,9,132,26,192,235,192,53,24,13,113,112,237,95,64,189,187,215,95,192,136,38,101,103,248,239,205,34,82,132,26,15,158,47,94,183,103,28,43,197,154,140,205,247,57,44,144,221,89,84,98,156,177,202,251,79,172,76,9,197,49,190,223,204,249,175,126,228,49,174,144,28,154,82,37,88,172,75,64,201,233,65,159,95,48,162,15,92,248,241,141,46,175,23,39,60,106,39,147,178,232,50,50,147,164,11,100,25,230,234,171,97,25,130,201,213,183,241,44,87,10,99,188,54,121,211,23,133,45,225,137,237,61,171,17,217,183,2,86,159,119,67,32,253,231,164,109,130,176,103,237,94,214,183,74,127,123,64,189,154,6,78,24,75,69,207,109,30,12,120,22,216,174,127,74,188,202,32,202,132,255,55,51,114,38,228,172,155,47,6,103,241,50,190,176,181,165,248,207,161,120,51,149,96,109,79,5,80,201,196,198,231,28,54,18,95,35,233,163,217,26,219,22,255,80,68,98,1,195,200,85,237,177,34,177,10,142,215,158,121,38,35,158,231,52,24,144,64,107,85,14,87,233,123,98,89,70,104,60,98,62,47,211,149,250,219,65,177,161,126,38,51,208,181,72,150,175,118,210,158,92,180,102,183,115,220,130,166,101,147,58,34,80,206,77,184,204,27,174,146,2,23,95,60,166,22,17,226,179,63,171,186,194,77,12,19,111,105,42,187,192,106,228,190,223,244,92,31,104,119,161,11,16,142,29,174,243,190,44,6,4,30,79,111,154,152,233,232,1,145,13,248,10,167,112,164,167,241,80,131,116,160,248,83,209,220,174,54,11,254,162,234,171,83,27,62,35,40,97,16,254,131,30,205,129,209,129,66,240,244,68,215,176,184,81,192,145,218,116,67,65,51,159,9,143,41,46,143,145,13,220,10,124,75,240,62,67,117,15,240,171,206,14,59,52,134,151,55,205,225,102,13,140,68,156,61,110,25,95,184,128,183,206,51,149,159,163,2,15,19,54,201,172,198,47,145,165,181,91,117,116,107,59,166,40,157,11,113,101,169,228,103,96,238,50,241,156,28,154,52,124,143,205,181,235,229,167,74,154,118,30,95,176,14,21,7,134,213,46,241,184,85,35,2,187,11,154,106,91,111,195,191,217,176,247,255,149,71,88,74,109,114,28,223,63,97,202,148,149,219,98,111,189,68,197,241,14,248,173,232,138,212,217,224,106,165,223,105,15,53,133,214,197,88,217,90,140,2,14,30,184,175,81,60,162,217,67,198,53,115,55,255,116,39,222,16,255,125,4,75,214,13,63,244,253,20,236,70,238,81,116,154,161,84,62,121,38,247,174,244,240,114,42,187,209,89,52,83,222,195,222,223,109,16,111,162,139,24,1,70,80,47,5,191,245,132,233,44,170,94,81,119,101,36,166,92,222,182,139,170,44,254,55,105,160,255,182,151,95,199,81,110,89,68,211,223,141,114,195,16,35,233,241,5,160,226,247,90,22,229,6,202,141,64,123,145,140,143,24,88,244,150,139,2,97,227,57,118,192,40,155,15,187,12,233,193,3,188,133,67,157,129,227,45,221,120,197,196,29,2,127,214,197,155,115,19,239,164,28,98,247,188,138,73,53,6,25,142,45,78,172,172,62,7,210,30,124,141,147,58,214,73,59,142,2,99,170,80,193,226,7,221,105,6,115,21,71,66,6,96,131,39,9,50,172,128,44,94,107,23,31,87,24,210,65,58,0,179,143,6,176,219,209,235,226,147,80,195,127,119,101,147,255,93,103,78,72,177,73,96,2,67,32,141,116,1,75,58,252,215,222,198,175,238,1,204,28,20,134,235,229,157,13,188,122,42,13,2,25,218,173,245,230,198,144,128,199,102,21,107,68,140,94,93,69,89,117,248,144,74,204,116,124,225,241,124,102,21,34,40,46,215,254,38,154,139,166,150,246,16,170,175,20,56,230,78,228,161,140,148,115,121,227,176,103,131,27,117,248,17,112,236,208,215,73,210,220,166,85,31,42,66,17,21,1,50,142,110,26,68,39,204,164,18,143,187,209,40,220,244,222,106,229,119,254,7,48,16,254,91,95,241,17,28,172,93,220,21,49,208,47,168,138,107,87,192,234,218,181,7,18,152,189,252,87,74,153,136,116,66,191,233,245,52,95,64,224,233,87,53,16,103,187,165,104,112,187,100,247,37,16,212,175,0,248,134,209,137,52,123,41,213,215,67,107,114,73,172,95,234,62,41,167,84,182,61,215,254,192,252,18,242,47,164,29,69,55,231,22,144,15,53,148,45,169,183,56,109,214,101,185,198,168,151,250,106,36,29,0,107,33,210,36,86,112,75,55,203,203,68,17,115,56,103,157,17,246,84,138,108,78,197,223,14,115,67,3,147,5,0,129,202,22,157,28,238,246,76,129,65,87,77,187,191,194,87,107,124,208,34,53,120,179,95,77,75,174,184,101,43,197,114,134,48,17,44,58,8,117,71,112,247,159,121,106,70,66,117,91,155,121,123,7,227,43,143,70,251,149,85,26,253,115,199,51,47,198,238,11,67,165,115,74,143,146,101,58,58,12,114,132,194,188,210,19,145,229,17,229,183,114,113,180,197,122,205,154,87,169,104,212,97,159,129,58,144,177,76,129,18,183,241,181,201,138,223,141,58,139,203,218,228,212,12,75,163,31,33,148,167,254,14,189,212,22,12,147,221,84,224,121,241,19,220,27,70,36,157,188,251,188,87,126,18,19,42,11,187,83,213,49,232,19,137,98,15,128,132,208,221,61,105,22,178,35,217,237,150,73,43,127,172,246,15,180,253,149,133,104,28,46,38,20,201,189,43,99,208,87,158,151,81,180,217,145,234,171,16,175,237,252,163,81,144,24,23,99,16,190,221,138,165,224,192,222,97,151,114,196,138,124,34,2,188,216,155,81,201,133,51,132,12,38,152,88,230,98,192,136,181,145,7,137,18,100,114,80,184,34,111,68,219,105,117,237,158,35,113,108,148,80,76,190,161,253,197,207,244,105,207,234,201,82,68,142,181,175,162,10,14,82,127,102,151,89,12,202,147,153,72,101,59,33,205,96,122,235,182,246,85,143,169,246,109,157,74,246,24,223,245,92,230,128,155,224,56,133,230,141,15,244,216,226,217,61,81,240,80,108,34,103,49,78,125,167,170,28,165,25,192,164,18,117,220,248,122,120,168,196,253,77,45,134,188,120,225,66,117,135,200,80,138,155,121,182,194,124,
                252,228,89,160,151,132,8,88,172,53,220,145,165,229,158,227,39,167,231,6,158,237,175,233,23,165,21,91,21,218,11,138,66,30,12,174,172,233,131,169,47,189,200,213,64,63,16,219,64,106,183,233,33,28,119,128,210,28,59,53,225,248,86,105,66,6,19,10,108,186,186,182,47,252,197,16,203,10,229,34,255,123,210,213,137,229,86,197,189,141,216,210,234,38,142,140,242,180,8,90,224,44,3,37,191,19,213,171,31,63,66,184,151,239,95,144,252,62,82,133,250,31,52,43,37,252,213,229,216,143,103,125,226,107,48,231,119,150,9,156,228,45,161,115,44,101,203,35,31,37,6,44,139,169,79,171,209,228,30,180,149,9,26,33,29,23,159,172,247,18,43,62,214,2,159,206,155,224,165,41,55,52,47,111,43,254,159,226,152,230,164,234,149,95,134,176,158,146,31,37,115,216,124,254,8,90,140,188,74,3,112,84,5,224,208,118,35,141,240,181,129,34,132,148,13,161,141,130,193,98,131,49,142,6,149,113,129,78,189,177,134,50,114,221,195,188,87,18,30,37,104,167,110,83,53,253,171,54,145,78,65,49,148,207,24,170,30,252,136,182,64,22,66,218,178,168,115,75,211,149,38,237,58,17,10,33,58,71,224,252,62,100,47,253,49,254,3,39,131,230,21,90,96,241,169,47,27,36,143,67,177,209,20,178,210,157,227,69,24,22,200,206,76,51,12,12,253,141,146,213,110,213,185,160,70,183,163,39,59,252,72,110,203,172,238,100,106,224,199,190,11,91,174,95,133,141,122,171,242,74,228,82,118,164,85,110,151,241,68,14,205,115,66,183,190,61,246,122,61,134,217,30,229,116,165,110,31,213,127,137,149,124,169,104,160,141,83,60,187,169,226,83,172,158,75,202,71,85,64,216,96,87,192,191,195,90,135,122,159,46,252,159,6,70,75,237,127,157,144,139,9,214,23,66,86,23,248,127,230,142,57,88,81,39,113,202,178,200,93,71,96,118,98,56,236,97,228,239,16,14,207,5,218,37,101,216,83,168,20,222,130,126,52,108,43,132,222,10,175,183,140,165,102,7,143,222,60,69,2,209,188,240,30,77,103,171,183,8,254,158,119,7,99,210,148,128,65,4,154,134,91,26,181,1,85,183,119,196,80,108,51,87,124,107,66,156,104,164,76,179,213,167,54,55,5,105,57,166,243,32,181,164,110,29,146,207,215,218,198,184,130,54,89,125,174,30,66,68,180,165,170,164,183,126,142,242,97,247,205,151,71,248,31,183,157,208,9,180,102,84,17,117,124,134,249,241,140,152,225,109,66,61,198,76,107,255,10,208,125,160,184,20,120,137,166,31,188,230,249,160,59,91,147,216,185,216,233,98,203,32,104,223,81,131,230,24,63,20,155,94,163,39,66,229,59,12,172,30,18,215,17,116,231,42,110,105,61,215,124,201,212,134,11,180,174,196,59,184,55,179,23,139,211,121,176,171,142,58,167,96,61,157,130,69,247,106,74,87,179,7,195,53,24,25,0,166,52,249,150,93,85,248,197,195,140,137,238,209,216,90,92,29,251,152,199,16,17,142,245,16,90,85,225,101,14,163,182,199,198,175,186,148,108,63,45,11,193,122,26,170,148,150,113,17,103,18,228,154,78,15,1,185,235,176,36,115,40,22,60,27,123,7,51,206,1,128,171,48,20,201,44,145,207,43,177,137,170,177,224,64,131,80,94,30,104,219,160,220,174,17,243,235,21,159,81,185,215,67,4,151,104,10,101,176,83,66,0,24,186,36,75,249,165,203,4,251,226,139,70,254,148,253,55,110,101,120,59,63,68,188,138,38,64,243,138,82,245,216,218,26,225,7,238,97,142,109,204,108,60,31,137,106,161,52,100,70,108,148,82,158,182,10,200,98,216,3,48,90,8,76,201,142,78,151,109,228,113,66,26,162,117,82,227,66,180,243,51,193,154,224,108,150,32,252,191,182,206,16,82,57,7,13,214,9,74,21,203,135,67,204,94,6,65,58,217,167,91,161,39,248,78,55,58,49,49,62,199,161,211,128,206,246,6,233,48,81,170,105,202,64,62,190,218,27,79,29,129,83,98,164,172,99,232,210,77,238,106,53,33,16,16,7,236,223,69,84,24,114,106,48,159,229,146,170,106,28,203,188,69,215,151,57,106,10,163,26,192,83,11,184,63,155,220,107,176,55,149,135,28,78,22,29,70,0,110,221,98,76,144,51,202,24,52,162,95,64,61,241,51,135,133,255,128,79,167,39,80,226,19,49,190,215,24,131,55,70,10,88,23,9,195,169,103,132,208,223,76,115,39,36,234,138,15,206,13,188,81,14,140,9,126,50,250,255,170,40,124,126,99,102,69,216,16,166,13,223,198,193,143,177,53,213,185,188,247,25,98,211,225,178,62,32,15,231,240,243,62,131,225,173,206,63,41,128,127,176,3,132,30,49,201,26,131,127,52,210,213,119,207,222,94,175,32,63,244,33,162,53,62,134,156,152,205,88,139,34,175,82,22,214,144,116,10,45,60,140,116,141,218,213,111,98,44,34,125,62,66,227,32,123,178,83,103,47,77,88,9,129,129,3,201,180,57,29,147,188,111,71,226,126,180,108,235,226,112,53,204,42,205,116,238,140,227,98,43,146,7,116,162,198,41,197,95,171,231,230,255,132,175,143,215,63,240,63,138,249,170,126,233,12,248,250,185,124,54,56,58,238,119,166,123,157,179,165,162,1,136,187,30,127,166,137,92,66,94,147,215,105,4,236,224,4,79,134,103,54,169,131,233,19,103,253,60,214,40,91,75,253,104,34,100,233,5,105,11,147,59,47,114,162,82,83,184,19,44,211,116,237,133,219,51,206,103,245,181,110,250,142,76,20,148,238,98,205,189,182,255,237,167,70,217,19,27,0,254,56,198,219,66,129,150,130,207,219,12,10,162,108,155,151,129,63,55,7,105,93,117,232,157,50,68,255,154,12,226,166,107,209,40,235,72,66,139,4,90,121,200,167,58,193,244,189,199,18,166,226,253,102,57,26,166,76,142,5,32,240,159,186,228,219,135,190,78,190,163,20,209,2,164,146,247,245,63,123,192,207,143,219,150,55,82,15,125,224,30,5,83,136,242,76,182,177,234]},
            "surjectionProof":{"type":"Buffer","data":[2,0,3,239,165,227,30,153,98,227,168,136,132,112,192,181,147,252,116,157,33,28,173,79,0,248,255,109,224,145,39,109,241,35,45,59,185,152,103,124,167,64,6,31,20,131,33,223,96,219,153,184,20,95,101,234,143,178,164,249,33,18,140,107,202,176,25,251,10,94,225,106,85,180,239,179,139,171,163,162,187,125,172,182,168,153,121,118,112,36,244,75,121,164,77,50,14,12,229]}
        },
        "unblindData":{
            "asset":{"type":"Buffer","data":[34,195,213,4,133,177,80,13,88,165,51,86,211,104,74,81,130,132,26,187,209,9,71,252,182,247,199,106,184,38,161,190]},
            "assetBlindingFactor":{"type":"Buffer","data":[202,184,130,89,46,194,140,30,71,11,236,164,87,85,185,199,196,90,171,109,175,144,181,204,59,196,147,123,200,210,250,169]},
            "value":"1",
            "valueBlindingFactor":{"type":"Buffer","data":[157,43,219,217,100,106,65,97,4,59,20,66,56,214,192,66,64,91,198,238,133,13,9,185,160,164,204,84,59,9,152,61]}
        },
        "script":"0020170271fe2a9442c48f97582900b72d6dd9a3ca5bb8bfd1da225b60ceb9d943c5"
    },
    {  // lbtc utxo
        "txid":"82436b9e07f0f9d909d73faade015bdcd4374961cb0e80b9a23f76b8ae444fa3",
        "vout": 0,
        "prevout": {
            "asset":{"type":"Buffer","data":[11,12,224,4,15,206,222,46,173,54,182,219,21,189,73,161,174,42,12,220,97,64,162,180,127,6,151,185,61,63,91,131,62]},
            "value":{"type":"Buffer","data":[9,33,12,127,212,110,216,142,206,134,197,36,20,196,10,220,54,6,150,110,76,247,193,6,194,204,253,254,125,63,146,149,13]},
            "nonce":{"type":"Buffer","data":[3,146,212,183,244,55,217,184,33,243,139,38,239,172,41,150,66,198,157,105,191,210,249,38,244,67,0,141,44,128,148,129,236]},
            "script":{"type":"Buffer","data":[169,20,210,23,172,65,70,225,27,158,65,56,112,143,244,201,24,142,255,50,164,252,135]},
            "rangeProof":{"type":"Buffer","data":[96,51,0,0,0,0,0,0,0,1,120,194,250,1,175,129,30,56,45,14,228,56,58,236,193,6,185,211,67,47,94,74,224,138,145,188,124,132,91,30,226,214,80,79,88,178,145,139,208,112,60,247,154,62,52,131,207,62,145,32,228,163,138,22,25,101,164,69,226,137,140,16,60,59,125,168,244,166,121,227,229,204,91,3,43,82,126,202,152,138,255,64,166,29,213,69,205,134,129,61,171,247,215,80,111,119,182,84,5,103,32,168,1,20,81,164,199,231,19,147,240,76,150,239,15,21,160,35,45,78,223,218,181,159,224,141,214,58,68,170,246,238,48,180,225,115,221,177,54,158,166,54,2,114,246,235,241,61,70,171,194,32,185,162,207,29,41,240,232,159,114,81,135,128,37,80,193,161,93,21,235,228,36,135,130,8,20,126,14,86,77,113,207,63,96,45,203,128,117,250,221,63,136,211,191,126,14,40,107,219,197,128,164,19,178,47,222,220,107,136,26,156,42,10,75,38,112,159,190,56,145,162,68,8,242,139,168,21,214,132,53,242,196,46,162,220,196,123,119,205,22,177,139,195,60,156,110,242,117,188,133,5,251,36,250,225,212,29,147,160,60,205,50,234,100,146,219,9,109,146,21,226,110,194,71,118,133,148,100,90,158,60,73,2,185,82,135,150,102,159,57,83,75,181,194,70,80,228,28,242,222,72,72,166,0,218,44,133,244,100,124,244,219,235,131,15,206,228,89,129,36,129,119,141,60,24,131,43,61,61,134,228,8,212,14,56,163,73,2,185,65,254,57,93,42,44,208,123,141,37,90,80,126,8,107,80,180,98,108,5,70,69,114,27,35,106,224,231,139,32,66,180,78,241,61,119,44,31,17,243,221,88,149,85,82,149,202,203,7,5,72,173,241,203,204,232,78,168,242,211,52,243,208,3,235,160,244,121,55,177,201,93,21,244,101,194,93,112,96,70,205,193,59,255,74,151,51,172,180,92,55,182,246,219,41,53,236,194,254,131,112,156,1,100,251,206,59,99,68,103,192,13,67,46,125,171,17,179,137,75,231,2,252,152,57,180,22,82,194,156,46,54,56,213,186,3,214,203,193,98,162,41,46,15,76,62,218,126,167,236,197,86,252,223,249,63,60,220,237,154,249,127,22,226,226,8,241,93,19,35,104,17,39,153,235,93,189,147,60,177,79,155,117,198,18,64,63,78,154,148,6,102,171,199,241,241,221,184,243,56,235,196,171,247,84,39,31,182,166,136,120,240,103,55,25,184,172,70,166,227,65,67,22,45,205,98,20,234,137,229,45,251,96,237,146,179,9,175,200,166,156,62,104,212,40,252,102,131,247,72,216,237,64,36,112,164,243,44,55,187,235,231,0,45,83,38,211,57,27,100,10,56,79,133,104,73,16,188,85,66,193,173,78,29,183,108,87,189,166,172,128,185,28,9,129,22,161,97,252,87,127,80,162,141,79,73,197,162,1,11,25,251,140,228,220,143,149,133,127,69,236,91,50,91,191,171,92,69,138,186,82,136,196,44,146,86,236,132,89,174,203,71,91,55,140,227,93,119,17,30,86,6,56,144,136,155,147,161,156,99,227,132,10,185,208,48,151,137,238,44,17,60,60,71,6,232,24,51,254,147,65,3,0,76,3,89,68,2,247,159,218,168,73,192,189,14,146,240,229,89,25,142,99,193,5,123,185,71,16,29,51,83,172,120,233,143,69,200,99,181,100,112,184,231,249,11,22,155,229,22,108,245,157,13,124,31,101,226,220,46,82,15,229,179,34,116,95,240,118,33,192,204,131,186,227,153,213,206,36,127,168,153,81,228,44,97,32,230,104,88,216,247,203,45,35,49,15,187,84,3,120,38,130,209,66,30,156,106,240,53,22,49,207,57,55,232,222,97,211,92,166,47,184,112,37,144,202,124,115,86,27,21,118,212,165,219,158,173,135,188,1,147,255,21,188,156,11,197,158,37,34,149,165,10,65,59,157,105,58,32,224,207,140,199,214,153,166,133,140,48,146,227,171,240,160,108,66,241,200,229,86,96,61,7,237,248,151,35,254,107,243,21,179,199,80,188,129,9,36,207,132,140,30,117,252,227,74,245,107,36,211,204,133,216,2,232,11,135,188,184,36,161,93,120,94,161,144,101,230,24,32,244,108,241,243,91,30,56,248,182,158,184,87,210,206,39,176,181,47,136,230,149,66,223,195,171,119,84,166,214,198,190,179,152,195,25,186,93,39,56,12,14,64,144,17,95,101,149,110,77,26,127,153,140,24,185,106,49,208,43,135,179,231,180,69,122,10,159,24,23,235,0,168,53,18,86,188,137,183,54,68,228,235,52,112,95,80,25,192,113,205,181,43,234,223,237,240,106,51,108,145,92,122,28,117,38,28,3,156,32,189,7,241,160,255,17,51,139,20,105,34,60,221,246,50,112,136,28,99,137,192,251,142,250,4,215,141,97,247,150,11,106,53,107,255,113,11,130,66,113,92,134,220,48,41,203,42,227,155,116,218,55,225,122,221,218,255,152,80,177,75,90,142,102,69,212,71,18,162,101,137,142,39,174,53,199,216,217,165,10,212,189,191,57,131,26,89,226,80,228,199,34,41,58,6,65,118,70,42,222,84,239,150,25,253,225,66,197,146,84,149,157,216,64,27,246,223,109,250,95,175,247,175,54,92,220,69,139,78,160,157,106,184,182,241,179,54,231,1,244,99,241,49,97,249,90,139,206,61,143,248,93,98,211,235,44,79,10,177,213,19,80,46,23,172,242,190,155,171,64,5,226,18,224,186,239,166,80,242,106,168,42,7,187,112,58,245,37,201,86,247,6,82,131,131,74,78,202,59,130,76,46,78,156,245,252,102,205,135,242,249,159,171,212,57,112,205,10,78,76,250,206,178,92,13,67,87,24,117,37,228,87,117,186,238,239,254,215,210,254,145,155,50,232,190,209,216,23,15,199,212,191,197,33,156,180,101,106,197,55,96,200,10,199,127,242,245,193,143,180,206,169,221,38,222,133,212,62,104,238,28,4,216,104,75,135,102,122,183,103,39,63,203,224,125,25,243,11,13,28,223,179,129,28,80,84,30,190,79,236,94,66,226,102,5,99,74,106,146,65,213,30,57,194,245,11,192,158,93,23,196,142,74,207,238,235,111,114,221,86,139,43,209,231,202,16,25,188,36,160,130,135,154,136,229,134,235,203,108,225,25,65,75,10,51,213,99,250,194,232,169,194,19,88,231,184,206,3,51,37,44,175,81,211,8,13,245,44,152,151,113,190,167,236,41,242,67,59,107,170,131,54,235,195,248,178,173,104,217,158,202,41,206,40,237,234,151,242,205,252,210,108,37,160,207,101,74,145,213,57,9,43,189,198,87,137,208,205,201,140,19,220,181,24,183,84,212,161,79,123,11,226,114,126,13,127,25,195,243,249,151,48,73,24,184,91,243,127,144,192,53,151,180,225,128,102,88,232,146,40,53,171,145,218,69,175,85,223,137,163,47,47,240,253,206,83,102,254,70,240,146,144,87,38,174,153,50,37,155,209,131,170,47,197,160,218,235,8,72,26,233,25,113,230,205,143,195,117,71,163,36,229,90,182,8,95,102,180,7,113,158,169,145,111,245,213,56,118,191,83,171,206,194,59,138,245,170,192,10,47,238,38,78,151,190,141,150,92,90,224,29,198,174,171,26,232,26,182,83,209,203,244,135,73,75,229,163,73,101,222,44,190,61,76,148,197,72,220,35,194,143,59,245,87,78,107,222,157,202,133,152,221,192,25,183,124,84,184,172,31,71,78,149,88,179,66,90,122,214,137,63,167,40,142,78,249,253,207,29,168,160,5,251,215,238,239,166,127,241,196,185,204,43,151,112,1,47,207,157,121,23,166,24,65,203,155,93,151,39,144,232,76,62,194,10,137,140,221,154,246,119,232,142,250,217,110,203,151,224,244,66,129,192,254,5,86,170,33,114,229,170,207,18,120,171,74,182,156,249,11,31,140,73,71,10,135,103,192,191,228,109,174,151,160,82,213,52,246,198,170,157,35,15,215,70,192,83,176,251,59,116,89,178,56,181,201,134,178,32,244,18,152,77,147,64,159,222,98,102,204,206,101,212,65,143,226,38,164,250,201,85,162,86,49,217,157,202,173,125,238,188,63,243,107,93,152,123,27,127,129,16,131,28,153,203,244,49,112,100,255,124,211,96,252,201,115,17,9,24,226,228,55,168,41,184,182,123,12,68,223,255,12,17,156,149,8,242,62,239,33,116,180,133,56,165,87,216,229,81,181,10,177,46,89,25,57,103,165,79,154,201,137,65,113,158,26,128,214,149,168,184,154,22,75,26,202,191,6,209,246,210,224,1,93,207,217,70,232,131,223,190,73,104,134,70,156,176,119,75,109,106,105,97,86,6,145,56,119,206,94,227,114,169,59,63,33,161,206,171,52,43,206,22,197,53,168,4,175,39,67,210,139,130,35,5,105,97,155,99,142,70,237,245,163,255,43,164,188,65,125,151,25,236,60,162,123,20,170,114,6,124,62,35,85,190,51,38,144,151,74,97,46,184,91,122,225,8,84,245,101,124,116,29,146,40,112,170,22,36,96,100,191,198,240,205,104,191,229,64,31,29,47,175,243,215,205,203,68,42,237,151,112,181,154,38,187,72,163,99,179,52,250,159,47,37,14,206,111,147,23,92,246,151,102,208,60,154,61,132,245,40,71,62,38,165,128,225,120,172,38,90,58,56,184,107,41,105,3,198,170,228,173,113,228,6,32,154,25,202,193,80,252,210,73,5,244,119,93,10,161,200,40,173,68,202,73,85,110,210,19,125,222,32,245,39,238,211,71,48,44,162,232,179,107,195,216,251,16,152,228,48,53,214,243,50,121,153,245,8,51,225,13,217,130,66,188,70,201,92,57,211,108,4,224,58,67,90,252,8,143,207,195,4,167,166,206,173,71,222,60,0,68,32,42,165,64,218,147,24,82,55,216,161,34,113,163,56,26,225,227,198,114,229,219,252,100,80,69,25,70,248,66,173,11,180,238,106,210,179,56,6,176,57,145,207,252,132,255,158,0,119,88,173,87,115,130,108,16,164,219,102,35,240,42,252,76,13,103,228,173,143,42,192,113,157,225,251,130,117,70,31,122,26,134,66,162,17,205,65,117,166,40,115,42,128,119,23,73,174,13,72,44,76,184,237,96,56,118,218,196,13,230,45,53,8,77,210,201,3,118,119,117,254,246,5,188,127,214,153,128,187,8,126,141,135,85,180,210,220,238,54,50,45,88,241,31,176,120,60,42,44,121,105,11,204,90,230,246,128,45,250,122,71,199,35,167,160,221,42,94,40,185,205,252,247,60,118,202,243,94,120,128,208,193,42,150,238,19,79,130,145,135,234,147,29,61,77,186,44,223,13,55,36,124,216,170,150,140,87,153,122,42,217,7,143,163,172,183,199,131,80,248,48,116,76,216,150,99,167,153,192,63,122,48,187,14,9,150,163,28,159,135,22,187,200,121,216,22,119,151,138,101,250,253,208,169,253,65,160,219,215,154,113,35,245,136,189,122,210,248,161,102,13,14,202,217,121,122,117,115,240,124,160,38,109,211,124,169,5,171,125,110,172,193,82,14,64,182,255,82,226,93,209,82,65,234,129,47,85,199,151,48,170,1,198,28,195,18,121,236,190,43,65,216,191,79,39,69,131,87,76,45,87,123,173,157,201,47,42,104,32,188,15,76,98,155,126,10,41,250,139,214,89,24,92,43,45,213,59,212,22,21,186,167,30,215,96,108,35,1,22,135,83,145,150,53,233,140,36,157,50,130,99,120,192,46,175,231,115,76,157,60,210,97,129,66,2,153,254,48,171,78,254,131,144,125,55,198,76,183,2,191,77,136,104,76,225,202,224,152,34,132,130,126,20,21,143,0,124,73,196,223,69,73,108,251,37,27,165,213,246,225,189,146,36,131,240,32,252,146,120,136,68,193,186,197,9,72,156,23,177,96,173,171,162,246,35,237,242,229,102,237,104,83,70,141,89,142,120,51,79,14,6,202,81,79,43,104,20,240,111,215,190,138,35,146,247,87,105,206,218,175,126,236,14,118,229,153,26,196,10,90,216,31,117,71,11,175,105,43,186,7,17,228,246,80,131,80,229,43,109,55,221,30,63,83,131,35,157,34,121,102,235,207,166,66,250,130,76,123,106,18,243,210,195,199,65,182,122,245,15,85,221,97,246,64,137,164,19,13,
                182,161,165,98,194,24,50,245,171,122,135,166,108,239,108,20,202,87,1,45,33,189,90,38,228,233,149,82,224,54,44,160,114,209,146,93,62,176,79,33,184,146,134,247,111,103,2,7,232,108,33,107,216,57,226,58,243,144,8,69,173,161,50,9,50,52,173,216,125,63,61,207,52,195,74,125,120,7,89,233,175,215,46,110,138,150,233,62,65,86,77,189,249,216,73,237,189,165,196,41,144,121,170,163,102,45,226,104,186,187,185,58,177,25,152,35,255,118,229,24,71,31,238,12,176,104,74,91,71,223,4,158,189,155,186,54,255,93,253,236,99,168,110,55,94,64,70,89,159,94,116,174,200,115,43,5,205,60,93,121,115,157,215,38,207,223,101,231,108,243,138,213,226,90,171,251,120,13,114,139,108,39,233,196,186,78,193,39,161,195,138,237,138,138,143,157,183,100,132,94,201,86,5,62,255,80,126,8,45,223,140,8,66,133,198,32,19,8,207,98,103,15,218,200,65,239,162,187,211,186,32,98,197,132,16,30,73,241,203,110,242,229,155,155,151,209,138,40,211,95,17,42,38,23,31,25,1,99,134,68,134,180,247,183,117,21,177,5,201,131,233,231,228,38,199,85,165,24,250,134,179,9,110,137,139,241,65,177,13,38,80,139,193,6,90,23,116,134,165,247,18,253,1,56,111,120,203,7,49,61,166,150,161,65,100,158,0,16,228,237,152,24,251,219,151,78,41,106,216,57,91,105,35,105,207,47,31,94,21,156,103,28,86,97,184,170,166,165,9,24,188,50,189,198,169,22,10,221,51,191,67,220,25,198,66,0,255,69,94,30,70,76,148,132,212,117,21,2,77,229,120,174,183,75,152,26,28,214,255,184,235,36,169,219,25,155,92,83,97,139,222,206,205,205,69,126,13,227,227,196,124,63,247,220,44,57,222,238,39,232,61,217,218,39,144,89,63,183,132,156,38,97,72,131,2,81,34,10,106,186,243,240,97,13,13,131,173,145,32,91,34,105,49,224,117,136,225,175,196,30,244,123,16,117,169,4,215,127,124,167,98,30,145,134,54,184,131,51,64,19,148,87,79,189,34,86,122,9,112,118,174,167,171,228,187,248,80,237,117,150,236,179,60,95,26,133,129,50,209,70,135,207,205,232,201,207,222,178,7,117,86,222,147,199,187,7,212,243,79,133,250,164,189,49,250,5,212,167,110,224,3,139,154,15,7,156,221,210,229,222,2,153,176,150,234,89,217,171,54,119,229,221,239,77,181,217,201,97,158,5,135,93,108,8,207,129,220,11,64,57,89,41,179,139,26,40,201,235,146,220,141,102,166,102,114,63,82,197,223,163,137,121,126,99,137,252,34,158,3,61,126,213,162,16,177,170,133,222,61,188,253,219,223,251,66,240,99,204,202,37,1,61,2,114,66,96,88,128,137,236,164,66,211,168,48,75,111,160,58,199,159,252,74,27,136,8,146,6,217,207,245,193,141,237,231,0,201,67,141,103,201,69,121,31,236,48,17,75,172,19,10,240,160,188,224,27,22,165,127,3,87,225,1,28,180,59,192,101,90,196,203,246,36,242,233,13,32,235,159,169,170,150,19,196,186,131,105,7,243,108,8,159,19,137,17,79,191,210,245,78,65,70,210,134,79,43,31,49,62,86,95,36,250,10,97,213,253,97,128,71,62,238,132,7,158,171,166,189,224,51,63,68,205,13,102,246,180,237,11,205,10,148,44,58,177,61,139,175,237,6,117,249,7,118,243,9,163,96,32,254,251,108,103,49,47,163,175,160,163,173,66,109,156,193,184,127,101,23,73,94,63,52,22,182,34,172,201,43,93,183,138,225,146,231,142,192,97,229,123,204,59,9,253,64,175,143,170,241,216,114,219,168,34,60,244,132,141,207,48,71,203,131,106,75,208,10,248,161,102,194,122,162,242,233,181,3,205,176,168,16,101,150,92,3,104,226,243,57,25,235,242,109,59,45,97,237,117,181,47,113,98,79,135,23,11,33,121,92,126,177,245,103,155,174,128,190,161,97,121,147,36,213,9,177,185,212,197,177,199,241,13,148,1,97,131,98,120,1,243,242,174,124,102,31,31,143,223,2,31,92,52,34,175,236,232,43,243,151,228,113,165,141,71,117,200,131,55,177,5,248,67,255,175,187,142,206,123,224,176,209,21,97,203,191,143,113,176,195,155,241,89,173,32,73,3,17,113,22,18,102,195,15,74,55,36,58,201,139,14,245,224,55,79,125,220,208,6,133,213,236,243,213,218,84,67,219,63,147,140,9,237,244,161,241,234,172,106,112,101,203,192,177,128,150,29,81,33,68,210,34,75,231,123,199,86,231,18,31,47,136,197,15,56,213,242,175,171,18,240,66,132,147,137,112,156,227,184,85,27,17,43,88,237,122,152,76,40,14,241,96,153,234,35,209,204,203,149,212,226,32,91,155,104,174,223,79,48,5,195,227,211,201,119,221,33,66,249,233,88,63,133,108,172,103,159,233,255,144,113,171,249,64,68,194,48,225,60,82,248,113,2,228,244,151,52,209,20,202,123,63,138,188,247,137,234,136,169,150,116,79,194,229,12,96,155,168,48,33,34,21,152,181,209,242,60,1,36,89,248,4,158,167,3,52,76,56,147,59,219,186,21,216,212,70,48,107,165,100,24,2,164,218,154,213,2,161,142,79,51,104,242,227,11,106,16,234,152,125,81,158,69,224,76,100,118,222,117,62,147,73,19,140,171,134,82,239,191,190,133,68,217,50,133,60,108,88,69,165,101,4,0,2,216,119,95,60,208,163,129,149,224,23,9,94,225,80,63,112,117,130,160,161,196,125,235,80,249,88,186,34,145,228,135,130,203,218,179,141,230,168,29,25,242,1,67,163,119,218,105,243,90,109,80,250,164,118,170,79,39,111,61,161,107,196,108,219,144,159,54,144,80,76,206,87,61,89,107,133,208,75,53,152,186,223,8,196,255,74,24,11,62,18,212,215,29,135,142,13,185,224,4,41,48,59,200,68,70,192,184,107,216,208,222,196,15,58,2,206,3,149,49,117,122,126,91,1,8,187,158,105,63,25,231,182,203,204,110,62,40,170,95,153,99,67,169,30,232,119,141,49,175,205,41,145]},
            "surjectionProof":{"type":"Buffer","data":[1,0,1,14,221,20,123,237,174,137,33,255,127,37,142,147,186,161,93,33,110,138,166,99,112,207,55,11,134,9,231,201,190,49,149,195,184,59,80,46,225,79,113,226,202,66,252,53,195,43,5,254,200,149,130,187,175,240,134,248,202,200,132,239,212,216,243]}
        },
            "unblindData":{"asset":{"type":"Buffer","data":[73,154,129,133,69,246,186,227,159,192,59,99,127,42,78,30,100,229,144,202,193,188,58,111,109,113,170,68,67,101,76,20]},
            "assetBlindingFactor":{"type":"Buffer","data":[209,34,145,61,53,225,89,105,41,142,40,221,219,32,200,192,161,123,187,156,54,204,254,104,62,70,6,46,200,182,157,223]},
            "value":"100000",
            "valueBlindingFactor":{"type":"Buffer","data":[203,82,29,50,143,94,118,53,226,9,222,211,212,219,248,163,197,49,98,163,208,89,197,143,40,163,142,42,96,45,236,25]}
        },
            "script":"00205f94cfafee5e3b9e705a29ba18ce8294328cb030617da6d5aca2d5b88cb6759b"
    }
]

// transform json buffer rappresentation to proper buffer
const normalizeBuffers = (obj) => {
    if (Array.isArray(obj)) {
       obj = obj.map(o => normalizeBuffers(o))
    }
    if (typeof obj === "object") {
       if (obj["type"] === "Buffer") {
          obj = Buffer.from(obj, "hex")
       } else {
          Object.entries(obj).map(([key, value]) => {
             obj[key] = normalizeBuffers(value)
          })
       }
    }
    return obj
}

const outs = [
    {
      asset: "bea126b86ac7f7b6fc4709d1bb1a8482514a68d35633a5580d50b18504d5c322",
      sats: 1,
      to: "vjU7QGRybAyApGCQwXNT1tCr4mypSZ7bmJ6qs76PaXirq72orcmkxF5JpMJft9v5ssY7UeasweJUgWLd"
    },
    {
      asset: "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49",
      sats: 99500,
      to: "vjU7QGRybAyApGCQwXNT1tCr4mypSZ7bmJ6qs76PaXirq72orcmkxF5JpMJft9v5ssY7UeasweJUgWLd"
    },
    {
      asset: "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49",
      sats: 500
    }
]


const run = async() => {
    try {

        const parsedOwnedInputs = normalizeBuffers(ownedInputs)
        const parsedUtxos = normalizeBuffers(utxos)

        const inputs = parsedUtxos.map(u => {
            return new CreatorInput(u.txid, u.vout, "0xfffffffe")
        })

        // console.log(inputs)

        const outputs = outs.map((o, i) => {
            return new CreatorOutput(
                o.asset, 
                o.sats, 
                o.to ? address.toOutputScript(o.to) : undefined, 
                o.to ? address.fromConfidential(o.to).blindingKey : undefined, 
                o.to ? 0 : undefined
            )
        })

        // console.log(outputs)

        const pset = Creator.newPset({
            inputs,
            outputs
        })

        const updater = new Updater(pset)

        for (let i = 0; i < parsedUtxos.length; i++) {
            updater.addInWitnessUtxo(i, parsedUtxos[i].prevout)
            updater.addInUtxoRangeProof(i, parsedUtxos[i].prevout.rangeProof)
            updater.addInRedeemScript(i, Buffer.from(parsedUtxos[i].script, "hex"))
            updater.addInSighashType(i, Transaction.SIGHASH_ALL)
        }

        // console.log(pset)

        const zkpGenerator = ZKPGenerator.fromOwnedInputs(parsedOwnedInputs)
        const zkpValidator = new ZKPValidator()
        const outputBlindingArgs = await zkpGenerator.blindOutputs(
            pset,
            ZKPGenerator.ECCKeysGenerator(ecc)
        )

        console.log(outputBlindingArgs);
            
        const blinder = new Blinder(
            pset,
            parsedOwnedInputs,
            zkpValidator,
            zkpGenerator,
        )

        await blinder.blindLast({ outputBlindingArgs })

        const blindingNonces = []

        outputBlindingArgs.forEach(out => {
            blindingNonces.push(out.nonce.toString("hex") || "")
        })

        const psetBase64 = pset.toBase64()
        
        console.log(psetBase64)  
    } catch (error) {
        console.log(error)
    }
}

run()