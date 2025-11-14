import { Item, RelationshipWithItem } from '../../types';
import { getItemTypeLabel, getRelationshipTypeLabel } from '../../utils/constants';

interface RelationshipGraphProps {
  currentItem: Item;
  outgoing: RelationshipWithItem[];
  incoming: RelationshipWithItem[];
  onItemClick?: (itemId: number) => void;
}

interface GraphNode {
  id: number;
  title: string;
  type: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface GraphEdge {
  from: GraphNode;
  to: GraphNode;
  label: string;
  isOutgoing: boolean;
}

export function RelationshipGraph({ currentItem, outgoing, incoming, onItemClick }: RelationshipGraphProps) {
  // Limit to 5 relationships max for clean visualization
  const displayOutgoing = outgoing.slice(0, 5);
  const displayIncoming = incoming.slice(0, 5);

  // SVG dimensions
  const width = 600;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  // Node styling
  const centerNode: GraphNode = {
    id: currentItem.id,
    title: currentItem.title,
    type: getItemTypeLabel(currentItem.type),
    x: centerX,
    y: centerY,
    radius: 40,
    color: '#3FB95A' // Fresh green for center node
  };

  // Calculate positions for outgoing relationships (ABOVE center - items this points to)
  // Semantically: "derives-from" B means B is above (parent/source)
  const outgoingNodes: GraphNode[] = displayOutgoing.map((rel, index) => {
    if (!rel.to_item) return null;
    
    const total = displayOutgoing.length;
    const spacing = Math.min(120, (width - 100) / Math.max(total, 1));
    const startX = centerX - ((total - 1) * spacing) / 2;
    
    return {
      id: rel.to_item.id,
      title: rel.to_item.title,
      type: getItemTypeLabel(rel.to_item.type),
      x: startX + (index * spacing),
      y: 100,
      radius: 30,
      color: '#60A5FA' // Blue for outgoing (items this points to)
    };
  }).filter((n): n is GraphNode => n !== null);

  // Calculate positions for incoming relationships (BELOW center - items that point to this)
  const incomingNodes: GraphNode[] = displayIncoming.map((rel, index) => {
    if (!rel.from_item) return null;
    
    const total = displayIncoming.length;
    const spacing = Math.min(120, (width - 100) / Math.max(total, 1));
    const startX = centerX - ((total - 1) * spacing) / 2;
    
    return {
      id: rel.from_item.id,
      title: rel.from_item.title,
      type: getItemTypeLabel(rel.from_item.type),
      x: startX + (index * spacing),
      y: height - 100,
      radius: 30,
      color: '#34D399' // Green for incoming (items that point to this)
    };
  }).filter((n): n is GraphNode => n !== null);

  // Create edges
  const edges: GraphEdge[] = [
    ...displayOutgoing.map((rel, index) => ({
      from: outgoingNodes[index],
      to: centerNode,
      label: getRelationshipTypeLabel(rel.type),
      isOutgoing: true
    })),
    ...displayIncoming.map((rel, index) => ({
      from: centerNode,
      to: incomingNodes[index],
      label: getRelationshipTypeLabel(rel.type),
      isOutgoing: false
    }))
  ].filter(e => e.from && e.to);

  if (outgoing.length === 0 && incoming.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No relationships to visualize</p>
          <p className="text-xs text-gray-500 mt-1">Add relationships in the section above</p>
        </div>
      </div>
    );
  }

  // Helper to calculate arrow points
  const getArrowPoints = (from: GraphNode, to: GraphNode) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    
    // Arrow at target node edge
    const arrowX = to.x - (to.radius + 5) * Math.cos(angle);
    const arrowY = to.y - (to.radius + 5) * Math.sin(angle);
    
    // Arrow points
    const arrowSize = 10;
    const angle1 = angle + Math.PI - Math.PI / 6;
    const angle2 = angle + Math.PI + Math.PI / 6;
    
    return {
      tip: { x: arrowX, y: arrowY },
      p1: { x: arrowX + arrowSize * Math.cos(angle1), y: arrowY + arrowSize * Math.sin(angle1) },
      p2: { x: arrowX + arrowSize * Math.cos(angle2), y: arrowY + arrowSize * Math.sin(angle2) }
    };
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <svg width="100%" height="500" viewBox={`0 0 ${width} ${height}`} className="bg-gray-50">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
          >
            <polygon points="0,0 10,5 0,10" fill="#6B7280" />
          </marker>
        </defs>

