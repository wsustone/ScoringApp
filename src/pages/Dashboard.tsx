import { useState, useEffect } from 'react';
import { PlayerForm } from '../components/PlayerForm';
import { Player } from '../components/PlayerForm';

export const Dashboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Load players and selected course from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('players');
    const savedCourseId = localStorage.getItem('selectedCourseId');
    
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedCourseId) {
      setSelectedCourseId(savedCourseId);
    }
  }, []);

  // Update players in localStorage when they change
  const handlePlayersChange = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    localStorage.setItem('players', JSON.stringify(newPlayers));
  };

  // Update selected course in localStorage when it changes
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    localStorage.setItem('selectedCourseId', courseId);
  };

  return (
    <PlayerForm
      players={players}
      onPlayersChange={handlePlayersChange}
      selectedCourseId={selectedCourseId}
      onCourseChange={handleCourseChange}
    />
  );
};
