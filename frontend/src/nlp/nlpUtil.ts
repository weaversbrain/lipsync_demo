import { dictionary } from "cmu-pronouncing-dictionary";
import { AZURE_TO_CUSTOM_VISEME, PHONEME_TO_VISEME } from "./constants";
import type { Viseme } from "./types";

export const wordToPhonemes = (word: string): string[] => {
  const phonemesString = dictionary[word];
  if (!phonemesString) {
    return [];
  }
  const phonemeList = phonemesString.split(" ");
  return phonemeList.map((x) => x.replace(/\d+/g, ""));
};

export const getElevenlabsVisemeSequence = (
  text: string,
  startSeconds: any
): Viseme[] => {
  const wordRegex = /\b\w+\b/g;
  const visemeSequence: Viseme[] = [];
  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0].toLocaleLowerCase();
    const phonemes = wordToPhonemes(word);
    if (phonemes.length == 0) {
      continue;
    }
    const visemes = phonemes.map((phoneme) => PHONEME_TO_VISEME[phoneme]);
    let prevViseme = null;
    const wordStartIdx = match.index;
    for (let i = 0; i < visemes.length; i++) {
      const viseme = visemes[i];
      if (viseme === prevViseme) continue;

      const startTime = startSeconds[wordStartIdx + i];
      visemeSequence.push({
        visemeId: viseme,
        startMs: Math.floor(startTime * 1000),
      });
      prevViseme = viseme;
    }
    // 마침표나 쉼표 뒤에 입 닫아주기 추가
    if (
      wordStartIdx + word.length < startSeconds.length &&
      text[wordStartIdx + word.length] !== " "
    ) {
      visemeSequence.push({
        visemeId: 0,
        startMs: Math.floor(startSeconds[wordStartIdx + word.length] * 1000),
      });
    }
  }
  if (visemeSequence[visemeSequence.length - 1].visemeId != 0) {
    visemeSequence.push({
      visemeId: 0,
      startMs: Math.floor(startSeconds[startSeconds.length - 1] * 1000),
    });
  }
  return visemeSequence;
};

export const getAzureViseme = (azureVisemeId: number, audioOffset: number) => {
  const customVisemeId = AZURE_TO_CUSTOM_VISEME[azureVisemeId];
  let audioOffsetMs = audioOffset / 10000;
  // 립싱크 타이밍을 맞추기 위해서 약간 조정
  if (audioOffsetMs >= 100) {
    audioOffsetMs -= 100;
  } else {
    audioOffsetMs = 0;
  }
  return {
    visemeId: customVisemeId,
    startMs: Math.floor(audioOffsetMs),
  };
};

export const getElevenlabsVisemeSequenceWithAPI = async (
  sentence: string,
  startSeconds: any,
  endSeconds: any,
  version: number = 1
) => {
  const response = await fetch(
    `${import.meta.env.VITE_AITUTOR_ENGINE_URL}/viseme/elevenlabs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sentence: sentence,
        start_seconds: startSeconds,
        end_seconds: endSeconds,
        version: version,
      }),
    }
  );
  const { visemeList } = await response.json();
  return visemeList;
};
