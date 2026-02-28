import { SAPRegistry } from './registry';
import { AgentProfile, AgentCapability } from './types';

/**
 * Agent Profile Manager
 * Handles the local agent's profile and capabilities
 */
export class AgentProfileManager {
  private registry: SAPRegistry;
  private profile: AgentProfile | null = null;

  constructor(registry: SAPRegistry) {
    this.registry = registry;
  }

  /**
   * Initialize the local agent profile
   */
  async initialize(config: {
    name: string;
    description: string;
    version: string;
  }): Promise<string> {
    // Define agent capabilities based on current implementation
    const capabilities: AgentCapability[] = [
      {
        name: 'Solana Balance Check',
        description: 'Check SOL and SPL token balances',
        version: '1.0.0',
        enabled: true
      },
      {
        name: 'Token Price Query',
        description: 'Get real-time token prices via Jupiter',
        version: '1.0.0',
        enabled: true
      },
      {
        name: 'Transaction Analysis',
        description: 'Analyze and format recent transactions',
        version: '1.0.0',
        enabled: true
      },
      {
        name: 'Network Status',
        description: 'Check Solana network health',
        version: '1.0.0',
        enabled: true
      },
      {
        name: 'Natural Language Processing',
        description: 'Understand and process user queries',
        version: '1.0.0',
        enabled: true
      },
      {
        name: 'Multi-Provider AI',
        description: 'Support for Ollama, OpenAI, and local models',
        version: '1.0.0',
        enabled: true
      }
    ];

    const agentId = await this.registry.registerAgent({
      name: config.name,
      description: config.description,
      version: config.version,
      publicKey: process.env.AGENT_WALLET_PUBLIC?.trim(),
      capabilities,
      reputation: 0,
      tasksCompleted: 0,
      successRate: 100
    });

    this.profile = this.registry.getAgent(agentId)!;
    
    return agentId;
  }

  /**
   * Get the current profile
   */
  getProfile(): AgentProfile | null {
    return this.profile;
  }

  /**
   * Add a new capability
   */
  addCapability(capability: AgentCapability): void {
    if (!this.profile) return;
    
    this.profile.capabilities.push(capability);
      console.log(`Added capability: ${capability.name}`);
  }

  /**
   * Enable/disable a capability
   */
  toggleCapability(capabilityName: string, enabled: boolean): void {
    if (!this.profile) return;
    
    const capability = this.profile.capabilities.find(
      c => c.name === capabilityName
    );
    
    if (capability) {
      capability.enabled = enabled;
      console.log(`${enabled ? '[on]' : '[off]'} ${capabilityName}: ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get enabled capabilities
   */
  getEnabledCapabilities(): AgentCapability[] {
    if (!this.profile) return [];
    return this.profile.capabilities.filter(c => c.enabled);
  }

  /**
   * Update agent description
   */
  updateDescription(description: string): void {
    if (!this.profile) return;
    this.profile.description = description;
  }

  /**
   * Set pricing for agent services
   */
  setPricing(pricePerTask: number, currency: 'SOL' | 'USDC'): void {
    if (!this.profile) return;
    
    this.profile.pricing = {
      pricePerTask,
      currency
    };
    
      console.log(`Pricing set: ${pricePerTask} ${currency} per task`);
  }

  /**
   * Get profile summary for display
   */
  getSummary(): string {
    if (!this.profile) return 'Agent not initialized';
    
    const capabilities = this.getEnabledCapabilities();
    
    return `
**Agent Profile**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${this.profile.name}
Description: ${this.profile.description}
ID: ${this.profile.id}
Version: ${this.profile.version}
Wallet: ${this.profile.publicKey || 'Not configured'}

**Capabilities (${capabilities.length}):**
${capabilities.map(c => `  • ${c.name} (v${c.version})`).join('\n')}

**Statistics:**
  Reputation: ${this.profile.reputation}/100
  Tasks Completed: ${this.profile.tasksCompleted}
  Success Rate: ${this.profile.successRate.toFixed(1)}%

${this.profile.pricing ? `Pricing: ${this.profile.pricing.pricePerTask} ${this.profile.pricing.currency} per task` : ''}

Created: ${this.profile.createdAt.toLocaleString()}
Last Active: ${this.profile.lastActive.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * Export profile as JSON for OpenClaw integration
   */
  exportForOpenClaw(): any {
    if (!this.profile) return null;
    
    return {
      name: this.profile.name.toLowerCase().replace(/\s+/g, '-'),
      version: this.profile.version,
      description: this.profile.description,
      author: 'Solana Agent Protocol',
      capabilities: this.getEnabledCapabilities().map(c => c.name),
      config: {
        agentId: this.profile.id,
        solanaEnabled: true,
        reputation: this.profile.reputation
      }
    };
  }
}
