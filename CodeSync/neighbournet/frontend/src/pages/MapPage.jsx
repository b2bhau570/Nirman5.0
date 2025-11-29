import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { connectSocket, disconnectSocket } from '../lib/socket';


// Fix for default marker icon in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapPage() {
    const [position, setPosition] = useState(null);
    const [requests, setRequests] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Connect socket
        connectSocket((newRequest) => {
            setRequests((prev) => [...prev, newRequest]);
            setToast(`New Request: ${newRequest.type}`);
            setTimeout(() => setToast(null), 3000);
        });

        return () => {
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    fetchRequests(latitude, longitude);
                },
                (err) => {
                    console.error("Error getting location:", err);
                    // Fallback location (e.g., London) if permission denied
                    setPosition([51.505, -0.09]);
                    fetchRequests(51.505, -0.09);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            setPosition([51.505, -0.09]);
        }
    }, []);

    const fetchRequests = async (lat, lng) => {
        try {
            const response = await axios.get('/api/requests', {
                params: {
                    lat,
                    lng,
                    radiusKm: 5
                }
            });
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    if (!position) {
        return <div>Loading location...</div>;
    }

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User's current location marker */}
                <Marker position={position}>
                    <Popup>
                        You are here
                    </Popup>
                </Marker>

                {requests.map((req) => (
                    <Marker
                        key={req._id}
                        position={[req.location.coordinates[1], req.location.coordinates[0]]}
                    >
                        <Popup>
                            <div>
                                <h3>{req.type}</h3>
                                <p>{req.description}</p>
                                {req.contact && <p><strong>Contact:</strong> {req.contact}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 2000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {toast}
                </div>
            )}
        </div>
    );
}

export default MapPage;
