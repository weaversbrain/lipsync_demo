import { useRive } from "@rive-app/react-canvas";
import { useNavigate } from "react-router-dom";
import { useStateMachineInput } from "@rive-app/react-canvas";

// 캐릭터 정보
const characters = [
  { id: "pico-v2", name: "Pico V2", path: "/pico-v2" },
  { id: "pico", name: "Pico", path: "/pico" },
  { id: "eggni", name: "Eggni", path: "/eggni" },
  { id: "thanos", name: "Thanos", path: "/thanos" },
];

function PicoV2Character() {
  const navigate = useNavigate();

  const { rive, RiveComponent } = useRive({
    src: "/viseme_animation/pico_v2.riv",
    stateMachines: ["movement"],
    autoplay: true,
  });
  const actionIdInput = useStateMachineInput(rive, "movement", "actionId", 0);

  const handleActionIdChange = (actionId: number) => {
    if (actionIdInput) {
      if (actionIdInput.value === actionId) {
        actionIdInput.value = 0;
        setTimeout(() => {
          actionIdInput.value = actionId;
        }, 100);
      } else {
        actionIdInput.value = actionId;
      }
    }
  };

  // const handleVisemeChange = (visemeId: number) => {
  //   if (visemeInput) {
  //     visemeInput.value = visemeId;
  //   }
  // };

  // const handleAudioEnd = () => {
  //   if (visemeInput) {
  //     visemeInput.value = 0;
  //   }
  // };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-100">
      {/* 상단/왼쪽 - Rive 애니메이션 */}
      <div className="w-full lg:w-1/2 px-2 py-1 pb-0 lg:p-8 flex flex-col items-center justify-center min-h-[25vh] lg:min-h-screen">
        <div className="w-full h-full max-w-xs lg:max-w-none min-h-[180px] lg:min-h-[400px]">
          <RiveComponent className="w-96 h-96 lg:w-full lg:h-full" />
        </div>
      </div>

      {/* 하단/오른쪽 - 컨트롤 패널 */}
      <div className="w-full lg:w-1/2 p-2 pt-0 lg:p-8 flex flex-col">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 lg:p-8 h-full border border-white/20">
          {/* 캐릭터 선택 */}
          <div className="mb-4 lg:mb-6">
            <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Character Selection
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => navigate(character.path)}
                  className={`px-3 lg:px-4 py-2 rounded-xl font-medium shadow-md transition-all duration-200 whitespace-nowrap text-sm lg:text-base ${
                    character.id === "pico-v2"
                      ? "bg-pink-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {character.name}
                </button>
              ))}
            </div>
          </div>

          <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Pico V2 Controls
          </h3>

          <div className="flex gap-2 lg:gap-x-3 mb-6 lg:mb-8 flex-wrap">
            <button
              className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
              onClick={(_e: any) => {
                handleActionIdChange(1);
              }}
            >
              끄덕이기
            </button>
            <button
              className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
              onClick={(_e: any) => {
                handleActionIdChange(2);
              }}
            >
              안경 올리기
            </button>
            <button
              className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
              onClick={(_e: any) => {
                handleActionIdChange(3);
              }}
            >
              감탄하기
            </button>
            <button
              className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
              onClick={(_e: any) => {
                handleActionIdChange(3);
              }}
            >
              어디갔지
            </button>
          </div>

          {/* TTS 미구현 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
            <div className="flex items-start lg:items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 mt-0.5 lg:mt-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2 lg:ml-3">
                <h3 className="text-xs lg:text-sm font-medium text-yellow-800">
                  TTS 기능 준비 중
                </h3>
                <div className="mt-1 text-xs lg:text-sm text-yellow-700">
                  <p>
                    Pico V2 캐릭터의 TTS 기능은 현재 개발 중입니다. 애니메이션
                    컨트롤만 사용 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* <TTSControls
            onVisemeChange={handleVisemeChange}
            onAudioEnd={handleAudioEnd}
            theme={{
              titleColors: "from-pink-600 to-purple-600",
              primaryColor: "pink-600",
              hoverColor: "pink-700",
              focusColor: "pink-500",
            }}
            version={2}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default PicoV2Character;
