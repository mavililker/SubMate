import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  if (!openModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent">
      <form
        method="dialog"
        className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4 flex flex-col items-center justify-center relative"
      >
        <h3 className="font-bold text-2xl mb-6">Select wallet provider</h3>

        <div className="grid w-full mb-6">
          {activeAddress && (
            <>
              <Account />
              <div className="divider" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                type="button"
                data-test-id={`${wallet.id}-connect`}
                className="m-2 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded shadow hover:from-teal-600 hover:to-teal-800 flex items-center justify-center space-x-3 px-4 py-2"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  return wallet.connect()
                }}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    style={{ objectFit: 'contain', width: '30px', height: 'auto' }}
                  />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <button
            type="button"
            data-test-id="close-wallet-modal"
            className="bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded shadow hover:from-gray-600 hover:to-gray-800 px-4 py-2"
            onClick={() => {
              closeModal()
            }}
          >
            Close
          </button>
          <div />
          {activeAddress && (
            <button
              type="button"
              className="bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded shadow hover:from-pink-600 hover:to-pink-800 px-4 py-2"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    // Required for logout/cleanup of inactive providers
                    // For instance, when you login to localnet wallet and switch network
                    // to testnet/mainnet or vice verse.
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              Logout
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
export default ConnectWallet
