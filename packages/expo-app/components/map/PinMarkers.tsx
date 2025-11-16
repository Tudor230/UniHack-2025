import React from 'react';
import { Marker } from 'react-native-maps';
import { Pin } from '@/state/pins';

type PinMarkersProps = {
  wantToGo: Pin[];
  events: Pin[];
};

export function PinMarkers({ wantToGo, events }: PinMarkersProps) {
  return (
    <>
      {wantToGo.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={pin.coords}
          title={pin.title}
          description={pin.notes}
          pinColor="tomato"
        />
      ))}

      {events.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={pin.coords}
          title={pin.title}
          description={pin.notes}
          pinColor="blue"
        />
      ))}

    </>
  );
}