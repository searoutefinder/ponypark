import { createContext, useContext, useMemo, useState } from "react";

const AppUiContext = createContext({
  isMapLoaded: false,
  setIsMapLoaded: () => {},
  isLoading: false,
  setLoading: () => {},
  isQuestionModalShown: false,
  questionModalData: null,
  openQuestionModal: () => {},
  closeQuestionModal: () => {},  
  isModalShown: false,
  modalData: null,
  openModal: () => {},
  closeModal: () => {},
});

export function AppUiProvider({ children }) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalShown, setIsModalShown] = useState(false);
  const [questionModalData, setQuestionModalData] = useState(null);
  const [isQuestionModalShown, setIsQuestionModalShown] = useState(false);
  const [appMode, setAppMode] = useState("normal");

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

  const openQuestionModal = (data) => {
    setQuestionModalData(data);
    setIsQuestionModalShown(true);
  };

  const closeQuestionModal = () => {
    setIsLoading(false);
    setIsQuestionModalShown(false);
    setQuestionModalData(null);
  };  

  const value = useMemo(
    () => ({
      appMode, 
      setAppMode, 
      isMapLoaded,
      setIsMapLoaded,
      isLoading,
      setLoading,
      isModalShown,
      isQuestionModalShown,
      modalData,
      setQuestionModalData,
      openModal,
      closeModal,
      questionModalData,
      openQuestionModal,
      closeQuestionModal
    }),
    [appMode, setAppMode, isMapLoaded, isLoading, isModalShown, isQuestionModalShown, modalData, questionModalData, setQuestionModalData]
  );

  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi() {
  return useContext(AppUiContext);
}
