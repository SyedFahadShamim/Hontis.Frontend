import { useQuery } from '@tanstack/react-query';
import { BarChart3, AlertTriangle, Layers, CheckCircle2 } from 'lucide-react';
import { attributionApi } from '../lib/attribution-api';

const pipelineSteps = [
  { key: 'rawCount', label: 'Raw' },
  { key: 'normalizedCount', label: 'Normalized' },
  { key: 'mappedCount', label: 'Mapped' },
  { key: 'areaResolvedCount', label: 'Area Resolved' },
  { key: 'ruleAppliedCount', label: 'Rule Applied' },
  { key: 'attributedCount', label: 'Attributed' },
  { key: 'exceptionCount', label: 'Exceptions' },
] as const;

export const AttributionOverviewPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attributionOverview'],
    queryFn: attributionApi.getOverview,
  });

  const stats = data ?? {
    rawCount: 0,
    normalizedCount: 0,
    mappedCount: 0,
    areaResolvedCount: 0,
    ruleAppliedCount: 0,
    attributedCount: 0,
    exceptionCount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales Attribution Overview</h1>
          <p className="text-sm text-gray-500">Pipeline health and exception visibility</p>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>Failed to load attribution overview.</span>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Attributed</p>
            <p className="text-lg font-semibold text-gray-900">{stats.attributedCount}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Rule Applied</p>
            <p className="text-lg font-semibold text-gray-900">{stats.ruleAppliedCount}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Exceptions</p>
            <p className="text-lg font-semibold text-gray-900">{stats.exceptionCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Processing Pipeline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {pipelineSteps.map((step) => (
            <div key={step.key} className="rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500">{step.label}</p>
              <p className="text-lg font-semibold text-gray-900">
                {isLoading ? '...' : stats[step.key]}
              </p>
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="mt-4 text-xs text-gray-400">Loading pipeline status...</div>
        )}
      </div>
    </div>
  );
};

