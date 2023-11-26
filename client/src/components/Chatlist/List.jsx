import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, onlineUsers, filteredContacts }, dispatch] =
    useStateProvider();

  const getContact = async () => {
    try {
      console.log(userInfo)
      const {
        data: { users, onlineUsers },
      } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
      dispatch({ type: reducerCases.SET_USER_CONTACT, userContacts: users });
      dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo?.id) getContact();
  }, [userInfo]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts?.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
          ))
        : userContacts?.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
          ))}
    </div>
  );
}

export default List;
