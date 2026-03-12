// src/components/tracker/SubstitutionModal.tsx
'use client';

import { useState } from 'react';
import { IPlayer } from '@/types/definitions';
import Button from '@/components/ui/Button';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToSubOut: IPlayer | null;
  teamPlayers: IPlayer[];
  extraPlayers?: IPlayer[];
  onCourtPlayerIds: Set<string>;
  onSubstitute: (playerIn: IPlayer) => void;
}

export default function SubstitutionModal({
  isOpen,
  onClose,
  playerToSubOut,
  teamPlayers,
  extraPlayers = [],
  onCourtPlayerIds,
  onSubstitute,
}: SubstitutionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !playerToSubOut) return null;

  const filterPlayer = (p: IPlayer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.dorsal !== undefined && p.dorsal.toString().includes(query))
    );
  };

  const eligiblePlayers = teamPlayers.filter(
    (p) => !onCourtPlayerIds.has(p._id) && filterPlayer(p),
  );

  const filteredExtraPlayers = extraPlayers.filter(filterPlayer);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">
          Sustituir a {playerToSubOut.name}
        </h3>
        <p className="text-sm mb-4">
          Selecciona el jugador que entrará a la cancha.
        </p>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o número..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto border-t border-b border-gray-200 dark:border-gray-700 py-2">
          {eligiblePlayers.length > 0 ? (
            <div className="space-y-1">
              {eligiblePlayers.map((player) => (
                <button
                  key={player._id}
                  onClick={() => onSubstitute(player)}
                  className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  #{player.dorsal} - {player.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Banquillo vacío (ningún jugador disponible en la sesión).
            </p>
          )}

          {filteredExtraPlayers.length > 0 && (
            <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
                Añadir a la sesión (Jugador en Banquillo):
              </h4>
              <div className="space-y-1">
                {filteredExtraPlayers.map((player) => (
                  <button
                    key={player._id}
                    onClick={() => onSubstitute(player)}
                    className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm opacity-80"
                  >
                    #{player.dorsal} - {player.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
