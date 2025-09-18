export const factoryAbi = [
  {
    "inputs": [
      {
        "internalType": "contract IUniswapV3Factory",
        "name": "uniFactory",
        "type": "address"
      },
      {
        "internalType": "contract INonfungiblePositionManager",
        "name": "uniNftManager",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "usdc",
        "type": "address"
      },
      {
        "internalType": "contract IBondingCurve",
        "name": "bondingCurve",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "initUsdcReserve",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "finalUsdcReserve",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mintCost",
        "type": "uint256"
      },
      {
        "internalType": "uint160",
        "name": "startUsdcPerAiSqrtPriceX96",
        "type": "uint160"
      },
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "treasuryWallet",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "buybackWallet",
        "type": "address"
      },
      {
        "internalType": "int24",
        "name": "defaultLowerTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "defaultUpperTick",
        "type": "int24"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "BacktestingAlreadyPurchased",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BondingCurveCompleted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientAgentTokenAvailable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientOutputAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      }
    ],
    "name": "MaliciousPoolDeployment",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NonexistentAgent",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agent",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "name": "AgentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "name": "AgentTokenPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "name": "AgentTokenSold",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "BacktestingPaymentReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "agentFees",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "usdcFees",
        "type": "uint256"
      }
    ],
    "name": "CurveFeesClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "positionId",
        "type": "uint256"
      }
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "agentFees",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "usdcFees",
        "type": "uint256"
      }
    ],
    "name": "PoolFeesClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BONDING_CURVE",
    "outputs": [
      {
        "internalType": "contract IBondingCurve",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BUYBACK_WALLET",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FINAL_USDC_RESERVE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINT_COST",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "START_USDC_PER_AI_SQRT_PRICE_X96",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "",
        "type": "uint160"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TREASURY_WALLET",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UNI_FACTORY",
    "outputs": [
      {
        "internalType": "contract IUniswapV3Factory",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UNI_NFT_MANAGER",
    "outputs": [
      {
        "internalType": "contract INonfungiblePositionManager",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "USDC",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "agentInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "purchasedBacktesting",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "liquidityPositionId",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "bondingCurveInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "reserveUsdc",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reserveAgentToken",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      }
    ],
    "name": "buyAgentToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "claimBondingCurveFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "claimPoolFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "name": "createAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "fees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "accruedAgent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accruedUsdc",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "agentAddress",
        "type": "address"
      }
    ],
    "name": "purchaseBacktesting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "agentToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      }
    ],
    "name": "sellAgentToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]