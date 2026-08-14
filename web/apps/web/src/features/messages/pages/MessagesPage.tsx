import React, { useState } from "react";
import {
  LayoutDashboard,
  Network,
  MessageSquare,
  Compass,
  Film,
  Settings,
  User,
  Plus,
  LogOut,
  Search,
  Phone,
  Video,
  Info,
  Send,
  Image,
  Mic,
  Smile,
  Music,
  X,
  CheckCheck,
  Edit,
  Heart,
} from "lucide-react";

interface MessagesPageProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToReels?: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToReels,
  onNavigateToProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"messages" | "requests">(
    "messages",
  );
  const [activeChatId, setActiveChatId] = useState<string>("chat-1");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Note Modals State
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [myNote, setMyNote] = useState("Coding late night...");

  // Mock Conversations List
  const conversations = [
    {
      id: "chat-1",
      name: "1STevi",
      username: "ythstevino",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      lastMessage:
        "Kenek real project let, wedik nek akeh error bug. Fluids e rodok keri...",
      timeAgo: "17m ago",
      unread: true,
      isOnline: true,
    },
    {
      id: "chat-2",
      name: "we dont like 4$401",
      username: "group_cyber",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      lastMessage: "4+ new messages",
      timeAgo: "17m ago",
      unread: true,
      isOnline: false,
    },
    {
      id: "chat-3",
      name: "ricky, Yuan, IkbarXD",
      username: "dev_team",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      lastMessage: "4+ new messages",
      timeAgo: "10h ago",
      unread: false,
      isOnline: true,
    },
    {
      id: "chat-4",
      name: "Hima X Pro",
      username: "hima_pro",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
      lastMessage: "HAHAHA",
      timeAgo: "2d ago",
      unread: true,
      isOnline: false,
    },
    {
      id: "chat-5",
      name: "Bilooot",
      username: "bilooot",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      lastMessage: "Bilooot mengirim lampiran.",
      timeAgo: "5d ago",
      unread: false,
      isOnline: false,
    },
  ];

  // Notes Carousel Data (Catatan Status ala Instagram DM)
  const notesList = [
    {
      id: "note-me",
      name: "Catatan Anda",
      note: myNote,
      song: null,
      avatar:
        user.avatarUrl ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      isMe: true,
    },
    {
      id: "note-1",
      name: "1STevi",
      note: "Lost for Words",
      song: "Pink Floyd",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isMe: false,
    },
    {
      id: "note-2",
      name: "odien",
      note: "Oh Well",
      song: "Elephant Kind",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      isMe: false,
    },
    {
      id: "note-3",
      name: "Nuruddin",
      note: "Cyberpunk Vibe",
      song: "Futuristic Beat",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      isMe: false,
    },
  ];

  // Active Chat Messages
  const [chatMessages, setChatMessages] = useState<
    Record<
      string,
      Array<{ id: string; sender: "me" | "them"; text: string; time: string }>
    >
  >({
    "chat-1": [
      {
        id: "m1",
        sender: "them",
        text: "Kenek real project let, wedi kenek akeh error/bug let",
        time: "21:15",
      },
      {
        id: "m2",
        sender: "them",
        text: "Fluids e rodok keri keri sek aku nggarap e",
        time: "21:15",
      },
      {
        id: "m3",
        sender: "them",
        text: "Aku ae karo nggarap nggone PKKMB gak nutut let",
        time: "21:16",
      },
      { id: "m4", sender: "them", text: "Kewohan mbagine aku", time: "21:16" },
      { id: "m5", sender: "them", text: "DC", time: "21:16" },
      { id: "m6", sender: "me", text: "Ayo", time: "21:17" },
    ],
  });

  const activeChat =
    conversations.find((c) => c.id === activeChatId) || conversations[0];
  const activeMessages = chatMessages[activeChatId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "me" as const,
      text: messageInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    setMessageInput("");
  };

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body">
      {/* Modal 1: Create Note Modal ("Catatan Baru") */}
      {isCreateNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl animate-float">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-base font-bold text-white">
                Catatan Baru (Note Status)
              </h3>
              <button
                onClick={() => setIsCreateNoteOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsCreateNoteOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Bagikan Catatan / Musik
                </label>
                <textarea
                  value={myNote}
                  onChange={(e) => setMyNote(e.target.value)}
                  placeholder="Bagikan pemikiran dengan pengikut..."
                  maxLength={60}
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-xs text-white outline-none focus:border-[#00f0ff] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateNoteOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 btn-neon-gradient text-xs uppercase font-bold"
                >
                  Bagikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Note Reply Modal (Klik Catatan Teman) */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-xs glass-panel-glow rounded-3xl p-6 border border-white/10 relative text-center space-y-4 shadow-2xl animate-float">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative inline-block mt-2">
              {selectedNote.song && (
                <div className="mb-3 p-2 rounded-xl bg-white/10 border border-[#00f0ff]/40 text-[11px] text-[#00f0ff] font-semibold flex items-center gap-1.5 justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                  <Music className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {selectedNote.note} - {selectedNote.song}
                  </span>
                </div>
              )}
              <img
                src={selectedNote.avatar}
                alt={selectedNote.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00f0ff] mx-auto shadow-lg"
              />
            </div>

            <h4 className="text-sm font-bold text-white">
              {selectedNote.name}
            </h4>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 px-3">
              <input
                type="text"
                placeholder="Kirim pesan..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder-gray-500"
              />
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 text-[#00f0ff]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (20% Widescreen Column)                */}
      {/* ================================================================= */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-white/5 bg-[#080a0f] p-6 shrink-0 select-none">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#080a0f] rounded-[10px] flex items-center justify-center font-extrabold text-white text-sm">
                F
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00f0ff] to-[#a855f7]">
                FLUIDS
              </h1>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToNetwork}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Network className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Network</span>
            </button>

            {/* ACTIVE ITEM: MESSAGES */}
            <a
              href="#messages"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#00f0ff]" />
                <span>Messages</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#9d00ff] shadow-[0_0_8px_#9d00ff]" />
            </a>

            <button
              type="button"
              onClick={onNavigateToExplore}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Compass className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Explore</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToReels}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Film className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Reels</span>
            </button>

            <a
              href="#settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>

            <button
              type="button"
              onClick={onNavigateToProfile}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <User className="w-5 h-5 text-gray-400 group-hover:text-[#00f0ff] transition-colors" />
              <span>Profile</span>
            </button>
          </nav>

          <button
            type="button"
            className="w-full py-3.5 btn-neon-gradient flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </button>
        </div>

        <div className="space-y-1 border-t border-white/5 pt-4 mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/15 text-xs font-semibold transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* 2. CONVERSATIONS & NOTES PANEL (Lebar 35% - Kolom Kiri Chat)      */}
      {/* ================================================================= */}
      <section className="w-full md:w-[350px] lg:w-[380px] h-screen border-r border-white/5 bg-[#080a0f] flex flex-col shrink-0">
        {/* Header User Title Bar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white tracking-wide">
              {user.username || "achmadzacky"}
            </h2>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari chat..."
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00f0ff]"
            />
          </div>
        </div>

        {/* NOTES CAROUSEL BAR (Baris Catatan Status ala Instagram DM) */}
        <div className="p-3 border-b border-white/5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-4">
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
                  <div className="mb-1.5 max-w-[84px] px-2 py-0.5 rounded-xl bg-white/10 border border-[#00f0ff]/30 backdrop-blur-md text-[9px] text-white truncate text-center shadow-[0_0_8px_rgba(0,240,255,0.2)] group-hover:scale-105 transition-transform">
                    {n.song ? `🎵 ${n.note}` : n.note}
                  </div>

                  {/* Avatar Circle Container (Fixed Pixel Size so it never stretches) */}
                  <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#9d00ff] via-[#00f0ff] to-[#9d00ff] shadow-[0_0_12px_rgba(157,0,255,0.3)] group-hover:scale-105 transition-transform aspect-square shrink-0">
                    <img
                      src={n.avatar}
                      alt={n.name}
                      className="w-full h-full rounded-full object-cover border-2 border-[#080a0f] aspect-square shrink-0"
                    />
                    {n.isMe && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#00f0ff] text-black flex items-center justify-center text-[10px] font-extrabold shadow-md border border-black">
                        +
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-gray-300 font-medium truncate max-w-[70px] pt-1">
                  {n.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat List Tabs (Pesan / Permintaan) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 text-xs font-bold">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={
                activeTab === "messages"
                  ? "text-white border-b-2 border-[#00f0ff] pb-1"
                  : "text-gray-500"
              }
            >
              Pesan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={
                activeTab === "requests"
                  ? "text-white border-b-2 border-[#00f0ff] pb-1"
                  : "text-gray-500"
              }
            >
              Permintaan (2)
            </button>
          </div>
        </div>

        {/* Conversations List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {conversations.map((c) => {
            const isActive = c.id === activeChatId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                  isActive
                    ? "bg-white/10 border-l-2 border-[#00f0ff]"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  />
                  {c.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#080a0f]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-bold text-white truncate">
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {c.timeAgo}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${c.unread ? "text-white font-semibold" : "text-gray-400"}`}
                  >
                    {c.lastMessage}
                  </p>
                </div>

                {c.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. ACTIVE CHAT WINDOW (Lebar 65% - Jendela Obrolan Utama)         */}
      {/* ================================================================= */}
      <section className="flex-1 h-screen flex flex-col justify-between bg-[#07090e] relative">
        {/* Active Chat Header */}
        <div className="p-4 border-b border-white/5 bg-[#080a0f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={activeChat.avatar}
              alt={activeChat.name}
              className="w-10 h-10 rounded-xl object-cover border border-[#00f0ff]"
            />
            <div>
              <h3 className="text-sm font-bold text-white">
                {activeChat.name}
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                {activeChat.isOnline ? "Active Cyber Node" : "Offline"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <button
              type="button"
              className="hover:text-[#00f0ff] transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="hover:text-[#9d00ff] transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="hover:text-white transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="text-center text-[10px] text-gray-500 font-mono my-2">
            Encrypted Session Established • Sel 21:15
          </div>

          {activeMessages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    isMe
                      ? "btn-neon-gradient text-black rounded-br-none shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      : "bg-[#0d1017] border border-white/10 text-white rounded-bl-none shadow-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? "text-black/70" : "text-gray-400"}`}
                  >
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-white/5 bg-[#080a0f] flex items-center gap-3 shrink-0"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <button
              type="button"
              className="p-2 hover:text-[#00f0ff] transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 hover:text-[#00f0ff] transition-colors"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 hover:text-[#00f0ff] transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Kirim pesan..."
            className="flex-1 bg-[#0d1017] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00f0ff]"
          />

          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2.5 btn-neon-gradient rounded-xl text-black cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagesPage;
