import { useState } from "react";
import { useSnackbar } from "notistack";

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

  const handleGetRecommendation = async () => {
    setLoading(true);
    try {
      // Mevcut grupları örnek olarak AI'ye veriyoruz
      const existingGroups: GroupSuggestion[] = [
        { group_name: "Netflix Lovers", subscription: "Netflix", fee: 5, max_members: 3, members: ["alice"], creator: "alice" },
        { group_name: "Disney Fans", subscription: "Disney+", fee: 7, max_members: 4, members: ["bob", "carol"], creator: "bob" }
      ];

      const prompt = `
        Kullanıcı bir abonelik tercihi verdi: "${subscriptionPref}".
        Mevcut gruplar: ${JSON.stringify(existingGroups)}
        Bu kullanıcı için 3-5 uygun grup önerisi üret.
        Her öneri şu yapıda olmalı:
        {
          group_name: string,
          subscription: string,
          fee: number,
          max_members: number,
          members: string[],
          creator: string
        }
        Kullanıcı için yalnızca mevcut gruplardan uygun olanları seç.
        Yeni veya uydurma grup oluşturma.
        JSON array olarak döndür, sadece group_name, subscription, fee, max_members, members, creator alanlarını kullan.
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
      const aiResponse: GroupSuggestion[] = await response.json(); // backend direkt array döndürüyorsa bu yeterli


      console.log(aiResponse);
      console.log(Array.isArray(aiResponse)); // true ise array, false ise tek obje
      setSuggestions(aiResponse);
      console.log(suggestions)
      enqueueSnackbar("Öneriler alındı!", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = (group: GroupSuggestion) => {
    // Burada smart contract call yapılacak
    enqueueSnackbar(`Joined ${group.group_name}!`, { variant: "success" });
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-transparent">
      {suggestions.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 w-80 max-w-sm relative">
            <h2 className="text-xl font-bold mb-2 text-center w-full">Bilgiler</h2>

            <input
              type="text"
              placeholder="Abonelik Tercihi"
              value={subscriptionPref}
              onChange={(e) => setSubscriptionPref(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              className={`bg-blue-600 text-white rounded px-4 py-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleGetRecommendation}
              disabled={loading}
            >
              {loading ? "Öneri Alıyor..." : "Öneri Al"}
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
                <p>Abonelik: {group.subscription}</p>
                <p>Ücret: {group.fee} Algo</p>
                <p>Üyeler: {group.members.join(", ")} / Max: {group.max_members}</p>
                <p>Oluşturan: {group.creator}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-600 text-white rounded px-4 py-2 flex-1"
                    onClick={() => handleJoinGroup(group)}
                  >
                    Katıl
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
