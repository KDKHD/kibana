import './voice_assistant.scss';

import { EuiButton, EuiCode, EuiText, EuiTourStep } from '@elastic/eui';
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
import { getButtonDescriptions } from './page_interactions';


export const VoiceAssistant = () => {
    const { http, navigateToApp } = useAssistantContext();
    const [room] = useState(new Room());
    const [tourOpen, setTourOpen] = useState(false);

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

        room.registerRpcMethod('endConversation', async (data: RpcInvocationData) => {
            try {
                room.disconnect();
                return `User disconnected from the room`;
            } catch (error) {
                throw new RpcError(1, `Could not navigate user to app`);
            }
        })

        room.registerRpcMethod('clickButton', async (data: RpcInvocationData) => {
            try {
                let params = JSON.parse(data.payload);
                (document.querySelector(params.selector as string) as HTMLDivElement)?.click()
                return `Clicked button`;
            } catch (error) {
                throw new RpcError(1, `Could not navigate user to app`);
            }
        })

        room.registerRpcMethod('getButtons', async (data: RpcInvocationData) => {
            try {
                const message = `Current page: ${window.location.pathname}\n Buttons:\n${getButtonDescriptions().map(b=>`|${b.description}:${b.selector}|`).join()}`
                console.log(message)
                return message;
            } catch (error) {
                throw new RpcError(1, `Could not navigate user to app`);
            }
        })

        return () => {
            room.unregisterRpcMethod('navigateToPage');
            room.unregisterRpcMethod('endConversation');
            room.unregisterRpcMethod('clickButton');
            room.unregisterRpcMethod('getButtons');
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
