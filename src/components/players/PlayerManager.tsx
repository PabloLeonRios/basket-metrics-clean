'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { IPlayer } from '@/types/definitions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import JerseyIcon from '@/components/ui/JerseyIcon';
import { toast } from 'react-toastify';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 *
 * PlayerManager v2
 *
 * Cambios:
 * - UI simplificada para gestión rápida
 * - cards de jugador más limpias
 * - menos datos en grid
 *
 * Importante:
 * - lógica de fetch intacta
 * - endpoints intactos
 * - modelo IPlayer intacto
 *
 * Los datos extendidos (altura, peso, edad, etc.)
 * quedan reservados para:
 *
 * /panel/players/[id]
 *
 * donde vive la ficha completa.
 */

export default function PlayerManager() {
  const { user, loading: authLoading } = useAuth();

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<'mine' | 'rivals'>('mine');

  const [editingPlayer, setEditingPlayer] = useState<IPlayer | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------- Export ---------------- */

  const exportToExcel = () => {
    if (!players.length) return toast.info('No hay jugadores.');

    const data = players.map((p) => ({
      Nombre: p.name,
      Dorsal: p.dorsal || '-',
      Posición: p.position || '-',
      Equipo: p.team || '-',
    }));

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();

    utils.book_append_sheet(workbook, worksheet, 'Jugadores');

    writeFile(workbook, 'jugadores.xlsx');
  };

  const exportToPDF = () => {
    if (!players.length) return toast.info('No hay jugadores.');

    const doc = new jsPDF();

    doc.text('Listado de Jugadores', 14, 15);

    const tableData = players.map((p) => [
      p.name,
      p.dorsal?.toString() || '-',
      p.position || '-',
      p.team || '-',
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Nombre', 'Dorsal', 'Posición', 'Equipo']],
      body: tableData,
    });

    doc.save('jugadores.pdf');
  };

  /* ---------------- Search debounce ---------------- */

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  /* ---------------- Fetch players ---------------- */

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true);
        setError(null);

        let url = `/api/players?page=${currentPage}&limit=${playersPerPage}`;

        if (user?.role !== 'admin') {
          url += `&coachId=${user!._id}`;
        }

        if (showInactive) {
          url += '&status=inactive';
        }

        if (debouncedSearchTerm) {
          url += `&search=${debouncedSearchTerm}`;
        }

        url += `&teamType=${activeTab}`;

        if (user?.team?.name) {
          url += `&userTeamName=${encodeURIComponent(user.team.name)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('No se pudieron cargar los jugadores.');
        }

        const { data, totalPages: apiTotalPages } = await response.json();

        setPlayers(data);
        setTotalPages(apiTotalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchPlayers();
    }
  }, [
    user,
    authLoading,
    currentPage,
    playersPerPage,
    debouncedSearchTerm,
    showInactive,
    activeTab,
  ]);

  /* ---------------- Pagination ---------------- */

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* ===================================================== */

  return (
    <div className="space-y-6">

      {/* Tabs */}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            activeTab === 'mine'
              ? 'bg-orange-500/20 text-orange-400'
              : 'text-gray-400'
          }`}
        >
          Mi Equipo
        </button>

        <button
          onClick={() => setActiveTab('rivals')}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            activeTab === 'rivals'
              ? 'bg-orange-500/20 text-orange-400'
              : 'text-gray-400'
          }`}
        >
          Rivales
        </button>
      </div>

      {/* Toolbar */}

      <div className="flex flex-wrap gap-4 items-center justify-between">

        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">

          <Checkbox
            label="Inactivos"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />

          <Button variant="secondary" onClick={exportToExcel}>
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Excel
          </Button>

          <Button variant="secondary" onClick={exportToPDF}>
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            PDF
          </Button>

        </div>
      </div>

      {/* States */}

      {loading && <p className="text-gray-400">Cargando jugadores...</p>}

      {error && <p className="text-red-400">{error}</p>}

      {/* Grid */}

      {!loading && !error && players.length > 0 && (

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {players.map((player) => (

            <div
              key={player._id}
              className="bg-[#0f1724] border border-white/10 rounded-2xl p-5 hover:border-orange-500/40 transition"
            >

              <div className="flex items-center gap-4">

                <JerseyIcon
                  number={player.dorsal}
                  className="h-16 w-16"
                />

                <div className="flex-1">

                  <h3 className="text-lg font-bold text-white leading-tight">
                    {player.name}
                  </h3>

                  <p className="text-sm text-orange-400">
                    {player.position || 'Sin posición'}
                  </p>

                  <p className="text-xs text-gray-400">
                    {player.team || 'Equipo no definido'}
                  </p>

                </div>

              </div>

              <div className="mt-4 flex justify-between">

                <Link
                  href={`/panel/players/${player._id}`}
                  className="text-sm flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver perfil
                </Link>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingPlayer(player)}
                  className="flex items-center gap-2"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Editar
                </Button>

              </div>

            </div>

          ))}

        </section>

      )}

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="flex justify-center gap-4 mt-6">

          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRightIcon className="w-4 h-4 ml-2" />
          </Button>

        </div>

      )}

    </div>
  );
}
