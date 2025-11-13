import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { getStreamToken } from '../lib/api';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// this hook is used to onnect the current user to STream Chat Api
// so that user can see ach others message , send messages to each other get real-time updates etc.
// t also handles the disconnect when user leaves the page

export const useStreamChat = () => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState(null);

  // fetch stream token using tanstack query
  const {
    data: tokenData,
    isLoading: tokenLoading,
    isError: tokenError,
  } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!user?.id, // this will take the user object and convert to boolean
  });

  // init stream chat client
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !user) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        console.log(`client inside initchat`, client);
        console.log(
          `another checking for connectUser attach`,
          client.connectUser()
        );
        await client.connectUser({
          id: user.id,
          name: user.fullName,
          image: user.imageUrl,
        });

        setChatClient(client);
      } catch (error) {
        console.log(`error connecting to stream`, error);
        Sentry.captureException(error, {
          tags: { component: 'useStreamChat' },
          extra: {
            context: 'stream_chat_disconnect',
            userId: user?.id,
            streamApiKey: STREAM_API_KEY ? 'Present' : 'missing',
          },
        });
      }
    };
    initChat();

    // cleanup function
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [chatClient, tokenData?.token, user]);

  return { chatClient, isLoading: tokenLoading, isError: tokenError };
};
