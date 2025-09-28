import { useState } from "react";
import { useSnackbar } from "notistack";
import { getAlgodConfigFromViteEnvironment, getAppId, getIndexerConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";
import { algo, AlgorandClient } from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { SubmateClient } from "../contracts/Submate";

interface GroupSuggestion {
  group_name: string;
  subscription: string;
  fee: number;
  max_members: number;
  members: string[];
  creator: string;
}

interface JoinGroupInterface {
  openModal: boolean
  closeModal: () => void
}

const JoinGroup = ({ openModal, closeModal }: JoinGroupInterface) => {
  const [subscriptionPref, setSubscriptionPref] = useState("");
  const [suggestions, setSuggestions] = useState<GroupSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { transactionSigner, activeAddress } = useWallet()
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })

  const appId = getAppId().appId;

  algorand.setDefaultSigner(transactionSigner)
  const indexer = algorand.client.indexer;

  const submateClient = new SubmateClient({
    appId: appId,
    algorand,
    defaultSender: activeAddress ?? undefined,
  });


  /// Devamı gelmeli.





  const handleGetRecommendation = async () => {
    if (!subscriptionPref.trim()) {
      enqueueSnackbar("Please enter a subscription preference", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const txns = await indexer.searchForTransactions().applicationID(getAppId().appId).do();
      console.log(txns);
      // Mevcut grupları al
      const existingGroups: GroupSuggestion[] = [
        {
          group_name: "Netflix Fans United",
          subscription: "Netflix",
          fee: 6,
          max_members: 5,
          members: ["alice", "bob"],
          creator: activeAddress ?? ''
        },
        {
          group_name: "Movie Buffs Society",
          subscription: "Netflix",
          fee: 4,
          max_members: 6,
          members: ["carol"],
          creator: activeAddress ?? ''
        },
        {
          group_name: "TV Show Addicts",
          subscription: "Netflix",
          fee: 5,
          max_members: 4,
          members: [],
          creator: activeAddress ?? ''
        }
      ];
      const prompt = `
      The user has provided a subscription preference: "${subscriptionPref}".
      Here are the existing groups (in JSON format): ${JSON.stringify(existingGroups)}

      Only choose from the existing groups that the user can join.
      Do not create new or imaginary groups.
      IMPORTANT ! Return only a valid JSON array — starting with "[" and ending with "]".
      Use only the following keys for each group object:
      "group_name", "subscription", "fee", "max_members", "members", "creator".
      Each key must have a valid value.
      My maximum token limit is 1000.
      ⚠️ Do not include any extra quotes, explanations, or formatting.
      Only return the pure JSON array like this:
      [
        {
          "group_name": "...",
          "subscription": "...",
          "fee": ...,
          "max_members": ...,
          "members": [...],
          "creator": "..."
        },
        ...
      ]
      `;

      const response = await fetch(`http://localhost:3000/getresponse?prompt=${encodeURIComponent(prompt)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch group suggestions');
      }
      const aiResponse: GroupSuggestion[] = await response.json();


      console.log(aiResponse);
      console.log(Array.isArray(aiResponse));
      setSuggestions(aiResponse);
      console.log(suggestions)
      enqueueSnackbar("Suggestions received!", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group: GroupSuggestion) => {
    try {
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress ?? '',
        receiver: group.creator,
        amount: algo(1),
      })
      enqueueSnackbar(`Joined ${group.group_name}!`, { variant: "success" });
      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      closeModal();
    } catch (e) {
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
      console.log(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-transparent">
      {suggestions.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 w-80 max-w-sm relative">
            <h2 className="text-xl font-bold mb-2 text-center w-full">Information</h2>

            <input
              type="text"
              placeholder="Subscription Preference"
              value={subscriptionPref}
              onChange={(e) => setSubscriptionPref(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <button
              className={`bg-blue-600 text-white rounded px-4 py-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleGetRecommendation}
              disabled={loading}
            >
              {loading ? "Fetching Suggestions..." : "Get Suggestions"}
            </button>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-800 font-bold text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Sağ panel */}
      {suggestions.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            className="w-80 max-w-sm max-h-[80vh] overflow-y-auto space-y-4 relative"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              type="button"
              className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-800 font-bold text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closeModal}
            >
              ×
            </button>
            {suggestions.map((group) => (
              <div key={group.group_name} className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 mb-4">
                <h3 className="text-lg font-bold ">{group.group_name}</h3>
                <p>Subscription: {group.subscription}</p>
                <p>Fee: {group.fee} Algo</p>
                <p>Members: {group.members.join(", ")} / Max: {group.max_members}</p>
                <p>Creator: {group.creator}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-600 text-white rounded px-4 py-2 flex-1"
                    onClick={() => handleJoinGroup(group)}
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGroup;
