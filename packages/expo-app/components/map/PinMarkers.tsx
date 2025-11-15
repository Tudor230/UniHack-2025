import React from 'react';
import { Marker } from 'react-native-maps';
import { Pin } from '@/state/pins';

type PinMarkersProps = {
  wantToGo: Pin[];
  history: Pin[];
  bookable: Pin[];
};

export function PinMarkers({ wantToGo, history, bookable }: PinMarkersProps) {
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

      {history.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={pin.coords}
          title={pin.title}
          description={pin.notes}
          pinColor="blue"
        />
      ))}

      {bookable.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={pin.coords}
          title={pin.title}
          description={pin.notes}
          pinColor="green"
        />
      ))}
    </>
  );
}