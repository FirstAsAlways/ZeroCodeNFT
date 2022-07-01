<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4>Delayed Reveal</h4>
			</b-col>
			<b-col sm="12" md="3">
				<b-overlay :show="isBusy">
					<b-button variant="primary" block @click="save">Save</b-button>
				</b-overlay>
			</b-col>
		</b-row>
		<p v-show="url">
			Current Metadata URL: <b>{{ url }}</b>
		</p>
		<!-- <b-row>
			<b-col>
				<b-form-group label="Existing metadata URL">
					<b-input v-model="url" />
				</b-form-group>
			</b-col>
		</b-row>
		<b-row>
			<b-col class="text-center">
				<h3>No Metadata? Create New!</h3>
			</b-col>
		</b-row> -->
		<b-row>
			<b-col>
				<b-form novalidate>
					<b-form-group label="Name">
						<b-form-input
							v-model="metadata.name"
							placeholder="e.g. Hidden Monkey"
							:state="validateState('metadata.name')" />
						<b-form-invalid-feedback :state="state.name">
							Please provide name for the metadata.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group label="Description">
						<b-form-textarea
							v-model="metadata.description"
							placeholder="e.g. Hidden Monkey is still hidden"
							:state="validateState('metadata.description')" />
						<b-form-invalid-feedback :state="state.description">
							Please provide description for the metadata.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group label="Image">
						<b-form-file
							v-model="metadata.image"
							accept="image/*"
							:state="validateState('metadata.image')" />
						<b-form-invalid-feedback :state="state.image">
							Please select the delayed reveal image.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group>
						<template #label>
							<div class="d-flex">
								<ExternalLink
									text="nft.storage API key"
									href="https://nft.storage/docs/#get-an-api-token"></ExternalLink>
								<b-form-checkbox class="ml-3" switch v-model="rememberApiKey"
									>Remember Key</b-form-checkbox
								>
							</div>
						</template>
						<b-form-input
							v-model="metadata.apiKey"
							:state="validateState('metadata.apiKey')"
							placeholder="Enter nft.storage api key." />
						<b-form-invalid-feedback :state="state.apiKey">
							Please provide the nft.storage api key.
						</b-form-invalid-feedback>
					</b-form-group>
				</b-form>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { ethers } from 'ethers'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'
import { required } from 'vuelidate/lib/validators'
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'
import { validateState, getMetamaskError } from '@/utils'

export default {
	props: {
		smartContract: Object,
	},
	data() {
		return {
			isBusy: false,
			contract: null,
			url: null,
			uploadedMetadataUrl: null,
			metadata: {
				name: '',
				description: '',
				image: [],
				apiKey: null,
			},
			rememberApiKey: false,
		}
	},
	computed: {
		state() {
			return {
				name: !this.$v.metadata.name.$error,
				description: !this.$v.metadata.description.$error,
				image: !this.$v.metadata.image.$error,
				apiKey: !this.$v.metadata.apiKey.$error,
			}
		},
	},
	validations: {
		metadata: {
			name: { required },
			description: { required },
			image: { required },
			apiKey: { required },
		},
	},
	async created() {
		this.metadata.apiKey = localStorage.getItem('zcnft_nft_storage_api_key')
		const { abi, address, chainId } = this.smartContract
		const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
		const jsonRpcProvider = new ethers.providers.StaticJsonRpcProvider(
			providerUrl
		)
		this.contract = new ethers.Contract(address, abi, jsonRpcProvider)
		this.url = await this.contract?.preRevealURL()
	},
	methods: {
		validateState,
		async save() {
			this.$v.$touch()
			if (this.$v.metadata.$invalid) {
				return
			}
			if (this.rememberApiKey) {
				localStorage.setItem('zcnft_nft_storage_api_key', this.metadata.apiKey)
			}
			try {
				this.isBusy = true
				this.uploadedMetadataUrl = await this.uploadMetadata()
				await this.commit()
			} catch (err) {
				this.$bvToast.toast(getMetamaskError(err, 'Update failed'), {
					title: 'Delayed Reveal URL',
					variant: 'danger',
				})
			} finally {
				this.isBusy = false
			}
		},
		async uploadMetadata() {
			const { apiKey, name, description, image } = this.metadata
			const client = new NFTStorage({ token: apiKey })
			const metadata = await client.store({
				image,
				name,
				description,
			})
			return metadata.url
		},
		async commit() {
			if (this.$wallet.isConnected) {
				await this.$wallet.connect()
			}

			if (this.$wallet.chainId !== +this.smartContract.chainId) {
				await this.$wallet.switchNetwork(this.smartContract.chainId)
			}

			const signedContract = this.contract.connect(
				this.$wallet.provider.getSigner()
			)
			const gasPrice = await this.$wallet.provider.getGasPrice()
			console.info(
				`GAS PRICE: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`
			)

			const tx = await signedContract.setPreRevealUrl(this.url, {
				gasPrice,
			})

			this.$bvToast.toast('Update transaction accepted', {
				title: 'Delayed Reveal URL',
				variant: 'success',
			})

			this.url = this.uploadedMetadataUrl

			await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
				delayedRevealURL: this.url,
			})

			tx.wait().then((_) => {
				this.$bvToast.toast('Update transaction complete', {
					title: 'Delayed Reveal URL',
					variant: 'success',
				})
			})
		},
	},
}
</script>