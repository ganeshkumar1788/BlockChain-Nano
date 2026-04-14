import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const DataContext = createContext();
const socket = io(`http://${window.location.hostname}:5000`);

const INDUSTRY_WSS = 'wss://8aecf11e1e704f09b031844bccbf8b96.s1.eu.hivemq.cloud:8884/mqtt';
const TRANSPORT_WSS = 'wss://8828643160384c63a286fc7e2e434d3e.s1.eu.hivemq.cloud:8884/mqtt';

export const DataProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState('ESP32_01');
  
  // Supply Chain States
  const [industryData, setIndustryData] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [history, setHistory] = useState({ temp: [], hum: [], labels: [] });
  const [quantumSecurity, setQuantumSecurity] = useState(null);

  // Pipeline Metrics
  const [lastHash, setLastHash] = useState('0x6CE7...9A2F');
  const [globalThreatLevel, setGlobalThreatLevel] = useState('Low');
  const [globalTrustScore, setGlobalTrustScore] = useState(0);

  const updatePipelineMonitor = (data) => {
    if (data.hash) setLastHash(data.hash);
    if (data.trustScore) {
        setGlobalTrustScore(data.trustScore);
        if (data.trustScore < 50) setGlobalThreatLevel('Critical');
        else if (data.trustScore < 80) setGlobalThreatLevel('Elevated');
        else setGlobalThreatLevel('Low');
    }
    if (data.failed) setGlobalThreatLevel('Critical');
  };

  const fetchData = async () => {
    try {
      const devRes = await fetch(`http://${window.location.hostname}:5000/api/devices`);
      if (devRes.ok) setDevices(await devRes.json());

      const evRes = await fetch(`http://${window.location.hostname}:5000/api/events`);
      if (evRes.ok) setEvents(await evRes.json());

      const qRes = await fetch(`http://${window.location.hostname}:5000/api/quantum`);
      if (qRes.ok) setQuantumSecurity(await qRes.json());
    } catch (e) {
      console.error("Fetch Data Failed:", e);
    }
  };

  useEffect(() => {
    fetchData();

    // Socket.io for backend events
    socket.on('data_updated', () => fetchData());
    socket.on('device_focus', ({ deviceId }) => setActiveDeviceId(deviceId));
    socket.on('log', (log) => setLogs((prev) => [...prev, log]));

    // Listen to telemetry pushed from backend (via backend's MQTT cluster)
    socket.on('industry_update', (data) => {
        setIndustryData(data);
    });

    socket.on('transport_update', (data) => {
        setTransportData(data);
        setHistory((prev) => {
            const newLabels = [...prev.labels, new Date().toLocaleTimeString()].slice(-12);
            const newTemp = [...prev.temp, data.temperature].slice(-12);
            const newHum = [...prev.hum, data.humidity].slice(-12);
            return { temp: newTemp, hum: newHum, labels: newLabels };
        });
    });

    return () => {
      socket.off('data_updated');
      socket.off('log');
      socket.off('industry_update');
      socket.off('transport_update');
    };
  }, []); // End of main setup effect

  // Reset pipeline score on device change
  useEffect(() => {
    setGlobalTrustScore(0);
    setGlobalThreatLevel('Low');
  }, [activeDeviceId]);

  const authenticate = async (deviceId) => {
    try {
      await fetch(`http://${window.location.hostname}:5000/api/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), signature: 'simulated' }) // matching new schema
      });
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <DataContext.Provider value={{ 
      devices, events, logs, authenticate, activeDeviceId, setActiveDeviceId,
      industryData, transportData, history, quantumSecurity,
      globalThreatLevel, lastHash, globalTrustScore
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
