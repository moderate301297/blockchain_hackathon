
var fs = require('fs');
let peerPem = fs.readFileSync('/home/luatcoi/Project/src/blockchain_hackathon/hlf/first-network/crypto-config/peerOrganizations/org1.com/peers/peer0.org1.com/tls/ca.crt');
let ordererPem = fs.readFileSync('/home/luatcoi/Project/src/blockchain_hackathon/hlf/first-network/crypto-config/ordererOrganizations/com/orderers/orderer.com/tls/ca.crt');
module.exports = {
    PEER_PEM: peerPem,
    ORDERER_PEM: ordererPem,
    PEER_HOST: "localhost:7051",
    EVENT_HOST: "localhost:7051",
    ORDERER_HOST: "localhost:7050",
    ORDERER_DOMAIN: "orderer.com",
    PEER_DOMAIN: "peer0.org1.com",
    TLS_ENABLED: "true",
    MSPID: "Org1MSP",
    CA_SERVER_NAME: "ca-org1",
    CA_HOST: "localhost:7054"
};

/*
var fs = require('fs');
let peerPem = fs.readFileSync('/home/luatcoi/Project/src/driving-files/crypto-config/peerOrganizations/org2/peers/peer0.org2/tls/ca.crt');
let ordererPem = fs.readFileSync('/home/luatcoi/Project/src/driving-files/crypto-config/ordererOrganizations/orgorderer/orderers/orderer0.orgorderer/tls/ca.crt');
module.exports = {
    PEER_PEM: peerPem,
    ORDERER_PEM: ordererPem,
    PEER_HOST: "localhost:30601",
    EVENT_HOST: "localhost:30603",
    ORDERER_HOST: "localhost:32000",
    ORDERER_DOMAIN: "orderer0.orgorderer",
    PEER_DOMAIN: "peer0.org2",
    TLS_ENABLED: "true",
    MSPID: "Org1MSP",
    CA_SERVER_NAME: "ca",
    CA_HOST: "localhost:30500"
};
*/
