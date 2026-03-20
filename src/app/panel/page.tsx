"use client";

/**
 * ============================
 *  NOTAS PARA PABLITO (Mongo)
 * ============================
 * MÓDULO: DISTRIBUCIÓN / PANTALLA PRINCIPAL
 *
 * Migración futura:
 * - reemplazar store local por endpoints del backend
 * - el mapa ya usa Leaflet + OSM real
 * - la optimización de rutas irá con OSRM / ORS
 *
 * IMPORTANTE:
 * - al confirmar carga, backend debe descontar stock físico
 * - al anular carga, backend debe reponer stock físico
 * - todo debe quedar auditado
 *
 * MAPA:
 * - Se importa con dynamic() + ssr:false porque Leaflet no funciona en SSR
 * - Los pedidos pasan lat/lng/bultos/kilos/prioridad al mapa
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  anularCarga,
  buildSuggestedRoute,
  confirmarCarga,
  createCarga,
  getDistribucionCargas,
  getDistribucionContexto,
  getDistribucionDashboard,
  getPedidosPendientes,
  getTransportesDisponibles,
  initDistribucionStore,
  saveDistribucionContexto,
  type DistribucionCarga,
  type DistribucionContexto,
  type DistribucionPedido,
  type DistribucionTransporte,
} from "@/lib/stores/distribucionStore";

// Import dinámico obligatorio — Leaflet no funciona en SSR
const DistribucionMap = dynamic(
  () => import("@/src/components/distribucion/DistribucionMapMock"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-white/8 bg-[#07131c]">
        <div className="flex items-center gap-3 text-white/30">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <span className="text-sm">Cargando mapa...</span>
        </div>
      </div>
    ),
  }
);

function currency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function estadoBadgeClass(
  estado: "Disponible" | "En carga" | "Confirmado" | "En reparto"
) {
  if (estado === "Disponible") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (estado === "En carga") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (estado === "Confirmado") return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  return "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300";
}

function cargaBadgeClass(estado: "Borrador" | "Confirmada" | "Anulada" | "Liquidada") {
  if (estado === "Confirmada") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (estado === "Anulada") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (estado === "Liquidada") return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

export default function DistribucionPage() {
  const [contexto, setContexto] = useState<DistribucionContexto | null>(null);
  const [pedidos, setPedidos] = useState<DistribucionPedido[]>([]);
  const [transportes, setTransportes] = useState<DistribucionTransporte[]>([]);
  const [cargas, setCargas] = useState<DistribucionCarga[]>([]);
  const [selectedPedidoIds, setSelectedPedidoIds] = useState<string[]>([]);
  const [selectedTransporteId, setSelectedTransporteId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [okMsg, setOkMsg] = useState<string>("");

  function reload() {
    initDistribucionStore();
    const ctx = getDistribucionContexto();
    setContexto(ctx);
    setPedidos(getPedidosPendientes(ctx));
    setTransportes(getTransportesDisponibles(ctx));
    setCargas(getDistribucionCargas().filter((c) => c.fechaISO === ctx.fechaISO));
  }

  useEffect(() => { reload(); }, []);

  const dashboard = useMemo(() => {
    if (!contexto) return { pedidosPendientes: 0, camionesDisponibles: 0, rutasGeneradasHoy: 0, cargasConfirmadas: 0, kilosPendientes: 0, bultosPendientes: 0, importePendiente: 0 };
    return getDistribucionDashboard(contexto);
  }, [contexto, pedidos, transportes, cargas]);

  const routePreview = useMemo(() => {
    if (selectedPedidoIds.length === 0) return { paradas: [], distanciaEstimadaKm: 0, tiempoEstimadoMin: 0 };
    return buildSuggestedRoute(selectedPedidoIds);
  }, [selectedPedidoIds]);

  const selectedTransport = useMemo(
    () => transportes.find((t) => t.id === selectedTransporteId) ?? null,
    [transportes, selectedTransporteId]
  );

  const selectedTotals = useMemo(() => {
    const selected = pedidos.filter((p) => selectedPedidoIds.includes(p.id));
    return {
      pedidos: selected.length,
      bultos: selected.reduce((acc, p) => acc + p.bultos, 0),
      kilos: selected.reduce((acc, p) => acc + p.kilos, 0),
      importe: selected.reduce((acc, p) => acc + p.importe, 0),
    };
  }, [pedidos, selectedPedidoIds]);

  // Pedidos para el mapa — con coords completas
  const mapPedidos = useMemo(() => {
    const selected = pedidos.filter((p) => selectedPedidoIds.includes(p.id));
    const base = selected.length > 0 ? selected : pedidos.slice(0, 8);
    return base.map((p) => ({
      id: p.id,
      clienteNombre: p.clienteNombre,
      zona: p.zona,
      lat: p.lat,
      lng: p.lng,
      bultos: p.bultos,
      kilos: p.kilos,
      prioridad: p.prioridad,
    }));
  }, [pedidos, selectedPedidoIds]);

  function updateContext<K extends keyof DistribucionContexto>(key: K, value: DistribucionContexto[K]) {
    if (!contexto) return;
    const next = { ...contexto, [key]: value };
    setContexto(next);
    saveDistribucionContexto(next);
  }

  function handleAplicarFiltros() {
    if (!contexto) return;
    saveDistribucionContexto(contexto);
    setSelectedPedidoIds([]);
    setSelectedTransporteId("");
    setErrorMsg("");
    setOkMsg("");
    reload();
  }

  function togglePedido(pedidoId: string) {
    setSelectedPedidoIds((prev) =>
      prev.includes(pedidoId) ? prev.filter((id) => id !== pedidoId) : [...prev, pedidoId]
    );
  }

  function handleSelectAllPedidos() {
    if (selectedPedidoIds.length === pedidos.length) { setSelectedPedidoIds([]); return; }
    setSelectedPedidoIds(pedidos.map((p) => p.id));
  }

  function handleGenerateCarga() {
    setErrorMsg(""); setOkMsg("");
    if (!contexto) return;
    try {
      const nueva = createCarga({ contexto, transporteId: selectedTransporteId, pedidoIds: selectedPedidoIds });
      setOkMsg(`Carga ${nueva.numero} generada correctamente.`);
      setSelectedPedidoIds([]);
      setSelectedTransporteId("");
      reload();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "No se pudo generar la carga.");
    }
  }

  function handleConfirmCarga(cargaId: string) {
    setErrorMsg(""); setOkMsg("");
    try { confirmarCarga(cargaId); setOkMsg("Carga confirmada correctamente."); reload(); }
    catch (error) { setErrorMsg(error instanceof Error ? error.message : "No se pudo confirmar la carga."); }
  }

  function handleAnularCarga(cargaId: string) {
    setErrorMsg(""); setOkMsg("");
    try { anularCarga(cargaId); setOkMsg("Carga anulada correctamente."); reload(); }
    catch (error) { setErrorMsg(error instanceof Error ? error.message : "No se pudo anular la carga."); }
  }

  if (!contexto) {
    return (
      <div className="min-h-screen bg-[#061018] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Cargando distribución...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061018] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Arqon ERP · Distribución</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Centro operativo logístico</h1>
            <p className="mt-2 max-w-4xl text-sm text-white/65">
              Ruteo, asignación a transporte, generación de cargas y confirmación.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={reload} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">Actualizar</button>
            <button onClick={handleAplicarFiltros} className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15">Aplicar entorno</button>
          </div>
        </div>

        {/* Selector operativo */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Selector operativo</h2>
            <p className="text-sm text-white/55">Contexto base para trabajar distribución por fecha y depósito.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm text-white/70">Entorno</label>
              <input value={contexto.entornoNombre} onChange={(e) => updateContext("entornoNombre", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0a1822] px-4 py-3 text-sm outline-none focus:border-cyan-400/40" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Código entorno</label>
              <input value={contexto.entornoId} onChange={(e) => updateContext("entornoId", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0a1822] px-4 py-3 text-sm outline-none focus:border-cyan-400/40" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Fecha de entrega</label>
              <input type="date" value={contexto.fechaISO} onChange={(e) => updateContext("fechaISO", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0a1822] px-4 py-3 text-sm outline-none focus:border-cyan-400/40" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Depósito</label>
              <input value={contexto.depositoNombre} onChange={(e) => updateContext("depositoNombre", e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0a1822] px-4 py-3 text-sm outline-none focus:border-cyan-400/40" />
            </div>
            <div className="flex items-end">
              <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1822] px-4 py-3 text-sm text-white/80">
                <input type="checkbox" checked={contexto.aplicarRelacionRutaTransporte} onChange={(e) => updateContext("aplicarRelacionRutaTransporte", e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
                Pre-aplicar relación ruta-transporte
              </label>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-white/60">Pedidos pendientes</p><p className="mt-3 text-3xl font-semibold">{dashboard.pedidosPendientes}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-white/60">Camiones disponibles</p><p className="mt-3 text-3xl font-semibold">{dashboard.camionesDisponibles}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-white/60">Rutas generadas hoy</p><p className="mt-3 text-3xl font-semibold">{dashboard.rutasGeneradasHoy}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-white/60">Cargas confirmadas</p><p className="mt-3 text-3xl font-semibold">{dashboard.cargasConfirmadas}</p></div>
        </section>

        {/* Mapa real */}
        <section className="mb-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-cyan-200">Mapa logístico</h2>
              <p className="text-sm text-cyan-100/70">
                {mapPedidos.length} punto{mapPedidos.length !== 1 ? "s" : ""} en el mapa ·{" "}
                {selectedPedidoIds.length > 0 ? "mostrando seleccionados" : "mostrando todos"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="h-2 w-2 rounded-full bg-red-400"></span> Alta
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span> Media
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Baja
              </div>
            </div>
          </div>
          <DistribucionMap
            depositoLabel={contexto.depositoNombre}
            pedidos={mapPedidos}
            height="480px"
          />
        </section>

        {/* Alerts */}
        {(errorMsg || okMsg) && (
          <section className="mb-6">
            {errorMsg && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMsg}</div>}
            {okMsg && <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{okMsg}</div>}
          </section>
        )}

        {/* Pedidos + Transportes */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Pedidos pendientes</h2>
                <p className="text-sm text-white/55">Seleccioná pedidos para generar una carga. El mapa se actualiza en tiempo real.</p>
              </div>
              <button onClick={handleSelectAllPedidos} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 transition hover:bg-white/10">
                {selectedPedidoIds.length === pedidos.length && pedidos.length > 0 ? "Quitar todos" : "Seleccionar todos"}
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[60px_1.1fr_1fr_0.8fr_0.6fr_0.6fr_0.8fr] bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-white/45">
                <div>Sel</div><div>Cliente</div><div>Dirección</div><div>Zona</div><div>Bultos</div><div>Kg</div><div>Prioridad</div>
              </div>
              <div className="divide-y divide-white/10">
                {pedidos.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-white/40">No hay pedidos pendientes para este contexto.</div>
                ) : (
                  pedidos.map((pedido) => {
                    const checked = selectedPedidoIds.includes(pedido.id);
                    return (
                      <div
                        key={pedido.id}
                        className={`grid grid-cols-[60px_1.1fr_1fr_0.8fr_0.6fr_0.6fr_0.8fr] items-center px-4 py-4 text-sm transition ${checked ? "bg-cyan-400/5" : "hover:bg-white/5"}`}
                      >
                        <div>
                          <input type="checkbox" checked={checked} onChange={() => togglePedido(pedido.id)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
                        </div>
                        <div>
                          <p className="font-medium">{pedido.clienteNombre}</p>
                          <p className="text-xs text-white/45">{pedido.codigo}</p>
                        </div>
                        <div className="text-white/70">{pedido.direccion}</div>
                        <div className="text-white/70">{pedido.zona}</div>
                        <div className="text-white/70">{pedido.bultos}</div>
                        <div className="text-white/70">{pedido.kilos}</div>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 text-xs ${
                            pedido.prioridad === "Alta" ? "text-red-400" :
                            pedido.prioridad === "Media" ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              pedido.prioridad === "Alta" ? "bg-red-400" :
                              pedido.prioridad === "Media" ? "bg-amber-400" : "bg-emerald-400"
                            }`} />
                            {pedido.prioridad}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Transportes</h2>
                <p className="text-sm text-white/55">Seleccioná un transporte para generar carga.</p>
              </div>
              <div className="space-y-3">
                {transportes.map((transporte) => {
                  const isSelected = selectedTransporteId === transporte.id;
                  return (
                    <div key={transporte.id} className={`rounded-2xl border p-4 transition ${isSelected ? "border-cyan-400/35 bg-cyan-400/10" : "border-white/10 bg-[#0a1822] hover:border-white/20"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => setSelectedTransporteId(transporte.id)} className="flex-1 text-left">
                          <p className="font-medium">{transporte.nombre}</p>
                          <p className="mt-1 text-sm text-white/55">{transporte.codigo} · {transporte.chofer}</p>
                          <p className="mt-1 text-xs text-white/40">Cap: {transporte.capacidadKg} kg · {transporte.capacidadBultos} bultos</p>
                        </button>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${estadoBadgeClass(transporte.estado)}`}>{transporte.estado}</span>
                          <Link href={`/panel/distribucion/camiones/${transporte.id}`} className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-200 transition hover:bg-cyan-400/15">Abrir</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedTransport && (
                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <p className="text-sm font-medium text-cyan-200">Transporte seleccionado</p>
                  <p className="mt-2 text-sm text-cyan-100/80">{selectedTransport.nombre} · {selectedTransport.chofer}</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Ruta sugerida</h2>
                <p className="text-sm text-white/55">Orden base de reparto para los pedidos seleccionados.</p>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-white/45">Paradas</p><p className="mt-2 text-xl font-semibold">{routePreview.paradas.length}</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-white/45">Distancia</p><p className="mt-2 text-xl font-semibold">{routePreview.distanciaEstimadaKm} km</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-white/45">Tiempo</p><p className="mt-2 text-xl font-semibold">{routePreview.tiempoEstimadoMin} min</p></div>
              </div>
              <div className="max-h-[260px] overflow-auto rounded-2xl border border-white/10">
                <div className="divide-y divide-white/10">
                  {routePreview.paradas.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-white/40">Seleccioná pedidos para ver el orden sugerido.</div>
                  ) : (
                    routePreview.paradas.map((parada) => (
                      <div key={parada.pedidoId} className="flex items-start gap-3 px-4 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs font-semibold text-cyan-200">{parada.orden}</div>
                        <div>
                          <p className="text-sm font-medium">{parada.clienteNombre}</p>
                          <p className="text-xs text-white/50">{parada.direccion} · {parada.zona}</p>
                          <p className="mt-1 text-xs text-white/40">{parada.kilos} kg · {parada.bultos} bultos</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mt-4">
                <button onClick={handleGenerateCarga} className="w-full rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15">
                  Generar carga
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Cargas del día */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Cargas del día</h2>
            <p className="text-sm text-white/55">Base operativa con borrador, confirmación y anulación.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[0.8fr_0.9fr_0.8fr_0.5fr_0.5fr_0.6fr_0.7fr_1fr] bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-white/45">
              <div>Carga</div><div>Transporte</div><div>Chofer</div><div>Pedidos</div><div>Kg</div><div>Km</div><div>Estado</div><div>Acciones</div>
            </div>
            <div className="divide-y divide-white/10">
              {cargas.length === 0 ? (
                <div className="px-4 py-8 text-sm text-white/40">Todavía no hay cargas generadas para esta fecha.</div>
              ) : (
                [...cargas].sort((a, b) => b.createdAt - a.createdAt).map((carga) => (
                  <div key={carga.id} className="grid grid-cols-[0.8fr_0.9fr_0.8fr_0.5fr_0.5fr_0.6fr_0.7fr_1fr] items-center px-4 py-4 text-sm">
                    <div><p className="font-medium">{carga.numero}</p><p className="text-xs text-white/45">{carga.fechaISO}</p></div>
                    <div className="text-white/75">{carga.transporteNombre}</div>
                    <div className="text-white/75">{carga.chofer}</div>
                    <div className="text-white/75">{carga.totalPedidos}</div>
                    <div className="text-white/75">{carga.totalKilos}</div>
                    <div className="text-white/75">{carga.distanciaEstimadaKm}</div>
                    <div><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${cargaBadgeClass(carga.estado)}`}>{carga.estado}</span></div>
                    <div className="flex flex-wrap gap-2">
                      {carga.estado === "Borrador" && (
                        <button onClick={() => handleConfirmCarga(carga.id)} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-500/15">Confirmar</button>
                      )}
                      {carga.estado !== "Anulada" && (
                        <button onClick={() => handleAnularCarga(carga.id)} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-500/15">Anular</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm font-medium text-amber-200">Regla crítica Arqon</p>
            <p className="mt-2 text-sm text-amber-100/75">Al confirmar carga debe descontarse stock físico. Si se anula, debe reponerse.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
