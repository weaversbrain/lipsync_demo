import { useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  getAzureViseme,
  getElevenlabsVisemeSequenceWithAPI,
} from "../nlp/nlpUtil";

type TTSService = "azure" | "elevenlabs";
type Language = "en" | "ko" | "ja" | "zh";

interface TTSControlsProps {
  onVisemeChange?: (visemeId: number) => void;
  onAudioEnd?: () => void;
  theme?: {
    titleColors: string;
    primaryColor: string;
    hoverColor: string;
    focusColor: string;
  };
  version?: number;
}

// 언어별 Azure 음성 설정
const azureVoices = {
  en: "en-US-JennyNeural",
  ko: "ko-KR-SunHiNeural",
  ja: "ja-JP-NanamiNeural",
  zh: "zh-CN-XiaoxiaoNeural",
};

// 언어 표시명
const languageNames = {
  en: "영어",
  ko: "한국어",
  ja: "일본어",
  zh: "중국어",
};

// ElevenLabs 사전 정의된 목소리들
const elevenLabsVoices = [
  { nickname: "Hope", voiceId: "zGjIP4SZlMnY9m93k97r" },
  { nickname: "Ivy", voiceId: "i4CzbCVWoqvD0P1QJCUL" },
  { nickname: "Jon", voiceId: "MFZUKuGQUsGJPQjTS4wC" },
  { nickname: "Cinnamon", voiceId: "kNie5n4lYl7TrvqBZ4iG" },
  { nickname: "Flint", voiceId: "qAZH0aMXY8tw1QufPN0D" },
  { nickname: "Angela", voiceId: "FUfBrNit0NNZAwb58KWH" },
  { nickname: "Monster of Rock", voiceId: "mtrellq69YZsNwzUSyXh" },
  { nickname: "Blondie", voiceId: "st7NwhTPEzqo2riw7qWC" },
];

// 예시 문장들
const exampleSentences = [
  "안녕하세요! Hello, nice to meet you.",
  "오늘 날씨가 정말 좋네요. The weather is really nice today.",
  "저는 '한국어'와 'English'를 모두 사용할 수 있어요.",
  "냉장고는 영어로 'refrigerator'라고 해요. 따라해볼까요? 'refrigerator'",
  "우리 함께 'coding'을 해봅시다.",
];

