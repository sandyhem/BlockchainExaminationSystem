import React from 'react'
import Web3 from 'web3';

export default function Account() {
    // Number of accounts you want to generate
const numAccounts = 3;
const web3 = new Web3();
const alloc = {};

for (let i = 0; i < numAccounts; i++) {
  const account = web3.eth.accounts.create();
  console.log(`Account ${i + 1}`);
  console.log(`Address: ${account.address}`);
  console.log(`Private Key: ${account.privateKey}\n`);

  // Add to genesis alloc format
  alloc[account.address.toLowerCase()] = {
    privateKey: account.privateKey.replace(/^0x/, ''),
    comment: `Dev account ${i + 1}`,
    balance: '1000000000000000000000' // 1000 ETH
  };
}

console.log('\n🔐 Add this to your "alloc" in genesis.json:\n');
console.log(JSON.stringify(alloc, null, 2));
  return (
    <div>account</div>
  )
}
