import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaMapMarkerAlt } from "react-icons/fa";
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { useEffect } from 'react';

const customIconHtml = ReactDOMServer.renderToString(<FaMapMarkerAlt color="red" size="40" />);

const MapLeaflet = ({ latitude, longitude, zoom, height, width, handleMarkerDrag }: {
  latitude: string,
  longitude: string,
  zoom: number,
  height: string,
  width: string
  handleMarkerDrag: (event: any) => void
}) => {
  const customIcon = L.divIcon({
    html: customIconHtml,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const UpdateMapView = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
  };

  return (
    <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={zoom} style={{ height: height, width: width }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <UpdateMapView lat={parseFloat(latitude)} lng={parseFloat(longitude)} />

      <Marker
        icon={customIcon}
        position={[parseFloat(latitude), parseFloat(longitude)]}
        draggable={true}
        eventHandlers={{
          dragend: handleMarkerDrag,
        }}
      >
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapLeaflet;
