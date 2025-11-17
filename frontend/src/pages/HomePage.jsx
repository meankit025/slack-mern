import { UserButton } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useStreamChat } from '../hooks/useStreamChat';
import PageLoader from '../components/PageLoader';
import CreateChannelModal from '../components/CreateChannelModal';
import CustomChannelPreview from '../components/CustomChannelPreview';
import UsersList from '../components/UsersList';
import '../styles/stream-chat-theme.css';
import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from 'stream-chat-react';
import { HashIcon, PlusIcon, UsersIcon } from 'lucide-react';
import CustomChannelHeader from '../components/CustomChannelHeader';

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, isLoading, error } = useStreamChat();
  console.log('Stream Chat Client:', chatClient);

  // set the active channels from url params
  useEffect(() => {
    if (chatClient) {
      const channelId = searchParams.get('channel');
      console.log(`channel name afterb refresh`, channelId);

      if (channelId) {
        const channel = chatClient.channel('messaging', channelId);
        setActiveChannel(channel);
      }
    }
  }, [searchParams, chatClient]);

  if (error) return <p>Something went wrong...</p>;

  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient}>
        <div className="chat-container">
          {/* LEFT SIDEBAR */}
          <div className="str-chat__channel-list">
            <div className="team-channel-list">
              {/* HEADER */}
              <div className="team-channel-list__header gap-4">
                <div className="brand-container">
                  <img src="/logo.png" alt="Logo" className="brand-logo" />
                  <span className="brand-name">Slack</span>
                </div>
                <div className="user-button-wrapper">
                  <UserButton />
                </div>
              </div>

              {/* CHANNELS LIST */}
              <div className="team-channel-list__content">
                <div className="create-channel-section">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="create-channel-btn"
                  >
                    <PlusIcon className="size-4" />
                    <span>Create Channel</span>
                  </button>
                </div>

                {/* CHANNEL LIST */}
                <ChannelList
                  filters={{ members: { $in: [chatClient?.user?.id] } }}
                  options={{ state: true, watch: true }}
                  Preview={({ channel }) => (
                    <CustomChannelPreview
                      channel={channel}
                      activeChannel={activeChannel}
                      setActiveChannel={(channel) =>
                        setSearchParams({ channel: channel.id })
                      }
                    />
                  )}
                  List={({ children, loading, error }) => (
                    <div className="channel-sections">
                      <div className="section-header">
                        <div className="section-title">
                          <HashIcon className="size-4" />
                          <span>Channels</span>
                        </div>
                      </div>

                      {/* todos: add better components here instead of just a simple text  */}
                      {loading && (
                        <div className="loading-message">
                          Loading channels...
                        </div>
                      )}
                      {error && (
                        <div className="error-message">
                          Error loading channels
                        </div>
                      )}

                      <div className="channels-list">{children}</div>

                      <div className="section-header direct-messages">
                        <div className="section-title">
                          <UsersIcon className="size-4" />
                          <span>Direct Messages</span>
                        </div>
                      </div>
                      <UsersList activeChannel={activeChannel} />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER */}
          <div className="chat-main">
            <Channel channel={activeChannel}>
              <Window>
                {/* CUSTOM CHANNEL HEADER WHICH HAVING USERTS, VIDEO ICONS,PIN ETC */}
                <CustomChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>

              <Thread />
            </Channel>
          </div>
        </div>

        {isCreateModalOpen && (
          <CreateChannelModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </Chat>
    </div>
  );
};

export default HomePage;
