import { useStateProvider } from "@/context/StateContext";
import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";

function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter()

  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContaextMenuVisible, setisContaextMenuVisible] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX - 20, y: e.pageY + 20});
    setisContaextMenuVisible(true);
  };
  const contextMenuOptions = [
    {
      name: "Logout",
      callback: async () => {
        setisContaextMenuVisible(false);
        router.push('/logout')
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6">
        <BsFillChatLeftTextFill
          onClick={handleAllContactsPage}
          title="New chat"
          className="text-panel-header-icon cursor-pointer text-xl"
        />
        <>
          <BsThreeDotsVertical
            title="Menu"
            className="text-panel-header-icon cursor-pointer text-xl"
            onClick={(e) => showContextMenu(e)}
            id="context-opener"
          />
          {isContaextMenuVisible && (
            <ContextMenu
              options={contextMenuOptions}
              cordinates={contextMenuCordinates}
              contextMenu={isContaextMenuVisible}
              setContextMenu={setisContaextMenuVisible}
            />
          )}{" "}
        </>
      </div>
    </div>
  );
}

export default ChatListHeader;