function TTSControls({
  onVisemeChange,
  onAudioEnd,
  theme,
  version = 1,
}: TTSControlsProps) {
  // 기본 테마 (파란색)
  const defaultTheme = {
    titleColors: "from-blue-600 to-purple-600",
    primaryColor: "blue-600",
    hoverColor: "blue-700",
    focusColor: "blue-500",
  };

  const currentTheme = theme || defaultTheme;
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedTTSService, setSelectedTTSService] =
    useState<TTSService>("elevenlabs");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [voiceId, setVoiceId] = useState("MFZUKuGQUsGJPQjTS4wC");
  const [selectedVoiceOption, setSelectedVoiceOption] = useState<
    "preset" | "custom"
  >("preset");
  const [selectedPresetVoice, setSelectedPresetVoice] = useState(
    elevenLabsVoices[0].voiceId
  );
  const [selectedExample, setSelectedExample] = useState("");

  const elevenlabsClient = new ElevenLabsClient({
    apiKey: import.meta.env.VITE_ELEVENLABS_KEY,
  });

  const playAzureAudio = (audioData: ArrayBuffer) => {
    const audioDataUint8Array = new Uint8Array(audioData);
    const audioBlob = new Blob([audioDataUint8Array], { type: "audio/mpeg" });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  };

  const handleAzureTTS = async () => {
    setIsLoading(true);
    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        import.meta.env.VITE_AZURE_KEY,
        "japaneast"
      );
      speechConfig.speechSynthesisVoiceName = azureVoices[selectedLanguage];
      speechConfig.speechSynthesisOutputFormat =
        SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
      const speechSynthesizer = new SpeechSDK.SpeechSynthesizer(
        speechConfig,
        audioConfig
      );

      let prevVisemeId = 0;
      const visemeList: { visemeId: number; startMs: number }[] = [];

      speechSynthesizer.visemeReceived = function (_s, e) {
        const { visemeId, startMs } = getAzureViseme(e.visemeId, e.audioOffset);
        if (prevVisemeId !== visemeId) {
          visemeList.push({ visemeId, startMs });
          prevVisemeId = visemeId;
          console.log(visemeList);
        }
        setTimeout(() => {
          if (onVisemeChange) {
            onVisemeChange(visemeId);
          }
        }, startMs);
      };

      await new Promise<void>((resolve, reject) => {
        speechSynthesizer.speakTextAsync(
          text,
          (result) => {
            if (
              result.reason ===
              SpeechSDK.ResultReason.SynthesizingAudioCompleted
            ) {
              console.log("Azure 음성 합성 완료");
              playAzureAudio(result.audioData);
              speechSynthesizer.close();
              resolve();
            } else {
              console.error("Azure 음성 합성 실패:", result.errorDetails);
              speechSynthesizer.close();
              reject(new Error(result.errorDetails));
            }
          },
          (err) => {
            console.error("Azure TTS 오류:", err);
            speechSynthesizer.close();
            reject(err);
          }
        );
      });
    } catch (error) {
      console.error("Azure TTS 오류:", error);
      alert("Azure 음성 변환 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const playElevenlabsAudio = (audioBase64: string) => {
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioBlob = new Blob([bytes], { type: "audio/mpeg" });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    const audioElement = new Audio(url);
    audioElement.play();

    audioElement.addEventListener("ended", () => {
      if (onVisemeChange) {
        onVisemeChange(0);
      }
      if (onAudioEnd) {
        onAudioEnd();
      }
    });
  };

  const handleElevenLabsTTS = async () => {
    setIsLoading(true);
    try {
      const currentVoiceId =
        selectedVoiceOption === "preset" ? selectedPresetVoice : voiceId;

      const audioResponse =
        await elevenlabsClient.textToSpeech.convertWithTimestamps(
          currentVoiceId,
          {
            text: text,
            languageCode: "en",
            modelId: "eleven_turbo_v2_5",
          }
        );

      const startSeconds =
        audioResponse.alignment?.characterStartTimesSeconds || [];
      const endSeconds =
        audioResponse.alignment?.characterEndTimesSeconds || [];
      const visemeList = await getElevenlabsVisemeSequenceWithAPI(
        text,
        startSeconds,
        endSeconds,
        version
      );

      console.log(visemeList);
      visemeList.forEach(
        ({ visemeId, startMs }: { visemeId: number; startMs: number }) => {
          setTimeout(() => {
            if (onVisemeChange) {
              onVisemeChange(visemeId);
            }
          }, startMs);
        }
      );

      playElevenlabsAudio(audioResponse.audioBase64);
      console.log("ElevenLabs 음성 합성 완료");
    } catch (error) {
      console.error("ElevenLabs TTS 오류:", error);
      alert("ElevenLabs 음성 변환 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!text.trim()) {
      alert("텍스트를 입력해주세요!");
      return;
    }

    if (selectedTTSService === "azure") {
      await handleAzureTTS();
    } else {
      await handleElevenLabsTTS();
    }
  };

  return (
    <div className="flex flex-col space-y-4 mt-5">
      <h3
        className={`text-2xl font-bold mb-6 bg-gradient-to-r ${currentTheme.titleColors} bg-clip-text text-transparent`}
      >
        Text-to-Speech
      </h3>

      {/* TTS 서비스 및 언어/목소리 선택 */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-4 flex-wrap">
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="tts-service"
              className="text-sm font-medium text-gray-700"
            >
              TTS Service
            </label>
            <select
              id="tts-service"
              value={selectedTTSService}
              onChange={(e) =>
                setSelectedTTSService(e.target.value as TTSService)
              }
              className={`w-fit p-3 bg-white border-2 border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 transition-all duration-200 ${
                currentTheme.focusColor === "blue-500"
                  ? "focus:ring-blue-500 focus:border-blue-500"
                  : currentTheme.focusColor === "pink-500"
                  ? "focus:ring-pink-500 focus:border-pink-500"
                  : currentTheme.focusColor === "green-500"
                  ? "focus:ring-green-500 focus:border-green-500"
                  : "focus:ring-blue-500 focus:border-blue-500"
              }`}
              disabled={isLoading}
            >
              <option value="elevenlabs">ElevenLabs</option>
              <option value="azure">Azure</option>
            </select>
          </div>

          {selectedTTSService === "azure" ? (
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="language"
                className="text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) =>
                  setSelectedLanguage(e.target.value as Language)
                }
                className={`w-fit p-3 bg-white border-2 border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 transition-all duration-200 ${
                  currentTheme.focusColor === "blue-500"
                    ? "focus:ring-blue-500 focus:border-blue-500"
                    : currentTheme.focusColor === "pink-500"
                    ? "focus:ring-pink-500 focus:border-pink-500"
                    : currentTheme.focusColor === "green-500"
                    ? "focus:ring-green-500 focus:border-green-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                disabled={isLoading}
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">
                  Voice 선택
                </label>

                <div className="flex space-x-3 items-center">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceOption"
                      value="preset"
                      checked={selectedVoiceOption === "preset"}
                      onChange={(e) =>
                        setSelectedVoiceOption(
                          e.target.value as "preset" | "custom"
                        )
                      }
                      className={`${
                        currentTheme.focusColor === "blue-500"
                          ? "text-blue-500 focus:ring-blue-500"
                          : currentTheme.focusColor === "pink-500"
                          ? "text-pink-500 focus:ring-pink-500"
                          : currentTheme.focusColor === "green-500"
                          ? "text-green-500 focus:ring-green-500"
                          : "text-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    <span className="text-xs text-gray-600">사전 정의</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceOption"
                      value="custom"
                      checked={selectedVoiceOption === "custom"}
                      onChange={(e) =>
                        setSelectedVoiceOption(
                          e.target.value as "preset" | "custom"
                        )
                      }
                      className={`${
                        currentTheme.focusColor === "blue-500"
                          ? "text-blue-500 focus:ring-blue-500"
                          : currentTheme.focusColor === "pink-500"
                          ? "text-pink-500 focus:ring-pink-500"
                          : currentTheme.focusColor === "green-500"
                          ? "text-green-500 focus:ring-green-500"
                          : "text-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    <span className="text-xs text-gray-600">직접 입력</span>
                  </label>
                </div>
              </div>

              <div>
                {selectedVoiceOption === "preset" && (
                  <select
                    value={selectedPresetVoice}
                    onChange={(e) => setSelectedPresetVoice(e.target.value)}
                    className={`p-3 bg-white border-2 border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 transition-all duration-200 ${
                      currentTheme.focusColor === "blue-500"
                        ? "focus:ring-blue-500 focus:border-blue-500"
                        : currentTheme.focusColor === "pink-500"
                        ? "focus:ring-pink-500 focus:border-pink-500"
                        : currentTheme.focusColor === "green-500"
                        ? "focus:ring-green-500 focus:border-green-500"
                        : "focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                  >
                    {elevenLabsVoices.map((voice) => (
                      <option key={voice.voiceId} value={voice.voiceId}>
                        {voice.nickname} ({voice.voiceId})
                      </option>
                    ))}
                  </select>
                )}

                {selectedVoiceOption === "custom" && (
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="Enter ElevenLabs Voice ID"
                    className={`p-3 bg-white border-2 border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 transition-all duration-200 w-full max-w-md ${
                      currentTheme.focusColor === "blue-500"
                        ? "focus:ring-blue-500 focus:border-blue-500"
                        : currentTheme.focusColor === "pink-500"
                        ? "focus:ring-pink-500 focus:border-pink-500"
                        : currentTheme.focusColor === "green-500"
                        ? "focus:ring-green-500 focus:border-green-500"
                        : "focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2 mb-2">
        <p className="text-sm italic text-slate-500">
          한국어와 영어로 구성된 문장만 지원합니다. 너무 짧은 bilingual 문장은
          TTS가 잘 안됩니다. 영어 단어를 ''로 감싸주면 자연스러운 TTS에 도움이
          됩니다.
        </p>
        <select
          value={selectedExample}
          onChange={(e) => {
            setSelectedExample(e.target.value);
            if (e.target.value) {
              const exampleIndex = parseInt(e.target.value) - 1;
              setText(exampleSentences[exampleIndex]);
            } else {
              setText("");
            }
          }}
          className={`w-fit px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 transition-all duration-200 ${
            currentTheme.focusColor === "blue-500"
              ? "focus:ring-blue-500 focus:border-blue-500"
              : currentTheme.focusColor === "pink-500"
              ? "focus:ring-pink-500 focus:border-pink-500"
              : currentTheme.focusColor === "green-500"
              ? "focus:ring-green-500 focus:border-green-500"
              : "focus:ring-blue-500 focus:border-blue-500"
          }`}
          disabled={isLoading}
        >
          <option value="">예시 선택</option>
          {exampleSentences.map((_, index) => (
            <option key={index + 1} value={index + 1}>
              예시{index + 1}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="음성으로 변환할 텍스트를 입력하세요..."
        className={`h-32 p-4 bg-white border-2 border-gray-200 rounded-xl shadow-md resize-none focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
          currentTheme.focusColor === "blue-500"
            ? "focus:ring-blue-500 focus:border-blue-500"
            : currentTheme.focusColor === "pink-500"
            ? "focus:ring-pink-500 focus:border-pink-500"
            : currentTheme.focusColor === "green-500"
            ? "focus:ring-green-500 focus:border-green-500"
            : "focus:ring-blue-500 focus:border-blue-500"
        }`}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <button
          onClick={handleTTS}
          disabled={isLoading || !text.trim()}
          className={`w-full p-4 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
            isLoading || !text.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : currentTheme.primaryColor === "blue-600"
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              : currentTheme.primaryColor === "pink-600"
              ? "bg-pink-600 hover:bg-pink-700 text-white cursor-pointer"
              : currentTheme.primaryColor === "green-600"
              ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              음성 변환 중...
            </div>
          ) : (
            "음성 변환 및 재생"
          )}
        </button>
      </div>
    </div>
  );
}

export default TTSControls;
