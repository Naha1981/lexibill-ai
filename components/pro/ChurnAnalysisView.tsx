
import React from 'react';
import { RiskAlert } from '../../types';
import { AlertTriangleIcon, LightbulbIcon } from '../icons';

interface ChurnAnalysisViewProps {
  riskAlerts: RiskAlert[];
}

const ChurnAnalysisView: React.FC<ChurnAnalysisViewProps> = ({ riskAlerts }) => {
  if (riskAlerts.length === 0) {
    return (
      <div className="p-4 bg-[#214a3c] rounded-lg text-center">
        <LightbulbIcon className="w-8 h-8 mx-auto mb-2 text-green-400" />
        <p className="text-sm text-green-300">No immediate client risk alerts. Keep up the great client relationships!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#b2dfdb] mb-3">
        Based on recent activity and payment patterns (mocked data), these clients may require attention:
      </p>
      {riskAlerts.map(alert => (
        <div key={alert.id} className="p-3 bg-[#2c5045] rounded-lg border border-yellow-700/50">
          <div className="flex items-start">
            <AlertTriangleIcon className="w-5 h-5 text-yellow-400 mr-2.5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-md font-semibold text-yellow-300">{alert.clientName}</h4>
              <p className="text-sm text-yellow-100 opacity-90 mt-0.5">{alert.riskDescription}</p>
              {alert.suggestedAction && (
                <div className="mt-1.5 pt-1.5 border-t border-yellow-600/30 flex items-start text-xs">
                    <LightbulbIcon className="w-3.5 h-3.5 text-yellow-200 mr-1.5 mt-px flex-shrink-0"/>
                    <span className="text-yellow-200 opacity-80">Suggestion: {alert.suggestedAction}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
       <p className="text-xs text-center text-[#8ecdb7] pt-2">
        Churn prediction is based on mock data patterns. Future versions will use more advanced analytics.
      </p>
    </div>
  );
};

export default ChurnAnalysisView;
