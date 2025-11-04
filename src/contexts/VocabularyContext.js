'use client'
import { createContext, useContext, useState, useEffect } from 'react';

const VocabularyContext = createContext();

export function VocabularyProvider({ children }) {
  const [vocabulary, setVocabulary] = useState([]);
  const [studyHistory, setStudyHistory] = useState([]);
  const [evaluationHistory, setEvaluationHistory] = useState([]);

  useEffect(() => {
    const savedVocab = localStorage.getItem('jpop-vocabulary');
    if (savedVocab) {
      setVocabulary(JSON.parse(savedVocab));
    }

    const savedHistory = localStorage.getItem('jpop-study-history');
    if (savedHistory) {
      setStudyHistory(JSON.parse(savedHistory));
    }

    const savedEvaluations = localStorage.getItem('jpop-evaluation-history');
    if (savedEvaluations) {
      const parsed = JSON.parse(savedEvaluations);
      // 1주일 지난 기록 삭제
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const filtered = parsed.filter(item => new Date(item.date).getTime() > oneWeekAgo);
      setEvaluationHistory(filtered);
      localStorage.setItem('jpop-evaluation-history', JSON.stringify(filtered));
    }
  }, []);

  const addWord = (word, songInfo) => {
    const newWord = {
      ...word,
      songTitle: songInfo.title,
      songArtist: songInfo.artist,
      addedAt: new Date().toISOString(),
      id: `${word.text}-${Date.now()}`
    };

    const updated = [...vocabulary, newWord];
    setVocabulary(updated);
    localStorage.setItem('jpop-vocabulary', JSON.stringify(updated));
  };

  const removeWord = (id) => {
    const updated = vocabulary.filter(word => word.id !== id);
    setVocabulary(updated);
    localStorage.setItem('jpop-vocabulary', JSON.stringify(updated));
  };

  const isWordSaved = (text) => {
    return vocabulary.some(word => word.text === text);
  };

  const addStudyRecord = (songTitle, songArtist, translationCount) => {
    const newRecord = {
      id: Date.now(),
      songTitle,
      songArtist,
      translationCount,
      date: new Date().toISOString()
    };

    const updated = [newRecord, ...studyHistory];
    setStudyHistory(updated);
    localStorage.setItem('jpop-study-history', JSON.stringify(updated));
  };

  const addEvaluationRecord = (data) => {
    const newRecord = {
      id: Date.now(),
      songTitle: data.songTitle,
      songArtist: data.songArtist,
      translations: data.translations,
      evaluation: data.evaluation,
      score: data.score || null,
      date: new Date().toISOString()
    };

    const updated = [newRecord, ...evaluationHistory];
    setEvaluationHistory(updated);
    localStorage.setItem('jpop-evaluation-history', JSON.stringify(updated));
  };

  const removeEvaluationRecord = (id) => {
    const updated = evaluationHistory.filter(record => record.id !== id);
    setEvaluationHistory(updated);
    localStorage.setItem('jpop-evaluation-history', JSON.stringify(updated));
  };

  return (
    <VocabularyContext.Provider value={{ 
      vocabulary, 
      addWord, 
      removeWord, 
      isWordSaved,
      studyHistory,
      addStudyRecord,
      evaluationHistory,
      addEvaluationRecord,
      removeEvaluationRecord
    }}>
      {children}
    </VocabularyContext.Provider>
  );
}

export const useVocabulary = () => useContext(VocabularyContext);
