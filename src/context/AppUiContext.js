import { createContext, useContext, useMemo, useState } from "react";

const AppUiContext = createContext({
  isMapLoaded: false,
  setIsMapLoaded: () => {},
  isLoading: false,
  setLoading: () => {},
  isModalShown: false,
  modalData: null,
  openModal: () => {},
  closeModal: () => {},
});

export function AppUiProvider({ children }) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalShown, setIsModalShown] = useState(false);
  const [modalData, setModalData] = useState(null);

  const setLoading = (status) => {
    setIsLoading(Boolean(status));
  };

  const openModal = (data) => {
    setModalData(data);
    setIsModalShown(true);
  };

  const closeModal = () => {
    setIsLoading(false);
    setIsModalShown(false);
  };

  const value = useMemo(
    () => ({
      isMapLoaded,
      setIsMapLoaded,
      isLoading,
      setLoading,
      isModalShown,
      modalData,
      openModal,
      closeModal,
    }),
    [isMapLoaded, isLoading, isModalShown, modalData]
  );

  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi() {
  return useContext(AppUiContext);
}
