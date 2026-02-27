import { ClipboardCheck } from 'lucide-react';

export const AttributionResultsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attribution Results</h1>
          <p className="text-sm text-gray-500">Trace transaction → rule → doctor allocations</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
        Attribution results will appear here once transactions are processed.
      </div>
    </div>
  );
};

