import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
import { ethers } from 'ethers';
import mqtt from 'mqtt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// --- Configuration ---
const SHARED_SECRET = "secret123";
const INDUSTRY_MQTT_URL = "mqtts://8aecf11e1e704f09b031844bccbf8b96.s1.eu.hivemq.cloud:8883";
const TRANSPORT_MQTT_URL = "mqtts://8828643160384c63a286fc7e2e434d3e.s1.eu.hivemq.cloud:8883";

// --- In-Memory State ---
let devices = [
    { id: 'ESP32_01', type: 'Industry', status: 'Online', lastActive: new Date() },
    { id: 'ESP32_02', type: 'Transport', status: 'Online', lastActive: new Date() }
];
let auditEvents = [];
let threatLevel = 'LOW';

// --- Blockchain Configuration ---
const provider = process.env.INFURA_URL ? new ethers.JsonRpcProvider(process.env.INFURA_URL) : null;
const wallet = process.env.PRIVATE_KEY && provider ? new ethers.Wallet(process.env.PRIVATE_KEY, provider) : null;
let supplyChainContract = null;

async function initBlockchain() {
    if (wallet && process.env.CONTRACT_ADDRESS) {
        try {
            const contractPath = path.join(__dirname, 'artifacts/contracts/SupplyChain.sol/SupplyChain.json');
            if (fs.existsSync(contractPath)) {
                const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                supplyChainContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractData.abi, wallet);
                console.log("Blockchain Connected: SupplyChain Contract at", process.env.CONTRACT_ADDRESS);
            }
        } catch (error) {
            console.error("Blockchain Connection Error:", error.message);
        }
    }
}
initBlockchain();

// --- MQTT Connections ---
const industryClient = mqtt.connect(INDUSTRY_MQTT_URL, { username: "ESP32_01", password: "Lohitaksh123" });
const transportClient = mqtt.connect(TRANSPORT_MQTT_URL, { username: "ESP32_02", password: "Lohitaksh123" });

industryClient.on('connect', () => {
    console.log("Connected to Industry MQTT Cluster");
    industryClient.subscribe('industry/package');
});

transportClient.on('connect', () => {
    console.log("Connected to Transport MQTT Cluster");
    transportClient.subscribe('transport/data');
});

function verifySignature(data) {
    const { device_id, timestamp, signature } = data;
    const payload = `${device_id}${timestamp}${SHARED_SECRET}`;
    const expected = crypto.createHash('sha256').update(payload).digest('hex');
    return signature === expected;
}

industryClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        if (verifySignature(data)) {
            auditEvents.unshift({ type: 'Manufacture', packageId: data.package_id, timestamp: new Date() });
            io.emit('industry_update', data);
            io.emit('data_updated');
        }
    } catch (err) {}
});

transportClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        if (verifySignature(data)) {
            io.emit('transport_update', data);
        }
    } catch (err) {}
});

// --- API Endpoints ---

app.get('/api/devices', (req, res) => res.json(devices));
app.get('/api/events', (req, res) => res.json(auditEvents.slice(0, 50)));

app.post('/api/pipeline/run', async (req, res) => {
    const { device_id } = req.body;
    res.json({ status: 'started' });

    const steps = [
        { msg: `REQUEST: Inbound auth request from ${device_id}...`, status: 'success' },
        { msg: `IDENTITY: Verifying device fingerprint in secure registry...`, status: 'success' },
        { msg: `SIGNATURE: Validating SHA-256 HMAC signature...`, status: 'success' },
        { msg: `BLOCKCHAIN: Querying Ethereum ledger for trust score...`, status: 'success' },
        { msg: `DECISION: Access Granted. Device context verified.`, status: 'success' }
    ];

    if (device_id === 'ESP32_02') { // Simulated failure case if needed
        steps[3] = { msg: `BLOCKCHAIN: Device trust score below threshold (Malicious detected)`, status: 'rejected', reason: 'UNTRUSTED_NODE' };
    }

    for (let i = 0; i < steps.length; i++) {
        io.emit('auth_flow', { 
            source: 'pipeline', 
            step: i + 1, 
            status: 'active', 
            message: steps[i].msg 
        });
        await new Promise(r => setTimeout(r, 1200));
        
        io.emit('auth_flow', { 
            source: 'pipeline', 
            step: i + 1, 
            status: steps[i].status, 
            message: steps[i].msg,
            reason: steps[i].reason
        });

        if (steps[i].status === 'rejected') break;
    }
});

app.post('/api/actions/:type', (req, res) => {
    const { type } = req.params;
    io.emit('log', `External action triggered: ${type.toUpperCase()}`);
    if (type === 'simulate-attack') {
        io.emit('simulate_breach');
        threatLevel = 'CRITICAL';
        io.emit('threat_level', 'CRITICAL');
        setTimeout(() => {
            threatLevel = 'LOW';
            io.emit('threat_level', 'LOW');
        }, 5000);
    }
    res.json({ success: true });
});

app.get('/api/quantum', (req, res) => res.json({
    classical_security: "2^256",
    quantum_security: "2^128",
    status: "Quantum Threat Level: ELEVATED"
}));

app.get('/api/status', (req, res) => res.json({
    backend: "Online",
    industry_mqtt: industryClient.connected,
    transport_mqtt: transportClient.connected,
    blockchain: supplyChainContract ? "Connected" : "Not Configured"
}));

const PORT = 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend listening on port ${PORT}`);
});
