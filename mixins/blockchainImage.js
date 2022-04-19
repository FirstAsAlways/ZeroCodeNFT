import { BLOCKCHAIN } from '@/constants'

export default {
    data() {
		return {
			blockchainImage: {
				[BLOCKCHAIN.Ethereum]: require('@/assets/images/blockchain/ethereum.svg'),
				[BLOCKCHAIN.Solana]: require('@/assets/images/blockchain/solana.svg'),
				[BLOCKCHAIN.Fantom]: require('@/assets/images/blockchain/fantom.svg'),
				[BLOCKCHAIN.Polygon]: require('@/assets/images/blockchain/polygon.svg'),
				[BLOCKCHAIN.Avalanche]: require('@/assets/images/blockchain/avalanche.svg'),
				[BLOCKCHAIN.BinanceSmartChain]: require('@/assets/images/blockchain/binancesmartchain.svg'),
				[BLOCKCHAIN.Cronos]: require('@/assets/images/blockchain/cronos.svg'),
				[BLOCKCHAIN.Songbird]: require('@/assets/images/blockchain/songbird.svg'),
				[BLOCKCHAIN.Thinkium]: require('@/assets/images/blockchain/thinkium.svg'),
				[BLOCKCHAIN.Arbitrum]: require('@/assets/images/blockchain/arbitrum.svg'),
			},
			blockchainIcon: {
				[BLOCKCHAIN.Ethereum]: require('@/assets/images/blockchain/icon/ethereum.svg'),
				[BLOCKCHAIN.Solana]: require('@/assets/images/blockchain/icon/solana.svg'),
				[BLOCKCHAIN.Fantom]: require('@/assets/images/blockchain/icon/fantom.svg'),
				[BLOCKCHAIN.Polygon]: require('@/assets/images/blockchain/icon/polygon.svg'),
				[BLOCKCHAIN.Avalanche]: require('@/assets/images/blockchain/icon/avalanche.svg'),
				[BLOCKCHAIN.BinanceSmartChain]: require('@/assets/images/blockchain/icon/binancesmartchain.svg'),
				[BLOCKCHAIN.Cronos]: require('@/assets/images/blockchain/icon/cronos.svg'),
				[BLOCKCHAIN.Songbird]: require('@/assets/images/blockchain/icon/songbird.svg'),
				[BLOCKCHAIN.Thinkium]: require('@/assets/images/blockchain/icon/thinkium.svg'),
				[BLOCKCHAIN.Arbitrum]: require('@/assets/images/blockchain/icon/arbitrum.svg'),
			}
		}
	},
}