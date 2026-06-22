const metrics = [
  {
    label: "Usuarios Recorrentes",
    value: 384,
    change: "+8.2%",
    helper: "Nos ultimos 30 dias",
    accent: "text-emerald-400",
  },
  {
    label: "Perguntas Realizadas",
    value: 1264,
    change: "+12.7%",
    helper: "Media mensal",
    accent: "text-sky-400",
  },
  {
    label: "Respostas bem sucedidas",
    value: 1138,
    change: "90.0%",
    helper: "Taxa de sucesso",
    accent: "text-green-400",
  },
  {
    label: "Respostas Mal Sucedidas",
    value: 126,
    change: "10.0%",
    helper: "Taxa de falha",
    accent: "text-rose-400",
  },
];

const reformulatedQuestionPerformance = [
  { month: "Jan", successfulQuestions: 82 },
  { month: "Fev", successfulQuestions: 96 },
  { month: "Mar", successfulQuestions: 104 },
  { month: "Abr", successfulQuestions: 120 },
  { month: "Mai", successfulQuestions: 128 },
  { month: "Jun", successfulQuestions: 142 },
];

function DashboardMetricCard({ label, value, change, helper, accent }) {
  return (
    <article className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm transition hover:border-gray-700 xs:p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white xs:text-3xl">{value}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm font-medium ${accent}`}>{change}</span>
        <span className="text-xs text-gray-500">{helper}</span>
      </div>
    </article>
  );
}

function ReformulatedQuestionsChart() {
  const width = 760;
  const height = 320;
  const topPadding = 30;
  const rightPadding = 30;
  const bottomPadding = 50;
  const leftPadding = 50;
  const maxValue = Math.max(
    ...reformulatedQuestionPerformance.map((point) => point.successfulQuestions)
  );

  const xStep =
    (width - leftPadding - rightPadding) /
    (reformulatedQuestionPerformance.length - 1);
  const plotHeight = height - topPadding - bottomPadding;

  const points = reformulatedQuestionPerformance.map((point, index) => {
    const x = leftPadding + xStep * index;
    const y = topPadding + plotHeight - (point.successfulQuestions / maxValue) * plotHeight;
    return { ...point, x, y };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${leftPadding},${height - bottomPadding} ${polylinePoints} ${
    leftPadding + xStep * (points.length - 1)
  },${height - bottomPadding}`;

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm xs:p-5 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          Desempenho de respostas reformuladas
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Respostas bem sucedidas ao longo dos meses
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[280px] min-w-[620px] w-full xs:h-[320px] xs:min-w-[700px]"
          role="img"
          aria-label="Grafico de desempenho mensal de perguntas reformuladas bem sucedidas"
        >
          <defs>
            <linearGradient id="successArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((line) => {
            const y = topPadding + (plotHeight / 4) * line;
            return (
              <line
                key={line}
                x1={leftPadding}
                y1={y}
                x2={width - rightPadding}
                y2={y}
                stroke="#1f2937"
                strokeWidth="1"
              />
            );
          })}

          <polygon points={areaPoints} fill="url(#successArea)" />
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.month}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              <text x={point.x} y={height - 20} textAnchor="middle" className="fill-gray-400 text-[11px]">
                {point.month}
              </text>
              <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-gray-300 text-[11px]">
                {point.successfulQuestions}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

export function Dashboard() {
  return (
    <div className="h-full overflow-y-auto bg-gray-950 px-4 py-6 xs:px-5 md:px-10 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-400">
            Acompanhamento geral das metricas da plataforma
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <DashboardMetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <div className="mt-6">
          <ReformulatedQuestionsChart />
        </div>
      </div>
    </div>
  );
}