        {/* Draw edges */}
        {edges.map((edge, index) => {
          const arrow = getArrowPoints(edge.from, edge.to);
          const midX = (edge.from.x + edge.to.x) / 2;
          const midY = (edge.from.y + edge.to.y) / 2;
          
          return (
            <g key={`edge-${index}`}>
              {/* Line from center of source to edge of target */}
              <line
                x1={edge.from.x}
                y1={edge.from.y}
                x2={arrow.tip.x}
                y2={arrow.tip.y}
                stroke="#6B7280"
                strokeWidth="2"
                opacity="0.6"
              />
              
              {/* Arrow */}
              <polygon
                points={`${arrow.tip.x},${arrow.tip.y} ${arrow.p1.x},${arrow.p1.y} ${arrow.p2.x},${arrow.p2.y}`}
                fill="#6B7280"
                opacity="0.6"
              />
              
              {/* Label */}
              <text
                x={midX}
                y={midY - 5}
                textAnchor="middle"
                fontSize="11"
                fill="#374151"
                fontWeight="500"
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Draw outgoing nodes (above center - items this points to) */}
        {outgoingNodes.map((node) => (
          <g 
            key={`node-${node.id}`}
            className={onItemClick ? "cursor-pointer" : ""}
            onClick={() => onItemClick && onItemClick(node.id)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color}
              stroke="white"
              strokeWidth="3"
              opacity="0.9"
              className={onItemClick ? "hover:opacity-100" : ""}
            />
            <text
              x={node.x}
              y={node.y - 5}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontWeight="600"
            >
              #{node.id}
            </text>
            <text
              x={node.x}
              y={node.y + 7}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              opacity="0.9"
            >
              {node.type}
            </text>
            {/* Title below node since it's above center */}
            <text
              x={node.x}
              y={node.y + node.radius + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
            >
              {node.title.substring(0, 15)}{node.title.length > 15 ? '...' : ''}
            </text>
          </g>
        ))}

        {/* Draw incoming nodes (below center - items pointing to this) */}
        {incomingNodes.map((node) => (
          <g 
            key={`node-${node.id}`}
            className={onItemClick ? "cursor-pointer" : ""}
            onClick={() => onItemClick && onItemClick(node.id)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color}
              stroke="white"
              strokeWidth="3"
              opacity="0.9"
              className={onItemClick ? "hover:opacity-100" : ""}
            />
            <text
              x={node.x}
              y={node.y - 5}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontWeight="600"
            >
              #{node.id}
            </text>
            <text
              x={node.x}
              y={node.y + 7}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              opacity="0.9"
            >
              {node.type}
            </text>
            {/* Title above node since it's below center */}
            <text
              x={node.x}
              y={node.y - node.radius - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
            >
              {node.title.substring(0, 15)}{node.title.length > 15 ? '...' : ''}
            </text>
          </g>
        ))}

        {/* Draw center node last (on top) */}
        <g className="cursor-default">
          <circle
            cx={centerNode.x}
            cy={centerNode.y}
            r={centerNode.radius}
            fill={centerNode.color}
            stroke="white"
            strokeWidth="4"
          />
          <text
            x={centerNode.x}
            y={centerNode.y - 8}
            textAnchor="middle"
            fontSize="13"
            fill="white"
            fontWeight="700"
          >
            #{centerNode.id}
          </text>
          <text
            x={centerNode.x}
            y={centerNode.y + 6}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            opacity="0.95"
          >
            {centerNode.type}
          </text>
          <text
            x={centerNode.x}
            y={centerNode.y + 18}
            textAnchor="middle"
            fontSize="9"
            fill="white"
            opacity="0.9"
            fontWeight="600"
          >
            (Current)
          </text>
        </g>

        {/* Legend */}
        <g transform={`translate(10, ${height - 80})`}>
          <text x="0" y="0" fontSize="11" fill="#6B7280" fontWeight="600">Legend:</text>
          <circle cx="10" cy="15" r="6" fill="#3FB95A" opacity="0.9" />
          <text x="20" y="19" fontSize="10" fill="#374151">Current Item</text>
          <circle cx="10" cy="32" r="6" fill="#60A5FA" opacity="0.9" />
          <text x="20" y="36" fontSize="10" fill="#374151">Outgoing (above - items this points to)</text>
          <circle cx="10" cy="49" r="6" fill="#34D399" opacity="0.9" />
          <text x="20" y="53" fontSize="10" fill="#374151">Incoming (below - items pointing to this)</text>
        </g>
      </svg>

      {(outgoing.length > 5 || incoming.length > 5) && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-800">
          <strong>Note:</strong> Showing first 5 relationships. Total: {outgoing.length} outgoing, {incoming.length} incoming.
        </div>
      )}
    </div>
  );
}
