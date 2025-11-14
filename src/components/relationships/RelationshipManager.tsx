import { useState } from 'react';
import { Item, RelationshipType, RelationshipWithItem, RequirementLevel } from '../../types';
import { RELATIONSHIP_TYPES, getRelationshipTypeColor, getItemTypeLabel, getNextRequirementLevel } from '../../utils/constants';
import { LevelSuggestionModal } from './LevelSuggestionModal';

interface RelationshipManagerProps {
  currentItem: Item;
  availableItems: Item[];
  outgoing: RelationshipWithItem[];
  incoming: RelationshipWithItem[];
  onCreateRelationship: (toId: number, type: RelationshipType) => Promise<void>;
  onDeleteRelationship: (id: number) => Promise<void>;
  onUpdateItemLevel?: (newLevel: RequirementLevel) => void;
}

export function RelationshipManager({
  currentItem,
  availableItems,
  outgoing,
  incoming,
  onCreateRelationship,
  onDeleteRelationship,
  onUpdateItemLevel
}: RelationshipManagerProps) {
  const [selectedType, setSelectedType] = useState<RelationshipType>('relates-to');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showLevelSuggestion, setShowLevelSuggestion] = useState(false);
  const [pendingRelationship, setPendingRelationship] = useState<{ toId: number; type: RelationshipType } | null>(null);
  const [targetItem, setTargetItem] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out self and existing relationships
  const existingToIds = new Set(outgoing.map(r => r.to_id));
  const availableTargets = availableItems.filter(
    item => item.id !== currentItem.id && !existingToIds.has(item.id)
  );

  const handleAddRelationship = async () => {
    if (!selectedItemId) return;

    const toId = parseInt(selectedItemId);
    const target = availableItems.find(i => i.id === toId);
    
    if (!target) return;

    setError(null);
    setCreating(true);

    try {
      // Check if this is a "derives-from" relationship and target has a level
      if (selectedType === 'derives-from' && currentItem.type === 'requirement' && target.type === 'requirement' && target.level) {
        const suggestedLevel = getNextRequirementLevel(target.level);
        
        if (suggestedLevel && suggestedLevel !== currentItem.level) {
          // Show level suggestion modal
          setPendingRelationship({ toId, type: selectedType });
          setTargetItem(target);
          setShowLevelSuggestion(true);
          setCreating(false);
          return;
        }
      }

      // Create relationship directly
      await onCreateRelationship(toId, selectedType);
      setSelectedItemId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create relationship');
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptLevelSuggestion = async (newLevel: RequirementLevel) => {
    if (!pendingRelationship) return;

    try {
      // Update item level if callback provided
      if (onUpdateItemLevel) {
        onUpdateItemLevel(newLevel);
      }

      // Create the relationship
      await onCreateRelationship(pendingRelationship.toId, pendingRelationship.type);
      setSelectedItemId('');
      setPendingRelationship(null);
      setTargetItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create relationship');
    }
  };

  const handleRejectLevelSuggestion = async () => {
    if (!pendingRelationship) return;

    try {
      // Create relationship without changing level
      await onCreateRelationship(pendingRelationship.toId, pendingRelationship.type);
      setSelectedItemId('');
      setPendingRelationship(null);
      setTargetItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create relationship');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this relationship?')) return;
    
    try {
      await onDeleteRelationship(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete relationship');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Relationship */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add Relationship</h4>
        
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as RelationshipType)}
            className="w-1/3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A] text-sm"
          >
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A] text-sm"
            disabled={availableTargets.length === 0}
          >
            <option value="">Select target item...</option>
            {availableTargets.map(item => (
              <option key={item.id} value={item.id}>
                [{getItemTypeLabel(item.type)}] #{item.id} - {item.title.substring(0, 50)}
                {item.title.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddRelationship}
            disabled={!selectedItemId || creating}
            className="px-4 py-2 bg-[#3FB95A] text-white rounded hover:bg-[#35a04d] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
          >
            {creating ? 'Adding...' : 'Add'}
          </button>
        </div>

        {selectedType && (
          <p className="mt-2 text-xs text-gray-500">
            {RELATIONSHIP_TYPES.find(t => t.value === selectedType)?.description}
          </p>
        )}
      </div>

      {/* Outgoing Relationships */}
      {outgoing.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Outgoing Relationships ({outgoing.length})
          </h4>
          <div className="space-y-2">
            {outgoing.map(rel => (
              <div
                key={rel.id}
                className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${getRelationshipTypeColor(rel.type)}`}>
                      {RELATIONSHIP_TYPES.find(t => t.value === rel.type)?.label}
                    </span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {rel.to_item ? getItemTypeLabel(rel.to_item.type) : 'Unknown'}
                    </span>
                  </div>
                  {rel.to_item && (
                    <p className="text-sm text-gray-900 truncate">
                      #{rel.to_item.id} - {rel.to_item.title}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(rel.id)}
                  className="flex-shrink-0 text-red-600 hover:text-red-800 text-sm"
                  title="Delete relationship"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Relationships */}
      {incoming.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Incoming Relationships ({incoming.length})
          </h4>
          <div className="space-y-2">
            {incoming.map(rel => (
              <div
                key={rel.id}
                className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {rel.from_item ? getItemTypeLabel(rel.from_item.type) : 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getRelationshipTypeColor(rel.type)}`}>
                      {RELATIONSHIP_TYPES.find(t => t.value === rel.type)?.label}
                    </span>
                  </div>
                  {rel.from_item && (
                    <p className="text-sm text-gray-900 truncate">
                      #{rel.from_item.id} - {rel.from_item.title}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500">Read-only</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoing.length === 0 && incoming.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No relationships yet. Add one above to get started.
        </p>
      )}

      {/* Level Suggestion Modal */}
      <LevelSuggestionModal
        isOpen={showLevelSuggestion}
        parentLevel={targetItem?.level}
        currentLevel={currentItem.level}
        onAccept={handleAcceptLevelSuggestion}
        onReject={handleRejectLevelSuggestion}
        onClose={() => {
          setShowLevelSuggestion(false);
          setPendingRelationship(null);
          setTargetItem(null);
          setCreating(false);
        }}
      />
    </div>
  );
}
