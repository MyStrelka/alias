import { create } from 'zustand';

type ModalType = 'info' | 'confirmation';

interface ModalProps {
  type: ModalType;
  confirmation?: string;
  onConfirm?: () => void;
  [key: string]: any;
}

interface ModalState {
  isOpen: boolean;
  props: ModalProps;
  openModal: (props?: ModalProps) => void;
  closeModal: () => void;
}

const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  props: { type: 'info' },

  openModal: (props) => {
    set({
      isOpen: true,
      props: props ?? { type: 'info' },
    });
  },

  closeModal: () =>
    set({
      isOpen: false,
      props: { type: 'info' },
    }),
}));

export default useModalStore;
