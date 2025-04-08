import './voice_assistant.scss';

import { EuiButton } from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { Room, RoomEvent, RpcError, RpcInvocationData } from 'livekit-client';
import { useAssistantContext } from '..';
import { getConnectionDetails } from './client';
import {
    BarVisualizer,
    RoomAudioRenderer,
    RoomContext,
    useVoiceAssistant,
} from "@livekit/components-react";
import TranscriptionView from './TranscriptionView';


export const VoiceAssistant = () => {
    const { http, navigateToApp } = useAssistantContext();
    const [room] = useState(new Room());

    useEffect(() => {
        room.registerRpcMethod('navigateToPage', async (data: RpcInvocationData) => {
            try {
                let params = JSON.parse(data.payload);
                await navigateToApp(params.appId, {
                    path: params.path,
                })
                return `Navigated user to app ${params.appId} with path ${params.path}`;
            } catch (error) {
                throw new RpcError(1, `Could not navigate user to app`);
            }
        })

        return () => {
            room.unregisterRpcMethod('navigateToPage');
        }
    }, [])

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

    return (
        <RoomContext.Provider value={room}>
            <SimpleVoiceAssistant onConnectClicked={onConnectClicked} />
        </RoomContext.Provider>
    )
}

export const SimpleVoiceAssistant = ({
    onConnectClicked
}: {
    onConnectClicked: () => void
}) => {
    const { state: agentState } = useVoiceAssistant();

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000,
            }}>
            {agentState === "disconnected" && <EuiButton onClick={onConnectClicked}>Start a conversation</EuiButton>}
            <RoomAudioRenderer />
            {agentState !== "disconnected" && <>
                <TranscriptionView />
            </>}
        </div>
    )
}




function onDeviceFailure(error: Error) {
    console.error(error);
    alert(
        "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
    );
}


function ControlBar() {
    const { state: agentState, audioTrack } = useVoiceAssistant();

    return (
        <BarVisualizer
            state={agentState}
            barCount={5}
            trackRef={audioTrack}
            options={{ minHeight: 12 }}
        />
    );
}