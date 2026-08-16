import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { 
  Search, Phone, Video, Info, Send, 
  Image as ImageIcon, Mic, Smile, Music, X, CheckCheck, Edit, Heart, ChevronDown,
  ArrowLeft, BellOff, Trash2, LogOut as LeaveIcon, MoreHorizontal,
  UserPlus, Users, Check, MessageSquare
} from 'lucide-react';

interface MessagesPageProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToReels: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToReels,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Group Details Editing State
  const [groupName, setGroupName] = useState('r i c k y, Yuan, IkbarXD, dan 4 lainnya');
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<string[]>([]);

  // Note Modals State
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteSong, setNewNoteSong] = useState('');
  const [myNote, setMyNote] = useState('Coding late night...');

  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [noteReplyInput, setNoteReplyInput] = useState('');

  // Friends Database for Group Selection
  const friendsList = [
    { id: 'f1', name: 'ricky', username: 'arickyh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 'f2', name: 'Yuan', username: 'its_yuanz', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    { id: 'f3', name: 'IkbarXD', username: 'ikbar_xd', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 'f4', name: 'Ade Suwarendra', username: 'ade_suwarendra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'f5', name: '1STevi', username: 'ythstevino', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  ];

  // Group Members List
  const [groupMembers, setGroupMembers] = useState([
    { id: 'm-me', name: user.fullName || 'jeky', username: user.username || 'ghts_uu', avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', isAdmin: true },
    { id: 'm-1', name: 'r i c k y', username: 'arickyh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isAdmin: false },
    { id: 'm-2', name: 'Yuan', username: 'its_yuanz', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isAdmin: false },
    { id: 'm-3', name: 'IkbarXD', username: 'ikbar_xd', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isAdmin: false },
    { id: 'm-4', name: 'Ade Suwarendra', username: 'ade_suwarendra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isAdmin: false },
  ]);

  // Conversations List
  const [conversations, setConversations] = useState([
    {
      id: 'chat-group',
      name: groupName,
      username: '7 members',
      isGroup: true,
      groupAvatars: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      ],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      lastMessage: 'Alfred Victor Putra membagikan postingan • 4 aktif hari ini',
      timeAgo: '4 aktif hari ini',
      unread: true,
      isOnline: true,
    },
    {
      id: 'chat-1',
      name: '1STevi',
      username: 'ythstevino',
      isGroup: false,
      groupAvatars: [],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      lastMessage: 'Kenek real project let, wedik nek akeh error bug. Fluids e rodok keri...',
      timeAgo: '17m ago',
      unread: false,
      isOnline: true,
    },
    {
      id: 'chat-2',
      name: 'we dont like 4$401',
      username: 'group_cyber',
      isGroup: true,
      groupAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      ],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      lastMessage: 'thisilham_: Toak Mani - 2 jam',
      timeAgo: '2h ago',
      unread: true,
      isOnline: false,
    },
    {
      id: 'chat-4',
      name: 'Hima X Pro',
      username: 'hima_pro',
      isGroup: false,
      groupAvatars: [],
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      lastMessage: 'HAHAHA • 3 hari',
      timeAgo: '3d ago',
      unread: false,
      isOnline: true,
    },
  ]);

  // Notes Bar Carousel List
  const notesList = [
    {
      id: 'note-me',
      name: 'Catatan Anda',
      note: myNote,
      song: null,
      avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isMe: true,
    },
    {
      id: 'note-1',
      name: 'Egiiii',
      note: 'Wes cepak kabeh butuh minggu',
      song: 'Egi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      isMe: false,
    },
    {
      id: 'note-2',
      name: '1STevi',
      note: 'Lost for Words',
      song: 'Pink Floyd',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isMe: false,
    },
    {
      id: 'note-3',
      name: 'odien',
      note: 'Oh Well',
      song: 'Elephant Kind',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isMe: false,
    },
  ];

  // Active Messages State Map
  const [messagesMap, setMessagesMap] = useState<Record<string, { id: string; sender: 'me' | 'other'; senderName?: string; isPostCard?: boolean; postAuthor?: string; postImage?: string; postTitle?: string; postCaption?: string; text?: string; time: string; readBy?: string }[]>>({
    'chat-group': [
      {
        id: 'gm-1',
        sender: 'other',
        senderName: 'Alfred Victor Putra',
        isPostCard: true,
        postAuthor: 'balikpapances_',
        postImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800',
        postTitle: 'Pengakuan Gay Kota Bandung — PENGAKUAN LSL',
        postCaption: 'balikpapances_ Sebuah potongan berita lama kembali beredar di media sosial dan menjadi perhatian warganet. Dalam pemberitaan tersebut...',
        time: '11:04',
        readBy: 'Dilihat oleh Ade Suwarendra Nur Eka Ramadhan',
      },
    ],
    'chat-1': [
      { id: 'm1', sender: 'other', text: 'Kenek real project let, wedik nek akeh error/bug let', time: '21:15' },
      { id: 'm2', sender: 'other', text: 'Fluids e rodok keri keri sek aku nggarap e', time: '21:15' },
      { id: 'm3', sender: 'other', text: 'Aku ae karo nggarap nggone PKKMB gak nutut let', time: '21:16' },
      { id: 'm4', sender: 'other', text: 'Kewohan mbagine aku', time: '21:16' },
      { id: 'm5', sender: 'other', text: 'DC', time: '21:16' },
      { id: 'm6', sender: 'me', text: 'Ayo', time: '21:17' },
    ],
  });

  const activeChat = conversations.find((c) => c.id === activeChatId);
  const activeMessages = activeChatId ? (messagesMap[activeChatId] || []) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'me' as const,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage],
    }));

    setMessageInput('');
  };

  const handleShareNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      setMyNote(newNoteText.trim());
    }
    setIsCreateNoteOpen(false);
    setNewNoteText('');
    setNewNoteSong('');
  };

  const handleReplyNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteReplyInput.trim() && selectedNote) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'me' as const,
        text: `Membalas catatan @${selectedNote.name}: ${noteReplyInput.trim()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessagesMap((prev) => ({
        ...prev,
        ['chat-1']: [...(prev['chat-1'] || []), newMessage],
      }));
      setSelectedNote(null);
      setNoteReplyInput('');
    }
  };

  const handleSaveGroupName = () => {
    if (groupName.trim()) {
      setConversations((prev) =>
        prev.map((c) => (c.id === 'chat-group' ? { ...c, name: groupName.trim() } : c))
      );
    }
    setIsEditingGroupName(false);
  };

  const handleCreateNewGroup = () => {
    if (selectedFriendsForGroup.length === 0) return;

    const selectedFriends = friendsList.filter((f) => selectedFriendsForGroup.includes(f.id));
    const newGroupName = selectedFriends.map((f) => f.name).join(', ') + '...';

    const newGroupChat = {
      id: `chat-group-${Date.now()}`,
      name: newGroupName,
      username: `${selectedFriends.length + 1} members`,
      isGroup: true,
      groupAvatars: selectedFriends.slice(0, 2).map((f) => f.avatar),
      avatar: selectedFriends[0].avatar,
      lastMessage: 'Grup baru telah dibuat',
      timeAgo: 'Baru saja',
      unread: true,
      isOnline: true,
    };

    setConversations([newGroupChat, ...conversations]);
    setActiveChatId(newGroupChat.id);
    setIsCreateGroupOpen(false);
    setSelectedFriendsForGroup([]);
  };

  const toggleSelectFriend = (id: string) => {
    if (selectedFriendsForGroup.includes(id)) {
      setSelectedFriendsForGroup(selectedFriendsForGroup.filter((fId) => fId !== id));
    } else {
      setSelectedFriendsForGroup([...selectedFriendsForGroup, id]);
    }
  };

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body select-none">
      
      {/* ================================================================= */}
      {/* MODAL 1: CREATE GROUP CHAT ("Pesan Baru")                         */}
      {/* ================================================================= */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-default">
              <button type="button" onClick={() => setIsCreateGroupOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-semibold text-text-primary font-mono">Pesan baru</h3>
              <button
                type="button"
                disabled={selectedFriendsForGroup.length === 0}
                onClick={handleCreateNewGroup}
                className="px-3 py-1 rounded-sm bg-accent text-canvas font-semibold text-xs disabled:opacity-30 cursor-pointer transition-colors"
              >
                Obrolan
              </button>
            </div>

            {/* Recipients Selection Input */}
            <div className="p-3 border-b border-border-default flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-text-secondary">Kepada:</span>
              {selectedFriendsForGroup.map((fId) => {
                const friend = friendsList.find((f) => f.id === fId);
                return (
                  <span key={fId} className="px-2 py-0.5 rounded-sm bg-accent-muted text-accent border border-accent/40 text-xs flex items-center gap-1">
                    {friend?.name}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSelectFriend(fId)} />
                  </span>
                );
              })}
            </div>

            {/* Friends Selection Checkbox List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border-default p-2 scrollbar-none">
              {friendsList.map((friend) => {
                const isSelected = selectedFriendsForGroup.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    onClick={() => toggleSelectFriend(friend.id)}
                    className="p-2.5 flex items-center justify-between hover:bg-surface-raised rounded-sm cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-full object-cover border border-border-default aspect-square" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary">{friend.name}</h4>
                        <span className="text-[10px] text-text-secondary font-mono">@{friend.username}</span>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-sm border border-border-strong flex items-center justify-center ${
                      isSelected ? 'bg-accent border-accent text-canvas' : ''
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: ADD PEOPLE TO GROUP ("Tambahkan Anggota")                */}
      {/* ================================================================= */}
      {isAddPeopleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border-default rounded-lg overflow-hidden p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <h3 className="text-sm font-semibold text-text-primary font-mono">Tambahkan Anggota</h3>
              <button type="button" onClick={() => setIsAddPeopleOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
              {friendsList.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-2 hover:bg-surface-raised rounded-sm text-xs transition-colors">
                  <div className="flex items-center gap-2">
                    <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover border border-border-default aspect-square" />
                    <div>
                      <span className="font-semibold text-text-primary block">{f.name}</span>
                      <span className="text-[9px] text-text-secondary font-mono">@{f.username}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupMembers([...groupMembers, { id: f.id, name: f.name, username: f.username, avatar: f.avatar, isAdmin: false }]);
                      setIsAddPeopleOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-surface-raised border border-border-default hover:border-accent text-text-primary hover:text-accent font-mono text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: CREATE NOTE ("Catatan Baru")                             */}
      {/* ================================================================= */}
      {isCreateNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-default">
              <button type="button" onClick={() => setIsCreateNoteOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-semibold text-text-primary font-mono">Catatan baru</h3>
              <button
                type="button"
                onClick={handleShareNote}
                className="px-3.5 py-1.5 rounded-sm bg-accent text-canvas font-semibold text-xs hover:bg-accent-hover transition-colors cursor-pointer"
              >
                Bagikan
              </button>
            </div>

            <div className="p-8 flex flex-col items-center justify-center space-y-5 relative">
              <div className="relative">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Obsesi saat ini..."
                  maxLength={60}
                  autoFocus
                  className="w-56 bg-surface-raised border border-border-default rounded-sm px-3.5 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted text-center outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="w-24 h-24 rounded-full aspect-square p-0.5 border border-border-default">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user.fullName || 'You'}
                  className="w-full h-full rounded-full object-cover aspect-square"
                />
              </div>

              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center gap-2 bg-surface-raised border border-border-default rounded-sm px-3 py-2 text-xs text-text-secondary">
                  <Music className="w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={newNoteSong}
                    onChange={(e) => setNewNoteSong(e.target.value)}
                    placeholder="Tambahkan Musik (Opsional)..."
                    className="bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted w-full font-mono"
                  />
                </div>
              </div>

              <div className="pt-1 text-xs text-text-secondary flex items-center gap-1 cursor-pointer hover:text-text-primary font-mono">
                <span>Dibagikan dengan pengikut yang Anda ikuti balik</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: NOTE REPLY MODAL                                         */}
      {/* ================================================================= */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border-default rounded-lg overflow-hidden p-5 space-y-5 shadow-2xl relative">
            <button type="button" onClick={() => setSelectedNote(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            {selectedNote.song && (
              <div className="bg-surface-raised border border-border-default rounded-sm p-3 flex items-center gap-3 text-xs">
                <Music className="w-4 h-4 text-accent" />
                <div>
                  <h4 className="font-semibold text-text-primary font-mono">{selectedNote.note}</h4>
                  <span className="text-[10px] text-text-secondary font-mono">{selectedNote.song}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full aspect-square border border-border-default p-0.5">
                <img src={selectedNote.avatar} alt={selectedNote.name} className="w-full h-full rounded-full object-cover aspect-square" />
              </div>
              <h3 className="text-xs font-semibold text-text-primary font-mono">{selectedNote.name}</h3>
            </div>

            <form onSubmit={handleReplyNote} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={noteReplyInput}
                  onChange={(e) => setNoteReplyInput(e.target.value)}
                  placeholder="Kirim pesan..."
                  autoFocus
                  className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-3 pr-9 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                />
                <button type="submit" disabled={!noteReplyInput.trim()} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-accent disabled:opacity-30 cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (20% Widescreen Column)                */}
      {/* ================================================================= */}
      {/* Reusable Sidebar with activeView="messages" */}
      <Sidebar
        activeView="messages"
        user={user}
        unreadMessagesCount={conversations.filter((c) => c.unread).length}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToNetwork={onNavigateToNetwork}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToMessages={() => {}}
        onNavigateToReels={onNavigateToReels}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* ================================================================= */}
      {/* 2. CONVERSATIONS & NOTES PANEL */}
      <section className="w-full md:w-[350px] lg:w-[380px] h-screen border-r border-border-default bg-surface flex flex-col shrink-0">
        
        {/* Header Username & New Group Chat Edit Button */}
        <div className="p-4 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-primary tracking-wide font-mono">{user.username || 'developer'}</h2>
            <ChevronDown className="w-4 h-4 text-text-secondary cursor-pointer" />
          </div>
          <button
            type="button"
            onClick={() => setIsCreateGroupOpen(true)}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-sm hover:bg-surface-raised transition-colors cursor-pointer"
            title="Pesan baru / Obrolan Grup"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-border-default">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full bg-surface-raised border border-border-default rounded-sm py-1.5 pl-9 pr-4 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong font-mono"
            />
          </div>
        </div>

        {/* NOTES CAROUSEL BAR */}
        <div className="p-3 border-b border-border-default overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3">
            {notesList.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.isMe) {
                    setIsCreateNoteOpen(true);
                  } else {
                    setSelectedNote(n);
                  }
                }}
                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
              >
                {/* Note Bubble Above Avatar */}
                <div className="flex flex-col items-center">
                  <div className="mb-1 max-w-[88px] px-2 py-0.5 rounded-sm bg-surface-raised border border-border-default text-[10px] text-text-primary font-mono truncate text-center transition-colors group-hover:border-border-strong">
                    {n.song ? `🎵 ${n.note}` : n.note}
                  </div>

                  <div className="relative w-12 h-12 rounded-full p-0.5 border border-border-default group-hover:border-border-strong transition-colors aspect-square shrink-0">
                    <img
                      src={n.avatar}
                      alt={n.name}
                      className="w-full h-full rounded-full object-cover aspect-square"
                    />
                    {n.isMe && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-canvas flex items-center justify-center text-[10px] font-bold border border-surface">
                        +
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-text-secondary font-mono truncate max-w-[65px] pt-0.5">
                  {n.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat List Tabs (Pesan / Permintaan) */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default text-xs font-mono">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={activeTab === 'messages' ? 'text-text-primary border-b-2 border-accent pb-1 font-semibold' : 'text-text-secondary hover:text-text-primary pb-1'}
            >
              Pesan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={activeTab === 'requests' ? 'text-text-primary border-b-2 border-accent pb-1 font-semibold' : 'text-text-secondary hover:text-text-primary pb-1'}
            >
              Permintaan (2)
            </button>
          </div>
        </div>

        {/* Conversations List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border-default scrollbar-none">
          {conversations.map((c) => {
            const isActive = c.id === activeChatId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveChatId(c.id);
                  setIsInfoOpen(false);
                  // Mark as read
                  setConversations((prev) =>
                    prev.map((item) => (item.id === c.id ? { ...item, unread: false } : item))
                  );
                }}
                className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  isActive ? 'bg-surface-raised border-l-2 border-accent' : 'hover:bg-surface-raised/60'
                }`}
              >
                {/* Avatar Icon */}
                <div className="relative shrink-0 w-10 h-10">
                  {c.isGroup && c.groupAvatars.length >= 2 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={c.groupAvatars[0]}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover border border-surface absolute top-0 left-0 aspect-square"
                      />
                      <img
                        src={c.groupAvatars[1]}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover border border-surface absolute bottom-0 right-0 aspect-square"
                      />
                    </div>
                  ) : (
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover border border-border-default aspect-square"
                    />
                  )}

                  {c.isOnline && !c.isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-diff-add border border-surface" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-semibold text-text-primary truncate">{c.name}</h4>
                    <span className="text-[10px] text-text-secondary font-mono">{c.timeAgo}</span>
                  </div>
                  <p className={`text-xs truncate ${c.unread ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                    {c.lastMessage}
                  </p>
                </div>

                {c.unread && (
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. ACTIVE CHAT WINDOW (Jendela Obrolan Utama / Empty State)        */}
      {/* ================================================================= */}
      {!activeChat ? (
        <section className="flex-1 h-screen flex flex-col items-center justify-center bg-[#07090e] p-8 text-center select-none">
          <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <MessageSquare className="w-12 h-12 text-white stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Pesan Anda</h2>
          <p className="text-xs text-text-secondary max-w-sm mb-6">
            Kirim foto dan pesan pribadi ke teman atau grup.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateGroupOpen(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-sm text-canvas text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            Kirim Pesan
          </button>
        </section>
      ) : (
        <section className="flex-1 h-screen flex flex-col justify-between bg-canvas relative">
        
        {/* Active Chat Header */}
        <div className="p-4 border-b border-border-default bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Header Avatar */}
            {activeChat.isGroup && activeChat.groupAvatars.length >= 2 ? (
              <div className="relative w-10 h-10 shrink-0">
                <img
                  src={activeChat.groupAvatars[0]}
                  alt="avatar1"
                  className="w-7 h-7 rounded-full object-cover border border-border-default absolute top-0 left-0 aspect-square"
                />
                <img
                  src={activeChat.groupAvatars[1]}
                  alt="avatar2"
                  className="w-7 h-7 rounded-full object-cover border border-border-default absolute bottom-0 right-0 aspect-square"
                />
              </div>
            ) : (
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="w-10 h-10 rounded-full object-cover border border-border-default aspect-square"
              />
            )}

            <div>
              <h3 className="text-sm font-semibold text-text-primary">{activeChat.name}</h3>
              <span className="text-[11px] text-text-secondary font-mono">{activeChat.isOnline ? 'Active' : activeChat.timeAgo}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-text-secondary">
            <button
              type="button"
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="p-2 hover:text-text-primary hover:bg-surface-raised rounded-sm transition-colors cursor-pointer"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Chat Messages Stream + Optional Right Group Detail Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(messagesMap[activeChat.id] || []).map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Name in Group Chat */}
                  {activeChat.isGroup && !isMe && msg.senderName && (
                    <span className="text-[10px] text-text-secondary font-mono pb-1 pl-1">{msg.senderName}</span>
                  )}

                  {/* Bubble Container */}
                  {msg.isPostCard ? (
                    <div className="max-w-xs bg-surface border border-border-default rounded-md overflow-hidden space-y-2">
                      {/* Shared Post Header */}
                      <div className="p-3 flex items-center gap-2 border-b border-border-default">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt={msg.postAuthor} className="w-6 h-6 rounded-full object-cover aspect-square" />
                        <span className="text-xs font-semibold text-text-primary">{msg.postAuthor}</span>
                      </div>

                      {/* Shared Post Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img src={msg.postImage} alt={msg.postTitle} className="w-full h-full object-cover" />
                      </div>

                      {/* Shared Post Caption */}
                      <div className="p-3 space-y-1 bg-surface-raised">
                        <h4 className="text-xs font-semibold text-text-primary line-clamp-1">{msg.postTitle}</h4>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">{msg.postCaption}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-md px-3.5 py-2 rounded-md text-xs leading-relaxed space-y-1 ${
                        isMe
                          ? 'bg-surface-raised border border-border-strong text-text-primary rounded-br-none'
                          : 'bg-surface border border-border-default text-text-primary rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-text-secondary font-mono">
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-accent" />}
                      </div>
                    </div>
                  )}

                  {/* Read Receipt Status Text */}
                  {msg.readBy && (
                    <span className="text-[10px] text-text-muted font-mono pt-1">{msg.readBy}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Info Panel (Persis Instagram Direct / Group Chat Details) */}
          {isInfoOpen && (
            <div className="w-80 h-full border-l border-border-default bg-surface p-4 flex flex-col justify-between overflow-y-auto shrink-0">
              
              <div className="space-y-6">
                
                {/* Top Detail Title & Close Button */}
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Detail</h3>
                  <button type="button" onClick={() => setIsInfoOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Anggota List (Persis Instagram Detail Group) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-text-primary">Anggota ({groupMembers.length})</h4>
                    {activeChat.isGroup && (
                      <button
                        type="button"
                        onClick={() => setIsAddPeopleOpen(true)}
                        className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Tambah orang</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {groupMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-border-default aspect-square"
                          />
                          <div>
                            <span className="font-semibold text-text-primary block">{member.name}</span>
                            <span className="text-[10px] text-text-secondary font-mono">@{member.username}</span>
                          </div>
                        </div>

                        {member.isAdmin && (
                          <span className="text-[9px] px-2 py-0.5 rounded-sm bg-accent-muted text-accent font-mono font-semibold border border-accent/30">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media & Berkas yang dibagikan */}
                <div className="space-y-3 border-t border-border-default pt-4">
                  <h4 className="text-xs font-semibold text-text-primary">Media yang dibagikan</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200" alt="media1" className="w-full h-16 object-cover rounded-sm border border-border-default aspect-square" />
                    <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=200" alt="media2" className="w-full h-16 object-cover rounded-sm border border-border-default aspect-square" />
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200" alt="media3" className="w-full h-16 object-cover rounded-sm border border-border-default aspect-square" />
                  </div>
                </div>

              </div>

              {/* Danger Action Links */}
              <div className="space-y-3 border-t border-border-default pt-4 text-xs font-semibold">
                {activeChat.isGroup && (
                  <button type="button" className="w-full flex items-center gap-2 text-diff-remove hover:opacity-80 transition-opacity cursor-pointer">
                    <LeaveIcon className="w-4 h-4" />
                    <span>Keluar dari obrolan</span>
                  </button>
                )}
                <button type="button" className="w-full flex items-center gap-2 text-diff-remove hover:opacity-80 transition-opacity cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus obrolan</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-border-default bg-surface flex items-center gap-3 shrink-0"
        >
          {/* Pill Container */}
          <div className="flex-1 bg-surface-raised border border-border-default rounded-sm px-4 py-2 flex items-center gap-3">
            <button type="button" className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Kirim pesan..."
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none"
            />

            <button type="button" className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <Mic className="w-4 h-4" />
            </button>

            <button type="button" className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <ImageIcon className="w-4 h-4" />
            </button>

            <button type="button" className="text-diff-remove hover:opacity-80 transition-opacity cursor-pointer">
              <Heart className="w-4 h-4 fill-diff-remove" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2.5 bg-accent hover:bg-accent-hover text-canvas rounded-sm cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </section>
      )}
    </div>
  );
};

export default MessagesPage;
