// neoscan get_all_nodes

require('module-alias/register')

const program = require('commander');

const neoscan = require('nodejs_neoscan/neoscan')
const dbg     = require('nodejs_util/debug')

function print(msg) {
  console.log(msg);
}

let argus = process.argv

program
  .version('0.1.0')
  .usage('')
  .option('-D, --Debug', 'Debug')
  .option('-n, --net [net]', 'Select Neoscan network [net]: i.e., test_net or main_net (will use correct neoscan host and path respectively - defaults to test_net)', 'test_net')
  .parse(argus);

if (program.Debug) {
  print('DEBUGGING')
  neoscan.debug(true)
}

neoscan.set_net(program.net)
 neoscan.get_all_nodes().then(result => {
   dbg.logDeep('result:\n', result)
 })
