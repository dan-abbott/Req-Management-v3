import { useState, useEffect } from 'react';
import { relationshipsAPI } from '../../services/api/relationships';

interface DashboardProps {
  projectId: number | null;
}

interface Metrics {
  testCoverage: number;
  traceabilityScore: number;
  loading: boolean;
}

export function Dashboard({ projectId }: DashboardProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    testCoverage: 0,
    traceabilityScore: 0,
    loading: true
  });

  useEffect(() => {
    if (!projectId) {
      setMetrics({ testCoverage: 0, traceabilityScore: 0, loading: false });
      return;
    }

    const fetchMetrics = async () => {
      setMetrics(prev => ({ ...prev, loading: true }));
      
      try {
        const [coverage, traceability] = await Promise.all([
          relationshipsAPI.calculateTestCoverage(projectId),
          relationshipsAPI.calculateTraceabilityScore(projectId)
        ]);

        setMetrics({
          testCoverage: coverage,
          traceabilityScore: traceability,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setMetrics({ testCoverage: 0, traceabilityScore: 0, loading: false });
      }
    };

    fetchMetrics();
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Select a project to view metrics
      </div>
    );
  }

  if (metrics.loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Project Metrics</h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Coverage */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Test Coverage</h4>
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{metrics.testCoverage}%</span>
            <span className="text-sm text-gray-500">of requirements</span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-500"
              style={{ width: `${metrics.testCoverage}%` }}
            />
          </div>
          
          <p className="mt-2 text-xs text-gray-600">
            Requirements with linked test cases
          </p>
        </div>

        {/* Traceability Score */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Traceability Score</h4>
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{metrics.traceabilityScore}%</span>
            <span className="text-sm text-gray-500">of items</span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${metrics.traceabilityScore}%` }}
            />
          </div>
          
          <p className="mt-2 text-xs text-gray-600">
            Items with any relationships
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {(metrics.testCoverage < 80 || metrics.traceabilityScore < 60) && (
        <div className="px-6 pb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Recommendations</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {metrics.testCoverage < 80 && (
                <li>• Add more test cases to improve coverage (target: 80%)</li>
              )}
              {metrics.traceabilityScore < 60 && (
                <li>• Create more relationships between items for better traceability (target: 60%)</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
