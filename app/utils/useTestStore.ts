// 새로고침해도 상태 유지 (sessionStorage 사용)
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 세션 스토리지에 저장될 키 (필요시 프로젝트 네임스페이스로 바꾸세요)
export const STORAGE_KEY = "mx:psych:v1:state";

// 스토어 타입(선택: TS일 때 유용)
type Answers = {
  perma: Record<string, unknown>;
  unconscious: Record<string, unknown>;
};

type StoreState = {
  currentStage: string;
  currentIndex: number;
  answers: Answers;
  results: unknown;
  // actions
  setStage: (stage: string) => void;
  setIndex: (i: number) => void;
  saveAnswer: (stageKey: keyof Answers, qid: string, value: unknown) => void;
  setResults: (res: unknown) => void;
  resetAll: () => void;
  clearStorage: () => void;
};

export const useTestStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ---- 상태 ----
      currentStage: "intro",
      currentIndex: 0,
      answers: { perma: {}, unconscious: {} },
      results: null,

      // ---- 액션 ----
      /**
       * 스테이지 전환 시 현재 인덱스는 0으로 초기화
       */
      setStage: (stage) => set({ currentStage: stage, currentIndex: 0 }),

      /**
       * 현재 질문 인덱스 설정 (음수 방어)
       */
      setIndex: (i) => set({ currentIndex: Math.max(0, i) }),

      /**
       * 답안 저장
       * - stageKey: "perma" | "unconscious"
       * - qid: "a1" 같은 질문 ID
       * - value: 사용자의 선택 값(숫자/문자 등)
       */
      saveAnswer: (stageKey, qid, value) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [stageKey]: {
              ...(s.answers[stageKey] || {}),
              [qid]: value,
            },
          },
        })),

      /**
       * 결과 객체 저장(서버 응답 등)
       */
      setResults: (res) => set({ results: res }),

      /**
       * 메모리 상태 초기화(스토리지에는 남아있음)
       */
      resetAll: () =>
        set({
          currentStage: "intro",
          currentIndex: 0,
          answers: { perma: {}, unconscious: {} },
          results: null,
        }),

      /**
       * 세션 스토리지까지 완전 초기화
       * - 테스트 다시 시작할 때 깨끗한 상태가 필요하면 이걸 호출
       */
      clearStorage: () => {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {
            // 브라우저 보안 정책/스토리지 오류 무시
          }
        }
        set({
          currentStage: "intro",
          currentIndex: 0,
          answers: { perma: {}, unconscious: {} },
          results: null,
        });
      },
    }),
    {
      name: STORAGE_KEY, // sessionStorage key
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : ({} as Storage)
      ),
      /**
       * 어떤 필드만 저장/복원할지 선택 (함수 제외)
       * - 필요 없는 대용량/민감 정보는 제외 가능
       */
      partialize: (state) => ({
        currentStage: state.currentStage,
        currentIndex: state.currentIndex,
        answers: state.answers,
        results: state.results,
      }),
      version: 1,
      migrate: (persisted, _version) => persisted,
      /**
       * 복원 시 훅(디버그용)
       */
      onRehydrateStorage: () => (state) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[zustand] rehydrated:", state);
        }
      },
    }
  )
);
