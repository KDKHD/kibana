import React, { useCallback, useEffect } from "react";
import { createContext, useContext, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { getConnectionDetails } from "./client";
import { useAssistantContext } from "..";

type VoiceAssistant = {

}

const VoiceAssistantContext = createContext<null | ReturnType<typeof VoiceAssistant>>(null);


export const useVoiceAssistantContext = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error("useVoiceAssistantContext must be inside of a VoiceAssistantContext.Provider.");
  }
  return context;
};

export const VoiceAssistantContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const value = VoiceAssistant();

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

const VoiceAssistant = () => {
  const { http } = useAssistantContext();
  const [room] = useState(new Room());


  const onConnectClicked = useCallback(async () => {
    const connectionDetailsData = await getConnectionDetails({
      http,
    });
    await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  }, [room])

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  return {
    onConnectClicked,
  }
}


function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}