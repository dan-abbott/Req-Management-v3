import { Item } from '../../types';
import { TYPE_COLORS } from '../../utils/constants';

interface DeleteConfirmationProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ item, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Delete Item?
          </h2>

          <div className="mb-6 space-y-3">
            <div>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${TYPE_COLORS[item.type]}`}>
                {item.type}
              </span>
              <span className="ml-2 text-sm text-gray-500">#{item.id}</span>
            </div>
            
            <div>
              <div className="font-medium text-gray-900">{item.title}</div>
              {item.description && (
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. The item will be permanently deleted.
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
