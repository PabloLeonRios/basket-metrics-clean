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
  UsersIcon,
  FireIcon,
  EyeIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * MÓDULO: PlayerManager
 *
 * Estado actual:
 * - UI/UX mejorada sin tocar la lógica funcional principal.
 * - Sigue consumiendo endpoints REST temporales:
 *   - GET /api/players
 *   - PUT /api/players/:id
 *
 * Qué mantiene este archivo:
 * - búsqueda
 * - tabs (mi equipo / rivales)
 * - paginación
 * - export a Excel / PDF
 * - edición de jugador
 * - activación / desactivación
 *
 * Preparado para migración a Mongo:
 * - Mantener la firma del modelo IPlayer mientras sea posible.
 * - Cuando se migre a backend real:
 *   1) reemplazar fetch directos por services/client
 *   2) centralizar filtros y paginación
 *   3) idealmente mover query state a URL params o server actions
 *   4) unificar alta/edición/borrado con contratos backend definitivos
 *
 * Importante:
 * - NO romper los nombres actuales de campos:
 *   _id, name, dorsal, position, team, isRival, isActive, photoUrl,
 *   height, weight, birthDate
 * - La UI ya está pensada para soportar métricas futuras.
 */

export default function PlayerManager() {
  const { user, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<'mine' | 'rivals'>('mine');

  // Edit Modal state
  const [editingPlayer, setEditingPlayer] = useState<IPlayer | null>(null);
  const [editName, setEditName] = useState('');
  const [editDorsal, setEditDorsal] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [editIsRival, setEditIsRival] = useState(false);
  const [editPhoto, setEditPhoto] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const totalLoaded = players.length;
  const activeLoaded = players.filter((p) => p.isActive !== false).length;
  const rivalLoaded = players.filter((p) => p.isRival).length;

  // Export methods
  const exportToExcel = () => {
    if (players.length === 0) {
      toast.info('No hay jugadores para exportar.');
      return;
    }

    const data = players.map((p) => ({
      Nombre: p.name,
      Dorsal: p.dorsal || '-',
      Posición: p.position || '-',
      Equipo: p.team || '-',
      Estado: p.isActive !== false ? 'Activo' : 'Inactivo',
    }));

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Jugadores');
    writeFile(workbook, 'jugadores.xlsx');
  };

  const exportToPDF = () => {
    if (players.length === 0) {
      toast.info('No hay jugadores para exportar.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Listado de Jugadores', 14, 15);

    const tableData = players.map((p) => [
      p.name,
      p.dorsal?.toString() || '-',
      p.position || '-',
      p.team || '-',
      p.isActive !== false ? 'Activo' : 'Inactivo',
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Nombre', 'Dorsal', 'Posición', 'Equipo', 'Estado']],
      body: tableData,
    });

    doc.save('jugadores.pdf');
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page to 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
        setError(err instanceof Error ? err.message : 'Error desconocido');
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

  const handleUpdatePlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const updatedData = {
        name: editName,
        dorsal: Number(editDorsal),
        position: editPosition,
        team: editTeam,
        isRival: editIsRival,
        photoUrl: editPhoto,
        height: editHeight ? Number(editHeight) : undefined,
        weight: editWeight ? Number(editWeight) : undefined,
        birthDate: editBirthDate ? editBirthDate : undefined,
      };

      const response = await fetch(`/api/players/${editingPlayer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar el jugador.');
      }

      toast.success('Jugador actualizado.');

      setPlayers(
        players.map((p) =>
          p._id === editingPlayer._id ? { ...p, ...updatedData } : p,
        ),
      );

      setEditingPlayer(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  };

  const handleToggleActive = async (player: IPlayer) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres ${player.isActive ? 'desactivar' : 'activar'} a este jugador?`,
      )
    ) {
      return;
    }

    try {
      const updatedData = { isActive: !player.isActive };

      const response = await fetch(`/api/players/${player._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('No se pudo cambiar el estado del jugador.');
      }

      toast.info(`Jugador ${player.isActive ? 'desactivado' : 'activado'}.`);
      setPlayers(players.filter((p) => p._id !== player._id));
      setEditingPlayer(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al cambiar estado.',
      );
    }
  };

  const openEditModal = (player: IPlayer) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditDorsal(String(player.dorsal || ''));
    setEditPosition(player.position || '');
    setEditTeam(player.team || '');
    setEditIsRival(!!player.isRival);
    setEditPhoto(player.photoUrl || '');
    setEditHeight(player.height ? String(player.height) : '');
    setEditWeight(player.weight ? String(player.weight) : '');

    let birthDateStr = '';
    if (player.birthDate) {
      try {
        const d = new Date(player.birthDate);
        if (!isNaN(d.getTime())) {
          birthDateStr = d.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing birthDate', e);
      }
    }

    setEditBirthDate(birthDateStr);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const labelStyles =
    'mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        setEditPhoto(canvas.toDataURL('image/jpeg', 0.8));
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.readAsDataURL(file);
  };

  const getPlayerInitial = (name: string) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || 'P';
  };

  const getAgeFromBirthDate = (birthDate?: string | Date) => {
    if (!birthDate) return null;

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const month = today.getMonth() - date.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Tabs + KPI Bar */}
      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0f1724] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <div className="border-b border-white/10 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
                Roster Control
              </p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-white md:text-2xl">
                Gestión de jugadores
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Organiza el plantel, controla fichas y prepara la base para
                scouting y análisis individual.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  <UsersIcon className="h-4 w-4" />
                  Cargados
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {totalLoaded}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  <FireIcon className="h-4 w-4" />
                  Activos
                </div>
                <div className="mt-2 text-2xl font-black text-orange-300">
                  {activeLoaded}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  <EyeIcon className="h-4 w-4" />
                  Rivales
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {rivalLoaded}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4 md:px-5">
          <nav className="flex gap-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('mine')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'mine'
                  ? 'border-orange-500/40 bg-orange-500/15 text-orange-300 shadow-[0_0_0_1px_rgba(249,115,22,0.14)]'
                  : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              Mi Equipo
            </button>

            <button
              onClick={() => setActiveTab('rivals')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'rivals'
                  ? 'border-orange-500/40 bg-orange-500/15 text-orange-300 shadow-[0_0_0_1px_rgba(249,115,22,0.14)]'
                  : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              Rivales
            </button>
          </nav>
        </div>

        {/* Toolbar */}
        <div className="px-4 pb-4 pt-4 md:px-5">
          <div className="rounded-[22px] border border-white/10 bg-[#0b1220] p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative w-full lg:max-w-md">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o dorsal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    inputSize="md"
                    className="pl-10"
                  />
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  <Checkbox
                    label="Ver Inactivos"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={exportToExcel}
                  className="flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Excel
                </Button>

                <Button
                  variant="secondary"
                  onClick={exportToPDF}
                  className="flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* States */}
      {loading && (
        <div className="rounded-[22px] border border-white/10 bg-[#0f1724] px-5 py-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
          <p className="text-sm font-medium text-gray-300">
            Cargando jugadores...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-[22px] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <div className="rounded-[22px] border border-white/10 bg-[#0f1724] px-5 py-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <UsersIcon className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-white">
            {debouncedSearchTerm
              ? `No se encontraron jugadores para "${debouncedSearchTerm}".`
              : 'No hay jugadores en esta lista.'}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Probá ajustar la búsqueda, cambiar de pestaña o revisar el estado
            filtrado.
          </p>
        </div>
      )}

      {/* Players Grid */}
      {!loading && !error && players.length > 0 && (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => {
              const age = getAgeFromBirthDate(player.birthDate);

              return (
                <article
                  key={player._id}
                  className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,36,0.98)_0%,rgba(9,14,23,1)_100%)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_28%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10 flex h-full flex-col">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex-shrink-0">
                          {player.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={player.photoUrl}
                              alt={`Foto de ${player.name}`}
                              className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10 shadow-md md:h-24 md:w-24"
                            />
                          ) : (
                            <div className="relative">
                              <JerseyIcon
                                number={player.dorsal}
                                className="h-20 w-20 md:h-24 md:w-24"
                              />
                              <div className="absolute -bottom-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#111827] text-[11px] font-bold text-gray-200 shadow-lg">
                                {player.dorsal || getPlayerInitial(player.name)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {player.isRival && (
                              <span className="rounded-full border border-red-500/20 bg-red-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300">
                                Rival
                              </span>
                            )}

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                                player.isActive !== false
                                  ? 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300'
                                  : 'border-gray-500/20 bg-gray-500/15 text-gray-300'
                              }`}
                            >
                              {player.isActive !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>

                          <h3 className="truncate text-lg font-black tracking-[-0.03em] text-white md:text-xl">
                            {player.name}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-orange-300">
                            {player.position || 'Sin posición'}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            {player.team ? `Equipo: ${player.team}` : 'Equipo no definido'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle stats */}
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Dorsal
                        </div>
                        <div className="mt-2 text-base font-black text-white">
                          {player.dorsal || '-'}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Altura
                        </div>
                        <div className="mt-2 text-base font-black text-white">
                          {player.height ? `${player.height} cm` : '-'}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Edad
                        </div>
                        <div className="mt-2 text-base font-black text-white">
                          {age ?? '-'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Peso
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-200">
                          {player.weight ? `${player.weight} kg` : 'Sin dato'}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Perfil
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-200">
                          {player.isRival ? 'Scouting rival' : 'Plantel propio'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <Link
                        href={`/panel/players/${player._id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-gray-200 transition-all hover:border-orange-500/30 hover:text-white"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Ver perfil
                      </Link>

                      <Button
                        onClick={() => openEditModal(player)}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <section className="rounded-[22px] border border-white/10 bg-[#0f1724] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-400">
                  Página <span className="font-bold text-white">{currentPage}</span> de{' '}
                  <span className="font-bold text-white">{totalPages}</span>
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Anterior
                  </Button>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    Siguiente
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,36,0.98)_0%,rgba(9,14,23,1)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0f1724]/95 px-5 py-4 backdrop-blur md:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
                  Player Editor
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                  Editar jugador
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Actualizá datos del perfil sin alterar la estructura funcional.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingPlayer(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition hover:border-white/20 hover:text-white"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlayer} className="space-y-6 px-5 py-5 md:px-6 md:py-6">
              {/* Header card */}
              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    {editPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editPhoto}
                        alt="Preview"
                        className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10 shadow-md"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#111827]">
                        <UserCircleIcon className="h-10 w-10 text-gray-500" />
                      </div>
                    )}

                    <div>
                      <p className="text-lg font-black text-white">
                        {editName || 'Jugador sin nombre'}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {editPosition || 'Sin posición'} · {editTeam || 'Sin equipo'}
                      </p>
                    </div>
                  </div>

                  <div className="md:ml-auto flex flex-col gap-2 sm:flex-row">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => photoInputRef.current?.click()}
                      size="sm"
                    >
                      Elegir foto...
                    </Button>

                    {editPhoto && (
                      <button
                        type="button"
                        onClick={() => setEditPhoto('')}
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Main fields */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="editName" className={labelStyles}>
                    Nombre
                  </label>
                  <Input
                    id="editName"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editDorsal" className={labelStyles}>
                    Dorsal
                  </label>
                  <Input
                    id="editDorsal"
                    type="number"
                    value={editDorsal}
                    onChange={(e) => setEditDorsal(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="editPosition" className={labelStyles}>
                    Posición
                  </label>
                  <Input
                    id="editPosition"
                    type="text"
                    list="edit-position-options"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                  />
                  <datalist id="edit-position-options">
                    <option value="Base" />
                    <option value="Escolta" />
                    <option value="Alero" />
                    <option value="Ala-Pívot" />
                    <option value="Pívot" />
                  </datalist>
                </div>

                <div>
                  <label htmlFor="editTeam" className={labelStyles}>
                    Equipo
                  </label>
                  <Input
                    id="editTeam"
                    type="text"
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    placeholder={editIsRival ? 'Ej: Equipo Rival' : 'Ej: Mi Equipo'}
                  />
                </div>
              </section>

              {/* Physical data */}
              <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-4">
                  <p className="text-sm font-black tracking-[-0.02em] text-white">
                    Datos físicos
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Información útil para análisis de perfil y scouting.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelStyles}>Estatura (cm)</label>
                    <Input
                      type="number"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      placeholder="Ej: 195"
                    />
                  </div>

                  <div>
                    <label className={labelStyles}>Peso (kg)</label>
                    <Input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      placeholder="Ej: 85"
                    />
                  </div>

                  <div>
                    <label className={labelStyles}>Nacimiento</label>
                    <Input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      min="1900-01-01"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </section>

              {/* Flags */}
              <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <Checkbox
                  label="Es jugador rival"
                  checked={editIsRival}
                  onChange={(e) => setEditIsRival(e.target.checked)}
                />
              </section>

              {/* Footer actions */}
              <section className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" variant="primary">
                    Guardar Cambios
                  </Button>

                  <Button
                    type="button"
                    variant={editingPlayer.isActive ? 'danger' : 'secondary'}
                    onClick={() => handleToggleActive(editingPlayer)}
                  >
                    {editingPlayer.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>

                <Button type="button" onClick={() => setEditingPlayer(null)}>
                  Cancelar
                </Button>
              </section>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
