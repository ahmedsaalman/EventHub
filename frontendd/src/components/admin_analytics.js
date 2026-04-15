

import React from "react";

// Local icon mock (no external heroicons import to stay isolated)
const TriangleIcon = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l10 18H2L12 2z" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const sampleMetrics = [
  { label: "Active Users", value: 1287, delta: +4.2 },
  { label: "New Signups", value: 98, delta: -1.1 },
  { label: "Conversion Rate", value: 12.6, delta: +0.3, suffix: "%" },
  { label: "Avg. Session", value: 7.8, delta: +0.4, suffix: "m" }
];

const sparkSeed = Array.from({ length: 24 }, (_, i) => {
  const base = 50 + Math.sin(i / 3) * 25 + Math.random() * 15;
  return Math.round(base);
});

function formatNumber(n) {
  return n.toLocaleString();
}

function classifyDelta(d) {
  return d > 0 ? "text-green-600" : d < 0 ? "text-red-600" : "text-gray-500";
}

const DummyCard = ({ metric }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-blue-50">
        <TriangleIcon className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm font-medium text-gray-600">{metric.label}</span>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-semibold text-gray-900">
        {formatNumber(metric.value)}
        {metric.suffix ? metric.suffix : ""}
      </span>
      <span className={`text-xs font-medium ${classifyDelta(metric.delta)}`}>
        {metric.delta > 0 ? "▲" : metric.delta < 0 ? "▼" : "■"} {metric.delta}%
      </span>
    </div>
    <div className="h-10 flex items-end gap-[2px]">
      {Array.from({ length: 30 }, (_, i) => {
        const h = 25 + Math.sin((i + metric.value) / 6) * 12 + (Math.random() * 6);
        return (
          <div
            key={i}
            style={{ height: h }}
            className="flex-1 bg-gradient-to-t from-blue-200 to-blue-500 rounded-sm opacity-70"
          />
        );
      })}
    </div>
  </div>
);

const SparkLine = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[2px] h-24">
      {data.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="w-2 bg-indigo-400 rounded-sm hover:bg-indigo-500 transition"
            title={`Point ${i + 1}: ${v}`}
          />
        );
      })}
    </div>
  );
};

const AdminAnalyticsDummy = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 rounded-full bg-indigo-100">
          <TriangleIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Dummy Admin Analytics Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {sampleMetrics.map(m => (
          <DummyCard key={m.label} metric={m} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <TriangleIcon className="w-5 h-5 text-indigo-500" />
              Traffic (Dummy Spark)
            </h3>
            <SparkLine data={sparkSeed} />
            <p className="mt-4 text-xs text-gray-500">
              Generated seed data. No real backend connection.
            </p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <TriangleIcon className="w-5 h-5 text-indigo-500" />
            Notes
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>All numbers are synthetic.</li>
            <li>Component is intentionally not exported.</li>
            <li>Add/remove blocks freely; isolated sandbox.</li>
            <li>Mimics styling patterns from reference modal.</li>
          </ul>
          <div className="mt-auto text-[10px] text-gray-400 pt-6">
            Placeholder analytics surface. Safe to ignore.
          </div>
        </div>
      </div>
    </div>
  );
};

window.__ADMIN_ANALYTICS_DUMMY__ = AdminAnalyticsDummy;
