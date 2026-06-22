const metrics = [
  {
    label: "Usuarios Recorrentes",
    value: 384,
    change: "+8.2%",
    helper: "Nos ultimos 30 dias",
    accent: "text-ifes-green-700",
  },
  {
    label: "Perguntas Realizadas",
    value: 1264,
    change: "+12.7%",
    helper: "Media mensal",
    accent: "text-ifes-green-700",
  },
  {
    label: "Respostas bem sucedidas",
    value: 1138,
    change: "90.0%",
    helper: "Taxa de sucesso",
    accent: "text-ifes-green-700",
  },
  {
    label: "Respostas Mal Sucedidas",
    value: 126,
    change: "10.0%",
    helper: "Taxa de falha",
    accent: "text-ifes-red-700",
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
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 xs:p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-gray-950 xs:text-3xl">{value}</p>
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
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm xs:p-5 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-950">
          Desempenho de respostas reformuladas
        </h2>
        <p className="mt-1 text-sm text-gray-600">
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
              <stop offset="0%" stopColor="#00843d" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00843d" stopOpacity="0" />
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
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          <polygon points={areaPoints} fill="url(#successArea)" />
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#00843d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.month}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#ffffff" stroke="#00843d" strokeWidth="2.5" />
              <text x={point.x} y={height - 20} textAnchor="middle" className="fill-gray-600 text-[11px]">
                {point.month}
              </text>
              <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-gray-700 text-[11px]">
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
    <div className="h-full overflow-y-auto bg-gray-50 px-4 py-6 xs:px-5 md:px-10 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
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
