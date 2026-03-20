{sessions.map((session) => {
  const isClosed = !!session.finishedAt;

  return (
    <div
      key={session._id}
      className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]"
    >
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-white leading-tight">
            {session.name}
          </h3>

          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              isClosed
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}
          >
            {isClosed ? 'Cerrada' : 'Abierta'}
          </span>
        </div>

        <p className="text-xs text-white/50 mt-1">
          {session.sessionType}
        </p>
      </div>

      {/* INFO */}
      <div className="text-sm text-white/60 space-y-1">
        <p>
          🕒 {new Date(session.date).toLocaleString()}
        </p>

        {session.finishedAt && (
          <p className="text-emerald-400">
            ✔ Finalizada: {new Date(session.finishedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-col gap-2">
        {!isClosed && (
          <>
            <Link
              href={`/panel/tracker/${session._id}`}
              className="w-full text-center rounded-lg bg-cyan-500/90 hover:bg-cyan-400 text-black font-semibold py-2 transition"
            >
              Tracker
            </Link>

            {(session.sessionType === 'Partido' ||
              session.sessionType === 'Partido de Temporada') && (
              <Link
                href={`/panel/sessions/${session._id}/clock`}
                className="w-full text-center rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 transition"
              >
                Reloj
              </Link>
            )}

            <Link
              href={`/panel/sessions/${session._id}/edit`}
              className="w-full text-center rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 transition"
            >
              Editar
            </Link>
          </>
        )}

        {(isClosed || calculationStatus[session._id] === 'done') && (
          <Link
            href={`/panel/dashboard/${session._id}`}
            className="w-full text-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 transition"
          >
            Ver Resumen
          </Link>
        )}
      </div>
    </div>
  );
})}
