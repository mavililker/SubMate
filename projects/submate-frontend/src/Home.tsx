// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import CreateGroup from './components/CreateGroup'
import JoinGroup from './components/JoinGroup'

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openCreateModal, setCreateModal] = useState<boolean>(false)
  const [openJoinModal, setJoinModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleCreateModal = () => {
    setCreateModal(!openCreateModal)
  }

  const toggleJoinModal = () => {
    setJoinModal(!openJoinModal)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-lg w-full bg-white bg-opacity-90 rounded-3xl shadow-xl p-10">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Welcome to <span className="font-black">SubMate</span>
        </h1>

        <div className="space-y-6">
          <button
            data-test-id="connect-wallet"
            onClick={toggleWalletModal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-600 text-white font-semibold shadow-lg hover:from-teal-500 hover:to-cyan-700 transition-colors duration-300"
          >
            Connect Wallet
          </button>

          {activeAddress && (
            <>
              <button
                data-test-id="create-group"
                onClick={toggleCreateModal}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-colors duration-300"
              >
                Create Group
              </button>

              <button
                data-test-id="join-group"
                onClick={toggleJoinModal}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold shadow-lg hover:from-pink-600 hover:to-rose-700 transition-colors duration-300"
              >
                Join Group
              </button>
            </>
          )}
        </div>
      </div>

      {/* Wallet Modal */}
      {openWalletModal && (
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative">
            <button
              onClick={toggleWalletModal}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              &#10005;
            </button>
            <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {openCreateModal && (
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative">
            <button
              onClick={toggleCreateModal}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              &#10005;
            </button>
            <CreateGroup openModal={openCreateModal} closeModal={toggleCreateModal} />
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {openJoinModal && (
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative">
            <button
              onClick={toggleJoinModal}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              &#10005;
            </button>
            <JoinGroup openModal={openJoinModal} closeModal={toggleJoinModal} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
