export const state = () => ({
	user: JSON.parse(localStorage.getItem('user') || '{}'),
	accessToken: localStorage.getItem('accessToken'),
    network: null,
    txInProgress: null,
    txInProgressHash: null,
    txResult: null,
    isBusy: false,
    dashboardItems: [],
    smartContractBuilder: {
        baseURL: null,
        blockchain: null,
        chainId: null,
        collectionSize: null,
        email: null,
        hasWhitelist: false,
        hasDelayedReveal: false,
        hasOpenSeaRoyalties: true,
        name: null,
        symbol: null,
        marketplace: null,
        marketplaceCollection: {},
        revenueSplits: []
    }
  })

export const getters = {
	isLoggedIn: (state) => !!state.accessToken,
	userId: (state) => state.user?.id,
}
  
export const mutations = {
    setBusy(state, isBusy) {
        state.isBusy = isBusy
    },
    setNetwork(state, network) {
        state.network = network
    },
    setTx(state, tx) {
        state.txInProgress = tx
        state.txInProgressHash = tx?.hash
    },
    setTxResult(state, txResult) {
        state.txResult = txResult
    },
    updateUserCredits(state, count) {
        state.user.credits = count
        localStorage.setItem('user', JSON.stringify(state.user))
    },
    setUser(state, user) {
        state.user = user
    },
    setAccessToken(state, accessToken) {
		state.accessToken = accessToken
	},
    updateSmartContractBuilder(state, payload) {
        state.smartContractBuilder.marketplaceCollection = {
            ...state.smartContractBuilder.marketplaceCollection,
            ...payload.marketplaceCollection,
        }

        delete payload.marketplaceCollection

        state.smartContractBuilder = { 
            ...state.smartContractBuilder,
            ...payload,
        }
    },
    updateBuilderRevenueSplits(state, payload) {
        state.smartContractBuilder.revenueSplits = payload
    },
    setDashboardItems(state, payload) {
        state.dashboardItems = payload
    },
    resetSmartContractBuilder(state, payload) {
        state.smartContractBuilder = { 
            marketplaceCollection: {}
        }
    }
}

export const actions = {
    async removeDashboardCard({commit, state}, id) {
        await this.$axios.delete(`/smartcontracts/${id}`)
        commit('setDashboardItems', state.dashboardItems.filter(x => x.id !== id))
    },
    async getCreditsCount({commit, state}) {
        const { data: userCredits } = await this.$axios.get(`/users/${state.user.id}/credits`)
        commit('updateUserCredits', userCredits)
        return userCredits
    },
    async login({commit, state}, payload) {
		try {
			
			if(!this.$wallet.account) {
				await this.$wallet.connect()
			}
			
			const { account: publicKey } = this.$wallet
			
			let { data: nonce } = await this.$axios.get("/users/nonce", { params: { publicKey }})
		
			if(!nonce) {
				const { data: createdUser } = await this.$axios.post("/users", { publicKey, ...payload })
				// console.log({createdUser})
				nonce = createdUser.nonce
			}
			
			const signature = await this.$wallet.requestSignature(nonce)
			const { data: authData } = await this.$axios.post("auth", {
				publicKey,
				signature,
			})
			// console.log( {authData} )
		
			const { accessToken, user: authUser } = authData

			localStorage.setItem('accessToken', accessToken)
			localStorage.setItem('user', JSON.stringify(authUser))
			commit('setUser', authUser)
			commit('setAccessToken', accessToken)

            return authUser
		} catch (err) {
			console.error({err})
			alert(err.message || "Login Error")

            return null
		}
    },

    logout({commit, state}) {
        this.$wallet.disconnect()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        commit('setUser', null)
        commit('setAccessToken', null)
    }
}