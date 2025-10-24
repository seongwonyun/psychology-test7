//리로딩 하면 상태가 초기화
"use client";
import { create } from "zustand";

export const useTestStore = create((set) => ({
  currentStage: "intro",
  currentIndex: 0,
  answers: { perma: {}, unconscious: {} },
  results: null,

  setStage: (stage) => set({ currentStage: stage, currentIndex: 0 }),
  setIndex: (i) => set({ currentIndex: i }),
  saveAnswer: (stageKey, qid, value) =>
    set((s) => ({
      answers: {
        ...s.answers,
        [stageKey]: { ...(s.answers[stageKey] || {}), [qid]: value },
      },
    })),
  setResults: (res) => set({ results: res }),
  resetAll: () =>
    set({
      currentStage: "intro",
      currentIndex: 0,
      answers: { perma: {}, unconscious: {} },
      results: null,
    }),
}));

// // 새로고침해도 상태 유지 (sessionStorage 사용)
// "use client";
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// export const STORAGE_KEY = "mx:psych:v1:state";

// export const useTestStore = create(
//   persist(
//     (set, get) => ({
//       // ---- 상태 ----
//       currentStage: "intro",
//       currentIndex: 0,
//       answers: { perma: {}, unconscious: {} },
//       results: null,

//       // ---- 액션 ----
//       setStage: (stage) => set({ currentStage: stage, currentIndex: 0 }),
//       setIndex: (i) => set({ currentIndex: Math.max(0, i) }),
//       saveAnswer: (stageKey, qid, value) =>
//         set((s) => ({
//           answers: {
//             ...s.answers,
//             [stageKey]: { ...(s.answers[stageKey] || {}), [qid]: value },
//           },
//         })),
//       setResults: (res) => set({ results: res }),
//       resetAll: () =>
//         set({
//           currentStage: "intro",
//           currentIndex: 0,
//           answers: { perma: {}, unconscious: {} },
//           results: null,
//         }),

//       // 세션스토리지까지 완전 초기화
//       clearStorage: () => {
//         if (typeof window !== "undefined") {
//           sessionStorage.removeItem(STORAGE_KEY);
//         }
//         set({
//           currentStage: "intro",
//           currentIndex: 0,
//           answers: { perma: {}, unconscious: {} },
//           results: null,
//         });
//       },
//     }),
//     {
//       name: STORAGE_KEY, // sessionStorage key
//       storage: createJSONStorage(() =>
//         typeof window !== "undefined" ? sessionStorage : undefined
//       ),
//       // 저장/복원할 필드만 지정(함수 제외)
//       partialize: (state) => ({
//         currentStage: state.currentStage,
//         currentIndex: state.currentIndex,
//         answers: state.answers,
//         results: state.results,
//       }),
//       version: 1,
//       migrate: (persisted, version) => persisted,
//       onRehydrateStorage: () => (state) => {
//         if (process.env.NODE_ENV !== "production") {
//           console.debug("[zustand] rehydrated:", state);
//         }
//       },
//     }
//   )
// );
