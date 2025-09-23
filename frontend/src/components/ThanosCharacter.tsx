import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TTSControls from "./TTSControls";

// 캐릭터 정보
const characters = [
  { id: "pico-v2", name: "Pico V2", path: "/pico-v2" },
  { id: "pico", name: "Pico", path: "/pico" },
  { id: "eggni", name: "Eggni", path: "/eggni" },
  { id: "thanos", name: "Thanos", path: "/thanos" },
];

function ThanosCharacter() {
  const navigate = useNavigate();

  const { rive, RiveComponent } = useRive({
    src: "/viseme_animation/thanos.riv",
    stateMachines: [
      "head-movement",
      "eye-movement",
      "mouth-movement",
      "bounce",
    ],
    autoplay: true,
  });

  const headDownInput = useStateMachineInput(
    rive,
    "head-movement",
    "down",
    false
  );
  const visemeInput = useStateMachineInput(rive, "mouth-movement", "viseme", 0);
  const blinkInput = useStateMachineInput(rive, "eye-movement", "blink", false);
  const jokeInput = useStateMachineInput(rive, "eye-movement", "joke", false);

  // 랜덤 눈깜빡임 효과
  useEffect(() => {
    if (!blinkInput) return;
    const scheduleNextBlink = () => {
      const randomDelay = Math.random() * 3000 + 2000;
      setTimeout(() => {
        blinkInput.value = true;
        setTimeout(() => {
          blinkInput.value = false;
          scheduleNextBlink();
        }, 100);
      }, randomDelay);
    };
    scheduleNextBlink();
  }, [blinkInput]);

  // 랜덤 머리 움직임 효과
  useEffect(() => {
    if (!headDownInput) return;
    const scheduleNextHeadMovement = () => {
      const randomDelay = Math.random() * 3000 + 3000;
      setTimeout(() => {
        headDownInput.value = true;
        setTimeout(() => {
          headDownInput.value = false;
          scheduleNextHeadMovement();
        }, 300);
      }, randomDelay);
    };
    scheduleNextHeadMovement();
  }, [headDownInput]);

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
    <div className="flex w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 왼쪽 - Rive 애니메이션 */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center">
        <RiveComponent />
      </div>

      {/* 오른쪽 - TTS 입력 */}
      <div className="w-1/2 p-8 flex flex-col">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 h-full border border-white/20">
          {/* 캐릭터 선택 */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Character Selection
            </h3>
            <div className="flex gap-2">
              {characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => navigate(character.path)}
                  className={`px-4 py-2 rounded-xl font-medium shadow-md transition-all duration-200 ${
                    character.id === "thanos"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {character.name}
                </button>
              ))}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thanos Controls
          </h3>

          <div className="flex gap-x-3 mb-8 flex-wrap">
            <button
              className="bg-blue-500 hover:bg-blue-600 rounded-xl text-white px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer"
              onClick={(_e: any) => {
                if (!visemeInput) return;
                if (visemeInput.value === 0) {
                  visemeInput.value = 1;
                } else {
                  visemeInput.value = 0;
                }
              }}
            >
              Viseme Toggle
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 rounded-xl text-white px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer"
              onClick={(_e: any) => {
                if (!blinkInput) return;
                blinkInput.value = true;
                setTimeout(() => {
                  blinkInput.value = false;
                }, 100);
              }}
            >
              Blink
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 rounded-xl text-white px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer"
              onClick={(_e: any) => {
                if (headDownInput) {
                  console.log("head down set true");
                  headDownInput.value = true;
                  setTimeout(() => {
                    headDownInput.value = false;
                  }, 300);
                } else {
                  console.log("head down input is not found");
                }
              }}
            >
              Head Move
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 rounded-xl text-white px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer"
              onClick={(_e: any) => {
                if (jokeInput) {
                  jokeInput.value = !jokeInput.value;
                }
              }}
            >
              {jokeInput && jokeInput.value ? "Normal Eyes" : "Joke Eyes"}
            </button>
          </div>

          <TTSControls
            onVisemeChange={handleVisemeChange}
            onAudioEnd={handleAudioEnd}
            theme={{
              titleColors: "from-blue-600 to-purple-600",
              primaryColor: "blue-600",
              hoverColor: "blue-700",
              focusColor: "blue-500",
            }}
            version={1}
          />
        </div>
      </div>
    </div>
  );
}

export default ThanosCharacter;
