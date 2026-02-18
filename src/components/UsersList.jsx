import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChatStore } from '../store/chatStore'
import { authAPI } from '../services/authService'
import AuraAvatar from './ui/AuraAvatar'

const getUserId = (user) => String(user?.id || user?._id || '')
const getUserName = (user) => user?.username || user?.name || 'Unknown User'

const UsersList = memo(() => {
  const { users, selectedUser, setSelectedUser, setUsers, onlineUsers, conversations } = useChatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const hoverSwitchTimeoutRef = useRef(null)

  const selectedUserId = getUserId(selectedUser)

  const clearHoverSwitchTimeout = useCallback(() => {
    if (hoverSwitchTimeoutRef.current) {
      clearTimeout(hoverSwitchTimeoutRef.current)
      hoverSwitchTimeoutRef.current = null
    }
  }, [])

  useEffect(() => clearHoverSwitchTimeout, [clearHoverSwitchTimeout])

  const isOnline = useCallback(
    (userId) => onlineUsers.has(userId) || onlineUsers.has(String(userId)),
    [onlineUsers]
  )

  const userById = useMemo(() => {
    const map = new Map()
    users.forEach((user) => {
      const userId = getUserId(user)
      if (userId) {
        map.set(userId, user)
      }
    })
    return map
  }, [users])

  const priorityMap = useMemo(() => {
    const map = new Map()
    let rank = 0

    const register = (chatIds) => {
      if (!chatIds || !Array.isArray(chatIds)) return
      chatIds.forEach((chatId) => {
        const normalizedId = String(chatId)
        if (!normalizedId || map.has(normalizedId)) return
        map.set(normalizedId, rank)
        rank += 1
      })
    }

    // Get user IDs from conversations for priority sorting
    const conversationUserIds = Object.keys(conversations || {})
    register(conversationUserIds)
    
    return map
  }, [conversations])

  const sortUsers = useCallback(
    (leftUser, rightUser) => {
      const leftId = getUserId(leftUser)
      const rightId = getUserId(rightUser)

      const leftRank = priorityMap.has(leftId) ? priorityMap.get(leftId) : Number.MAX_SAFE_INTEGER
      const rightRank = priorityMap.has(rightId) ? priorityMap.get(rightId) : Number.MAX_SAFE_INTEGER

      if (leftRank !== rightRank) return leftRank - rightRank

      const leftUnread = conversations[leftId]?.unread_count || 0
      const rightUnread = conversations[rightId]?.unread_count || 0
      if (leftUnread !== rightUnread) return rightUnread - leftUnread

      return getUserName(leftUser).localeCompare(getUserName(rightUser))
    },
    [conversations, priorityMap]
  )

  const sortedUsers = useMemo(() => {
    const allUsers = [...users].sort(sortUsers)

    return {
      online: allUsers.filter((user) => isOnline(getUserId(user))),
      offline: allUsers.filter((user) => !isOnline(getUserId(user))),
    }
  }, [users, sortUsers, isOnline])

  const quickSwitchUsers = useMemo(() => {
    return []
  }, [])

  const handleSearch = async (query) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const data = await authAPI.searchUsers(query)
      setSearchResults(data.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUser = useCallback((user) => {
    const userId = getUserId(user)
    if (!userId) return

    // Add user to users list if not already present
    const userExists = users.some(u => getUserId(u) === userId)
    
    if (!userExists) {
      // Add new user to the list
      setUsers([...users, user])
    }

    if (selectedUserId !== userId) {
      setSelectedUser(user)
    }
    setSearchQuery('')
    setSearchResults([])
    clearHoverSwitchTimeout()
  }, [clearHoverSwitchTimeout, selectedUserId, users, setUsers, setSelectedUser])

  const queueHoverSwitch = useCallback((user) => {
    const userId = getUserId(user)
    if (!userId || userId === selectedUserId) return

    clearHoverSwitchTimeout()
    hoverSwitchTimeoutRef.current = setTimeout(() => {
      handleSelectUser(user)
    }, 450)
  }, [clearHoverSwitchTimeout, handleSelectUser, selectedUserId])

  const spacingClass = useMemo(() => 'gap-3', [])

  const renderUser = (user) => {
    const userId = getUserId(user)
    const isUserOnline = isOnline(userId)
    const isSelected = selectedUserId === userId
    const unreadCount = conversations[userId]?.unread_count || 0
    const isPredicted = false

    return (
      <button
        key={userId}
        onClick={() => handleSelectUser(user)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative group ux-touch-target ${
          isSelected
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-sm'
            : 'bg-white/50 hover:bg-white/80 border border-transparent hover:border-gray-200/60 hover:shadow-sm'
        }`}
        onMouseEnter={() => queueHoverSwitch(user)}
        onMouseLeave={clearHoverSwitchTimeout}
      >
        <div className="relative flex-shrink-0">
          <AuraAvatar
            userId={userId}
            avatarUrl={user.avatarUrl}
            name={getUserName(user)}
            size="md"
            online={isUserOnline}
          />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-md ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-800 text-sm truncate">
              {getUserName(user)}
            </span>
            {isUserOnline && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </div>
          {!isUserOnline ? (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" opacity="0.3"/>
              </svg>
              Offline
            </div>
          ) : null}
        </div>
        {!unreadCount && (
          <svg
            className={`w-4 h-4 transition-opacity ${
              isSelected ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className={`h-full flex flex-col ${spacingClass}`}>
      {/* Search Box */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 placeholder-gray-400 text-sm transition-all ux-touch-target"
          />
        </div>
      </div>

      {/* Hover Quick Switch */}
      {!searchQuery && quickSwitchUsers.length > 0 && (
        <div className="rounded-xl border border-indigo-100/80 bg-indigo-50/60 px-3 py-2">
          <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Quick Switch
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickSwitchUsers.map((user) => {
              const userId = getUserId(user)
              return (
                <button
                  key={userId}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={() => queueHoverSwitch(user)}
                  onMouseLeave={clearHoverSwitchTimeout}
                  className="px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-indigo-100 text-xs text-gray-700 transition-all ux-touch-target"
                >
                  {getUserName(user)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery.trim().length >= 2 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200/60">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Search Results
            </h3>
          </div>
          <div className="p-2 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
                <div className="text-sm">Searching...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map(user => (
                  <button
                    key={getUserId(user)}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50/80 transition-all group ux-touch-target"
                  >
                    <AuraAvatar
                      userId={getUserId(user)}
                      avatarUrl={user.avatarUrl}
                      name={getUserName(user)}
                      size="sm"
                      online={isOnline(getUserId(user))}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {getUserName(user)}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="text-sm font-medium">No users found</div>
                <div className="text-xs mt-1">Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Notice - only show when no search */}
      {!searchQuery && users.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Start Your First Conversation</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Search for users above to begin chatting. Your conversations are private and secure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Conversations - only show when not searching */}
      {!searchQuery && users.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {/* Online Users */}
          {sortedUsers.online.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Online
                </h3>
                <span className="text-xs text-gray-400 font-semibold">
                  {sortedUsers.online.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {sortedUsers.online.map(renderUser)}
              </div>
            </div>
          )}

          {/* Offline Users */}
          {sortedUsers.offline.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-300"></div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Recent
                </h3>
                <span className="text-xs text-gray-400 font-semibold">
                  {sortedUsers.offline.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {sortedUsers.offline.map(renderUser)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

UsersList.displayName = 'UsersList'

export default UsersList
