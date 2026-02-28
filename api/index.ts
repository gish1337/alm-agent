import { IncomingMessage, ServerResponse } from 'http';
import { loadConfig } from '../src/config';
import { WebBot } from '../src/bot/web';
import { SAPProtocol } from '../src/agent-protocol';
import { SolanaAgent } from '../src/solana/agent';
import { buildSystemPrompt } from '../src/ai/processor';

// Кэш для переиспользования между serverless-вызовами (warm instance)
let appHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;
let initPromise: Promise<void> | null = null;

async function initApp(): Promise<void> {
    const config = loadConfig();

    let sapProtocol: SAPProtocol | undefined;
    if (config.sap?.enabled && config.solana?.enabled) {
        const solanaAgent = new SolanaAgent({
            rpcUrl: config.solana.rpcUrl || 'https://api.mainnet-beta.solana.com',
            network: config.solana.network || 'mainnet'
        });

        sapProtocol = new SAPProtocol(
            config.solana.rpcUrl || 'https://api.mainnet-beta.solana.com',
            solanaAgent
        );

        await sapProtocol.initialize({
            agentName: config.sap.agentName,
            agentDescription: config.sap.agentDescription,
            agentVersion: config.sap.agentVersion
        });
    }

    const webBot = new WebBot({
        port: 3000,
        processorConfig: {
            modelConfig: config.ai,
            systemPrompt: buildSystemPrompt(),
            sapProtocol
        }
    });

    appHandler = webBot.getApp();
}

// Vercel serverless handler
export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (!initPromise) {
        initPromise = initApp().catch((err) => {
            console.error('Init error:', err);
            initPromise = null;
        });
    }
    await initPromise;

    if (!appHandler) {
        (res as any).statusCode = 500;
        res.end('Server initialization failed');
        return;
    }

    appHandler(req, res);
}
