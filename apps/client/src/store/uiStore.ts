import { create } from 'zustand';

interface ModalState {
  isSettingsOpen: boolean;
  togglelSettings: () => void;
}

const useUiStore = create<ModalState>((set, get) => ({
  isSettingsOpen: false,

  togglelSettings: () => {
    const { isSettingsOpen } = get();
    set({
      isSettingsOpen: !isSettingsOpen,
    });
  },
}));

export default useUiStore;
