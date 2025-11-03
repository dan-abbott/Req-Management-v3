import React from 'react';
import { Item } from '../../types';
import { Button } from '../common/Button';
import { TYPE_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

interface ItemDetailProps {
  item: Item | null;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function ItemDetail({ item, onClose, onEdit, onDelete }: ItemDetailProps) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">Select an item</p>
        <p className="text-sm">Click on an item to view its details</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      onDelete(item);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium border ${TYPE_COLORS[item.type]}`}>
              {item.type.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">ID: {item.id}</span>
            <span className="text-sm text-gray-500">v{item.version}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 px-6 py-3 border-b bg-gray-50 flex gap-2">
        <Button variant="primary" onClick={() => onEdit(item)}>
          Edit
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
            <div className={`mt-1 inline-flex px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[item.status]}`}>
              {item.status}
            </div>
          </div>
          {item.priority && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
              <div className={`mt-1 font-medium ${PRIORITY_COLORS[item.priority]}`}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </div>
            </div>
          )}
          {item.owner && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Owner</label>
              <div className="mt-1 text-sm text-gray-900">{item.owner}</div>
            </div>
          )}
          {item.level && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Level</label>
              <div className="mt-1 text-sm text-gray-900">{item.level}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
            <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
              {item.description}
            </div>
          </div>
        )}

        {/* Requirement-specific: Rationale */}
        {item.rationale && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Rationale</label>
            <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
              {item.rationale}
            </div>
          </div>
        )}

        {/* Test Case-specific: Test Method */}
        {item.test_method && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Test Method</label>
            <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
              {item.test_method}
            </div>
          </div>
        )}

        {/* Reviewer/Tester assignments */}
        {item.reviewer_email && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Reviewer</label>
            <div className="mt-1 text-sm text-gray-900">{item.reviewer_email}</div>
          </div>
        )}
        {item.tester_email && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Tester</label>
            <div className="mt-1 text-sm text-gray-900">{item.tester_email}</div>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <label className="font-medium">Created</label>
              <div>{new Date(item.created_at).toLocaleString()}</div>
            </div>
            <div>
              <label className="font-medium">Updated</label>
              <div>{new Date(item.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
