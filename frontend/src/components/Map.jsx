import  { useEffect, useState } from "react";
import L from "leaflet"; 
import { io } from "socket.io-client";
import 'leaflet/dist/leaflet.css'; 
import { BACKEND_URL } from "../utils";

const Map = () => {
    const [socket] = useState(io(`${BACKEND_URL}`));

    useEffect(() => {
      socket.on("connect", () => {
        console.log("Connected to socket server with id:", socket.id);
      });
    
      return () => {
        socket.off("connect");
      };
    }, [socket]);  const [markers, setMarkers] = useState({}); // State to store marker references

  useEffect(() => {
    // Initialize map only once
    const map = L.map("map", {
      center: [0, 0],
      zoom: 16,
      scrollWheelZoom: true,
    });

    // Add tile layer to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Riderzz",
    }).addTo(map);

    // Socket event listener for receiving location data
    socket.on("receive-location", (data) => {
      const { id, latitude, longitude } = data;
      console.log("Received Location:", latitude, longitude); // Log values for debugging

      // Check if the latitude and longitude are valid
      if (latitude && longitude) {
        // Update marker for the user
        setMarkers((prevMarkers) => {
          const newMarkers = { ...prevMarkers };
          
          if (newMarkers[id]) {
            // Update the existing marker position
            newMarkers[id].setLatLng([latitude, longitude]);
          } else {
            // Create new marker if not already exist
            newMarkers[id] = L.marker([latitude, longitude]).addTo(map);
          }

          return newMarkers;
        });

        // Optionally, center the map on the new location
        map.setView([latitude, longitude], 16);
      }
    });

    socket.on("user-disconnected", (id) => {
      setMarkers((prevMarkers) => {
        const newMarkers = { ...prevMarkers };
        if (newMarkers[id]) {
          map.removeLayer(newMarkers[id]);
          delete newMarkers[id];
        }
        return newMarkers;
      });
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
    
          // Emit the location to the server
          socket.emit("send-location", { latitude, longitude });
          console.log("Location sent:", latitude, longitude);
        });
      }
    
    // Cleanup on component unmount
    return () => {
      socket.off("receive-location");
      socket.off("user-disconnected");
      map.remove(); // Remove the map instance when component unmounts
    };
  }, [socket]); // Run this effect only once on mount and socket connection

  return (
    <div
      id="map"
      style={{ height: "100vh", width: "100%" }} // Full height map container
    />
  );
};

export default Map;
