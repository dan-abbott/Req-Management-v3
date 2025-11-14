import { RequirementLevel } from '../../types';
import { getNextRequirementLevel, REQUIREMENT_LEVELS } from '../../utils/constants';

interface LevelSuggestionModalProps {
  isOpen: boolean;
  parentLevel?: RequirementLevel;
  currentLevel?: RequirementLevel;
  onAccept: (newLevel: RequirementLevel) => void;
  onReject: () => void;
  onClose: () => void;
}

export function LevelSuggestionModal({
  isOpen,
  parentLevel,
  currentLevel,
  onAccept,
  onReject,
  onClose
}: LevelSuggestionModalProps) {
  if (!isOpen) return null;

  const suggestedLevel = getNextRequirementLevel(parentLevel);

  if (!suggestedLevel) {
    // Parent is at the lowest level, can't suggest
    return null;
  }

  const parentLevelLabel = REQUIREMENT_LEVELS.find(l => l.value === parentLevel)?.label || parentLevel;
  const suggestedLevelLabel = REQUIREMENT_LEVELS.find(l => l.value === suggestedLevel)?.label || suggestedLevel;
  const currentLevelLabel = currentLevel ? 
    (REQUIREMENT_LEVELS.find(l => l.value === currentLevel)?.label || currentLevel) : 
    'Not set';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Level Suggestion
            </h3>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            <p className="text-gray-700">
              You're creating a "derives-from" relationship to a <strong>{parentLevelLabel}</strong> requirement.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg 
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <div>
                  <p className="font-medium text-blue-900 mb-1">
                    Suggested Level: {suggestedLevelLabel}
                  </p>
                  <p className="text-sm text-blue-700">
                    This is the next level down in the requirement hierarchy.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">Current level: <strong>{currentLevelLabel}</strong></p>
              <p>Would you like to update this requirement to <strong>{suggestedLevelLabel}</strong>?</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => {
                onReject();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
            >
              Keep Current Level
            </button>
            <button
              onClick={() => {
                onAccept(suggestedLevel);
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-[#3FB95A] text-white rounded-lg hover:bg-[#35a04d] font-medium"
            >
              Use Suggested Level
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
