import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Edge, Node, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from './AgentNode';
import type { AgentNodeType } from './AgentNode';
import NodeEditor from './NodeEditor';
import type { Agent } from '../../types';
import './OrgCanvas.css';

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

// Hardcoded safe layout for prototype (7 agents)
const LAYOUT = {
  'ceo': { x: 400, y: 50 },
  'cto': { x: 100, y: 250 },
  'cfo': { x: 400, y: 250 },
  'cmo': { x: 700, y: 250 },
  'coo': { x: 1000, y: 250 },
  'webResearcher': { x: 100, y: 450 },
  'emailOutreach': { x: 700, y: 450 },
};

interface OrgCanvasProps {
  initialAgents: Agent[];
  onAgentsChange: (agents: Agent[]) => void;
}

export default function OrgCanvas({ initialAgents, onAgentsChange }: OrgCanvasProps) {
  // Local state for editing before final commit
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Sync back to parent when local agents change
  useEffect(() => {
    onAgentsChange(agents);
  }, [agents, onAgentsChange]);

  const onUpdatePermission = useCallback((agentId: string, permId: string, approved: boolean) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            permissions: a.permissions.map((p) =>
              p.id === permId ? { ...p, approved } : p
            ),
          };
        }
        return a;
      })
    );
  }, []);

  // Compute React Flow nodes
  const initialNodes: AgentNodeType[] = useMemo(() => {
    return agents.map((agent) => {
      // safely get defined coordinates or fallback
      const pos = LAYOUT[agent.role === 'worker' ? (agent.id === 'agent-web-researcher' ? 'webResearcher' : 'emailOutreach') : agent.role] || { x: 0, y: 0 };
      
      return {
        id: agent.id,
        type: 'agent',
        position: pos,
        data: { agent },
      };
    });
  }, [agents]);

  // Compute React Flow edges based on reportsTo
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    agents.forEach((agent) => {
      if (agent.reportsTo) {
        edges.push({
          id: `e-${agent.reportsTo}-${agent.id}`,
          source: agent.reportsTo,
          target: agent.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--color-primary)', strokeWidth: 2, opacity: 0.6 },
        });
      }
    });
    return edges;
  }, [agents]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes whenever agents change (e.g. from permission updates)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const updatedAgent = agents.find((a) => a.id === n.id);
        if (updatedAgent) {
          return { ...n, data: { ...n.data, agent: updatedAgent } };
        }
        return n;
      })
    );
  }, [agents, setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedAgentId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedAgentId(null);
  }, []);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) || null,
    [agents, selectedAgentId]
  );

  return (
    <div className="org-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="flow-theme"
      >
        <Background gap={24} size={2} color="var(--color-surface-border)" />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor="var(--color-primary)" 
          maskColor="rgba(10, 10, 20, 0.7)"
          style={{ background: 'var(--color-surface)' }} 
        />
      </ReactFlow>

      {selectedAgent && (
        <NodeEditor
          agent={selectedAgent}
          onClose={() => setSelectedAgentId(null)}
          onUpdatePermission={onUpdatePermission}
        />
      )}
    </div>
  );
}
