export const host = import.meta.env.VITE_SERVER_URL;
export const registerRoute = `${host}/api/auth/register`;
export const loginRoute = `${host}/api/auth/login`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const addMessageRoute = `${host}/api/messages/addmsg`;
export const getMessageRoute = `${host}/api/messages/getmsg`;
export const getContactsRoute = `${host}/api/messages/get-contacts`; // + /:from
export const searchUsersRoute = `${host}/api/auth/search`;
export const deleteMessageRoute = `${host}/api/messages/deletemsg`;
export const uploadRoute = `${host}/api/upload`;

// Channel Routes
export const createChannelRoute = `${host}/api/channels/create`;
export const getChannelsRoute = `${host}/api/channels/get`; // /:userId appended in call
export const joinChannelRoute = `${host}/api/channels/join`;
export const leaveChannelRoute = `${host}/api/channels/leave`;
export const deleteChannelRoute = `${host}/api/channels/delete`;
export const addMemberRoute = `${host}/api/channels/add-member`;

export const searchChannelsRoute = `${host}/api/channels/search`;
export const requestJoinChannelRoute = `${host}/api/channels/request-join`;
export const getChannelDetailsRoute = `${host}/api/channels/details`;
export const handleJoinRequestRoute = `${host}/api/channels/handle-request`;

export const deleteUserRoute = `${host}/api/auth/delete`; // + /:id
