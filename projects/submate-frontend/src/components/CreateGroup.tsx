import { useWallet } from '@txnlab/use-wallet-react'
import { getAlgodConfigFromViteEnvironment, getAppId, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { SubmateClient } from '../contracts/Submate';
import { useState } from 'react'
import { useSnackbar } from 'notistack'

interface CreateGroupInterface {
  openModal: boolean
  closeModal: () => void
}

const CreateGroup = ({ openModal, closeModal }: CreateGroupInterface) => {

  const [loading, setLoading] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>("")
  const [subscription, setSubscription] = useState<string>("")
  const [perUserFee, setPerUserFee] = useState<number>(1)
  const [maxMembers, setMaxMembers] = useState<number>(1)

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const appId = getAppId().appId;

  const submateClient = new SubmateClient({
    appId: appId,
    algorand,
    defaultSender: activeAddress ?? undefined,
  });


  const handleCreateGroup = async () => {
    try {
      setLoading(true)

      await submateClient.send.createGroup({
        args: [
          groupName,
          subscription,
          perUserFee,
          maxMembers,
          activeAddress ?? '',
        ]
      });

      enqueueSnackbar("Group created successfully!", { variant: "success" })
      closeModal()
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }


  if (!openModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent">
      <form
        method="dialog"
        className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4 flex flex-col items-center justify-center relative"
        onSubmit={(e) => { e.preventDefault(); handleCreateGroup() }}
      >
        <button
          type="button"
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 font-bold text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center"
          onClick={closeModal}
        >
          ×
        </button>
        <h3 className="font-bold text-2xl mb-6">Create Group</h3>
        <label className="mb-1 font-semibold w-full text-left">Group Name</label>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
          required
        />

        <label className="mb-1 font-semibold w-full text-left">Subscription</label>
        <input
          type="text"
          placeholder="Subscription"
          value={subscription}
          onChange={(e) => setSubscription(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
          required
        />

        <label className="mb-1 font-semibold w-full text-left">Per User Fee</label>
        <input
          type="number"
          placeholder="Per User Fee"
          value={perUserFee}
          onChange={(e) => setPerUserFee(Number(e.target.value))}
          className="mb-4 p-2 border rounded w-full"
          required
        />

        <label className="mb-1 font-semibold w-full text-left">Max Members</label>
        <input
          type="number"
          placeholder="Max Members"
          value={maxMembers}
          onChange={(e) => setMaxMembers(Number(e.target.value))}
          className="mb-4 p-2 border rounded w-full"
          required
        />

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            type="button"
            className="bg-gray-400 text-white rounded px-4 py-2"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  )
}
export default CreateGroup
