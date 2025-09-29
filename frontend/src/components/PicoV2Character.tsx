import { useRive } from "@rive-app/react-canvas";
import { useNavigate } from "react-router-dom";
import { useStateMachineInput } from "@rive-app/react-canvas";
import TTSControls from "./TTSControls";

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
    stateMachines: ["movement", "lipsync"],
    autoplay: true,
  });
  const actionWithMouthIdInput = useStateMachineInput(
    rive,
    "movement",
    "actionWithMouthId",
    100
  );
  const actionWithoutMouthIdInput = useStateMachineInput(
    rive,
    "movement",
    "actionWithoutMouthId",
    0
  );

  const handleActionWithMouthIdChange = (actionId: number) => {
    if (actionWithMouthIdInput) {
      if (actionWithMouthIdInput.value === actionId) {
        actionWithMouthIdInput.value = 0;
        setTimeout(() => {
          actionWithMouthIdInput.value = actionId;
        }, 100);
      } else {
        actionWithMouthIdInput.value = actionId;
      }
    }
  };

  const handleActionWithoutMouthIdChange = (actionId: number) => {
    if (actionWithoutMouthIdInput) {
      if (actionWithoutMouthIdInput.value === actionId) {
        actionWithoutMouthIdInput.value = 0;
        setTimeout(() => {
          actionWithoutMouthIdInput.value = actionId;
        }, 100);
      } else {
        actionWithoutMouthIdInput.value = actionId;
      }
    }
  };

  const handleVisemeChange = (visemeId: number) => {
    // if (visemeInput) {
    //   visemeInput.value = visemeId;
    //   console.log(visemeId);
    // }
    if (actionWithMouthIdInput) {
      actionWithMouthIdInput.value = visemeId + 100;
    }
  };

  const handleAudioEnd = () => {
    // if (visemeInput) {
    //   visemeInput.value = -1;
    // }
    if (actionWithMouthIdInput) {
      actionWithMouthIdInput.value = 100;
    }
  };

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

          {/* 입 움직임이 없는 액션 */}
          <div className="mb-6 lg:mb-8">
            <h4 className="text-sm font-medium mb-2 text-purple-700 flex items-center">
              <span className="mr-1">🤫</span>입 움직임 없는 액션 (립싱크와 동시
              재생 가능)
            </h4>
            <div className="flex gap-2 lg:gap-x-3 mb-2 flex-wrap">
              <button
                className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
                onClick={(_e: any) => {
                  handleActionWithoutMouthIdChange(1);
                }}
              >
                안경 올리기
              </button>
            </div>
          </div>

          {/* 입 움직임이 있는 액션 */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2 text-pink-700 flex items-center">
              <span className="mr-1">💬</span>입 움직임이 있는 액션 (립싱크와
              동시 재생 불가)
            </h4>
            <div className="flex gap-2 lg:gap-x-3 mb-2 flex-wrap">
              <button
                className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
                onClick={(_e: any) => {
                  handleActionWithMouthIdChange(1);
                }}
              >
                끄덕이기
              </button>
              <button
                className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
                onClick={(_e: any) => {
                  handleActionWithMouthIdChange(2);
                }}
              >
                감탄하기
              </button>
              <button
                className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
                onClick={(_e: any) => {
                  handleActionWithMouthIdChange(3);
                }}
              >
                어디갔지
              </button>
              <button
                className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
                onClick={(_e: any) => {
                  handleActionWithMouthIdChange(4);
                }}
              >
                긁긁
              </button>
              <button
                className="bg-pink-500 hover:bg-pink-600 rounded-xl text-white px-3 lg:px-4 py-2 font-medium shadow-lg transition-all duration-200 hover:cursor-pointer text-sm lg:text-base"
                onClick={(_e: any) => {
                  handleActionWithMouthIdChange(5);
                }}
              >
                코찔찔
              </button>
            </div>
          </div>

          <TTSControls
            onVisemeChange={handleVisemeChange}
            onAudioEnd={handleAudioEnd}
            theme={{
              titleColors: "from-pink-600 to-purple-600",
              primaryColor: "pink-600",
              hoverColor: "pink-700",
              focusColor: "pink-500",
            }}
            version={2}
          />
        </div>
      </div>
    </div>
  );
}

export default PicoV2Character;
