import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import mqtt from 'mqtt';

export const DataContext = createContext();
const socket = io('http://localhost:5000');

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

  const fetchData = async () => {
    try {
      const devRes = await fetch('http://localhost:5000/api/devices');
      if (devRes.ok) setDevices(await devRes.json());

      const evRes = await fetch('http://localhost:5000/api/events');
      if (evRes.ok) setEvents(await evRes.json());

      const qRes = await fetch('http://localhost:5000/api/quantum');
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

    // MQTT Subscriptions (Direct WSS)
    const indClient = mqtt.connect(INDUSTRY_WSS, { username: 'ESP32_01', password: 'Lohitaksh123' });
    const traClient = mqtt.connect(TRANSPORT_WSS, { username: 'ESP32_02', password: 'Lohitaksh123' });

    indClient.on('connect', () => indClient.subscribe('industry/package'));
    traClient.on('connect', () => traClient.subscribe('transport/data'));

    indClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        setIndustryData(data);
      } catch(e) {}
    });

    traClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        setTransportData(data);
        setHistory((prev) => {
          const newLabels = [...prev.labels, new Date().toLocaleTimeString()].slice(-12);
          const newTemp = [...prev.temp, data.temperature].slice(-12);
          const newHum = [...prev.hum, data.humidity].slice(-12);
          return { temp: newTemp, hum: newHum, labels: newLabels };
        });
      } catch(e) {}
    });

    return () => {
      socket.off('data_updated');
      socket.off('log');
      indClient.end();
      traClient.end();
    };
  }, []);

  const authenticate = async (deviceId) => {
    try {
      await fetch('http://localhost:5000/api/authenticate', {
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
      industryData, transportData, history, quantumSecurity
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
