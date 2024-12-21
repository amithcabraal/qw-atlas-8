import React, { useState, useEffect, useRef } from 'react';
import { Play, Eye, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import QuestionCard from './QuestionCard';
import PlayerList from './PlayerList';
import MapComponent from './MapComponent';
import { calculateBounds } from '../lib/mapUtils';
import type { MapRef } from '../types/map';

interface HostViewProps {
  gameId: string;
  currentQuestion: number;
  players: any[];
  answers: any[];
  onNextQuestion: () => void;
  onRevealAnswers: () => void;
  question: any;
}

export default function HostView({
  gameId,
  currentQuestion,
  players,
  answers: propAnswers,
  onNextQuestion,
  onRevealAnswers,
  question
}: HostViewProps) {
  const [showingAnswers, setShowingAnswers] = useState(false);
  const [displayedAnswers, setDisplayedAnswers] = useState<any[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [playersWithScores, setPlayersWithScores] = useState<any[]>(players);
  const [error, setError] = useState<string | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<MapRef>(null);

  const allPlayersAnswered = players.length > 0 && players.every(p => p.has_answered);
  const isLastQuestion = currentQuestion === 5;

  useEffect(() => {
    const resetView = async () => {
      setShowingAnswers(false);
      setDisplayedAnswers([]);
      setIsRevealing(false);
      setError(null);
      setRevealComplete(false);
      setPlayersWithScores(players.map(player => ({
        ...player,
        lastScore: player.score
      })));
      
      setMapKey(prev => prev + 1);

      if (mapRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
        mapRef.current.flyTo({
          center: [0, 20],
          zoom: 1.5,
          duration: 1000
        });
      }
    };

    resetView();
  }, [currentQuestion, players]);

  const revealAnswersSequentially = async () => {
    if (!mapRef.current) return;

    try {
      // Get all answers for the current question
      const relevantAnswers = propAnswers
        .filter(a => a.question_id === currentQuestion)
        .sort((a, b) => b.score - a.score);

      // Add correct answer
      const allAnswers = [
        {
          id: 'correct',
          player_id: 'correct',
          game_id: gameId,
          question_id: currentQuestion,
          latitude: question.latitude,
          longitude: question.longitude,
          distance: 0,
          score: 1000
        },
        ...relevantAnswers
      ];

      // Show all answers immediately
      setDisplayedAnswers(allAnswers);

      // Calculate bounds to show all markers
      const bounds = calculateBounds([
        [question.longitude, question.latitude],
        ...relevantAnswers.map(a => [a.longitude, a.latitude])
      ]);

      // Animate to show all markers
      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 2000
      });

      setRevealComplete(true);
    } catch (err) {
      console.error('Error revealing answers:', err);
      setError('Failed to reveal answers');
    }
  };

  useEffect(() => {
    if (showingAnswers) {
      revealAnswersSequentially();
    }
  }, [showingAnswers]);

  const handleReveal = async () => {
    if (isRevealing || !allPlayersAnswered) return;

    try {
      setIsRevealing(true);
      setError(null);
      await onRevealAnswers();
      setShowingAnswers(true);
    } catch (err) {
      console.error('Error revealing answers:', err);
      setError('Failed to reveal answers');
    } finally {
      setIsRevealing(false);
    }
  };

  const markers = showingAnswers ? [
    // Correct answer marker
    { 
      latitude: question.latitude, 
      longitude: question.longitude, 
      color: 'text-green-500',
      fill: true,
      label: 'Correct Location'
    },
    // Player answer markers
    ...displayedAnswers
      .filter(answer => answer.player_id !== 'correct')
      .map(answer => {
        const player = players.find(p => p.id === answer.player_id);
        return {
          latitude: answer.latitude,
          longitude: answer.longitude,
          color: 'text-red-500',
          fill: true,
          label: `${player?.initials || 'Unknown'} (${answer.score} pts)`
        };
      })
  ] : [];

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <QuestionCard 
            question={question} 
            questionNumber={currentQuestion}
            showHint={true} 
          />
          <div className="mt-4 space-y-4">
            {allPlayersAnswered && !showingAnswers && (
              <button
                onClick={handleReveal}
                disabled={isRevealing}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 
                         disabled:bg-blue-800 disabled:cursor-not-allowed
                         text-white rounded-lg font-medium transition-colors 
                         flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {isRevealing ? 'Revealing Answers...' : 'Reveal Answers'}
              </button>
            )}
            {revealComplete && (
              <button
                onClick={onNextQuestion}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 
                         text-white rounded-lg font-medium transition-colors 
                         flex items-center justify-center gap-2"
              >
                {isLastQuestion ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    Complete Game
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Next Question
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Players ({players.filter(p => p.has_answered).length}/{players.length} answered)
          </h2>
          <PlayerList 
            players={playersWithScores} 
            showAnswered={!showingAnswers}
            isGameComplete={isLastQuestion && showingAnswers} 
          />
        </div>
      </div>
      <div className="h-[400px] rounded-xl overflow-hidden">
        <MapComponent 
          key={mapKey}
          ref={mapRef}
          markers={markers}
          interactive={!isRevealing}
          showLabels={displayedAnswers.length > 0}
          showMarkerLabels={displayedAnswers.length > 0}
        />
      </div>
    </div>
  );
}