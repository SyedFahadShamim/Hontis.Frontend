import { AlertOctagon } from 'lucide-react';

export const AttributionExceptionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertOctagon className="w-5 h-5 text-red-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Exceptions</h1>
          <p className="text-sm text-gray-500">Unmapped products, missing areas, or rule conflicts</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
        No exceptions to show yet.
      </div>
    </div>
  );
};

