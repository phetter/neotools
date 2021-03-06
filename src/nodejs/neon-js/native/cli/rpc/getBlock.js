// RPC getBlock CLI that calls native/modules/rpc/getBlock from CLI
// Main Dependency: neon-js
// This returns a block or an array of transactions for a block

// IMPORTANT OPTIMIZATION NOTE: As of /NEO:2.8.0/, the only difference in the return value of getRawTransaction versus getBlock is three fields more in the former:
// blockhash, confirmations, and blocktime.  Don't make the extra RPC call to getRawTransaction if you don't need to.


require('module-alias/register')


const program     = require('commander')
const _           = require('underscore')

const neon        = require('@cityofzion/neon-js')
const dbg         = require('nodejs_util/debug')
const netUtil     = require('nodejs_util/network')
const getNodesBy  = require('nodejs_rpc-over-https/v2.9.0/client/module/getNodesBy')

var cfg           = require('nodejs_config/config.js')
var config        = cfg.load('nodejs_config/nodejs.config.json')

const command     = require('nodejs_neon-js/native/modules/rpc/getBlock')

let nodes = []
let defly = false
let arg

function print(msg) {
  console.log(msg);
}

program
  .version('0.2.0')
  .usage('')
  .usage('')
  .option('-D, --Debug', 'Debug')
  .option('-n, --node [node]', 'set RPC node to use (be sure to preface with https://), if not provided will try to use node with tallest block')
  .option('-h, --hash [hash]', 'specify the hash of the block to fetch, if no hash or index is supplied will get the tallest')
  .option('-i, --index [index]', 'specify the number of the block to fetch, if no hash or index is supplied will get the tallest')
  .option('-t, --time', 'Only return time field of last block - this does not work with -T option')
  .option('-T, --Txs', 'Only return an array of transactions for the block')
  .option('-H, --Human', 'I am human so make outputs easy for human')
  .option('-N, --Net [Net]', 'Select network [net]: i.e., TestNet or MainNet', 'TestNet')
  .on('--help', function(){
    print('OPTIMIZATION NOTE: \n\nAs of /NEO:2.8.0/, the only difference in the return value of getRawTransaction versus getBlock is three fields more in the former: blockhash, confirmations, and blocktime. Don\'t make the extra RPC call to getRawTransaction if you don\'t need to.')
  })
  .parse(process.argv)


if (program.Debug) {
  print('DEBUGGING: ' + __filename)
  defly = true
  netUtil.debug()
}

if (program.hash) arg = program.hash
if (program.index) arg = parseInt(program.index)

if (!program.node) {
  // get a node from the list and try it
  let net = netUtil.resolveNetworkId(program.Net)

  nodes = cfg.getNodes(net)

  if (defly) dbg.logDeep('config nodes: ', nodes)

  let options = {
    net: net,
    order: 'asc',
    nodes: nodes
  }

  getNodesBy.tallest(options).then(rankedNodes => {
    if (defly) dbg.logDeep('sorted nodes: ', rankedNodes)
    nodes = rankedNodes
    commandWrapper(nodes)
  }).catch (error => {
      print('neon-js.getNodesByTallest(): ' + error.message)
  })

} else {
  nodes.push({ "url": program.node })
  commandWrapper(nodes)
}

function commandWrapper(nodelist) {
  let runtimeArgs = {
    'Debug': defly,
    'node': nodelist[0].url,
    'hash': program.hash,
    'index': program.index,
    'time': program.time ? program.time : false,
    'human': program.Human ? program.Human : false,
    'txs': program.Txs ? program.Txs : false,
    'index': program.index
  }

  if (defly) dbg.logDeep('runtimeArgs: ', runtimeArgs)

  command.run(runtimeArgs).then((r) => {
    dbg.logDeep(' ', r)
  })
  .catch (error => {
    print(__filename + ': ' + error.message)
  })
}
