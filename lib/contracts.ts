// USDC Contract on Avalanche Fuji Testnet
export const USDC_FUJI = {
  address: '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}`,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
};

// ERC20 ABI for USDC operations
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// DEX Router for swaps (Trader Joe on Fuji)
export const TRADER_JOE_ROUTER = {
  address: '0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901' as `0x${string}`,
};

// WAVAX (Wrapped AVAX) on Fuji
export const WAVAX_FUJI = {
  address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c' as `0x${string}`,
  decimals: 18,
  symbol: 'WAVAX',
  name: 'Wrapped AVAX',
};
