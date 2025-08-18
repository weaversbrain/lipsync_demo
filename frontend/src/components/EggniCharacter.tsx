import { useRive } from "@rive-app/react-canvas";
import { useNavigate } from "react-router-dom";
import TTSControls from "./TTSControls";
import { useStateMachineInput } from "@rive-app/react-canvas";

// 캐릭터 정보
const characters = [
  { id: "thanos", name: "Thanos", path: "/thanos" },
  { id: "moco", name: "Moco", path: "/moco" },
  { id: "eggni", name: "Eggni", path: "/eggni" },
];

function EggniCharacter() {
  const navigate = useNavigate();

  const { rive, RiveComponent } = useRive({
    src: "/viseme_animation/eggni.riv",
    stateMachines: ["State Machine 1"],
    autoplay: true,
  });
  const visemeInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "viseme",
    0
  );

  const handleVisemeChange = (visemeId: number) => {
    if (visemeInput) {
      visemeInput.value = visemeId;
    }
  };

  const handleAudioEnd = () => {
    if (visemeInput) {
      visemeInput.value = 0;
    }
  };

  return (
    <div className="flex w-full h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* 왼쪽 - Rive 애니메이션 */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center">
        <RiveComponent />
      </div>

      {/* 오른쪽 - 컨트롤 패널 */}
      <div className="w-1/2 p-8 flex flex-col">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 h-full border border-white/20">
          {/* 캐릭터 선택 */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Character Selection
            </h3>
            <div className="flex gap-2">
              {characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => navigate(character.path)}
                  className={`px-4 py-2 rounded-xl font-medium shadow-md transition-all duration-200 ${
                    character.id === "eggni"
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {character.name}
                </button>
              ))}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Eggni Controls
          </h3>

          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-600">
              Eggni 캐릭터의 애니메이션 시스템이 구현 예정입니다. 현재는 TTS
              기능만 사용 가능합니다.
            </p>
          </div>

          <TTSControls
            onVisemeChange={handleVisemeChange}
            onAudioEnd={handleAudioEnd}
            theme={{
              titleColors: "from-green-600 to-emerald-600",
              primaryColor: "green-600",
              hoverColor: "green-700",
              focusColor: "green-500",
            }}
            version={2}
          />
        </div>
      </div>
    </div>
  );
}

export default EggniCharacter;