import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
const  VoiceMessage =  dynamic(() => import ("./VoiceMessage"));

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo,  }] = useStateProvider();

  
  return (
    <div  className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0">
      </div>
      <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {messages.map((item, i) => (
              <div
                key={i}
                className={`flex ${
                  item?.senderId === currentChatUser?.id
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                {item.type === "text" && (
                  <div
                    className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end  max-w-[45%] ${
                      item?.senderId === currentChatUser?.id
                        ? "bg-incoming-background"
                        : "bg-outgoing-background"
                    }`}
                  >
                    <span className="break-all">{item?.message}</span>
                    <div className="flex gap-1 items-end">
                      <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                        {calculateTime(item?.createdAt)}
                      </span>
                      <span>
                        {item?.senderId === userInfo?.id && (
                          <MessageStatus messageStatus={item.messageStatus} />
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {item.type === "image" &&(
                  <ImageMessage message={item}/>
                )}
                {item.type === "audio" && (
                  <VoiceMessage  message={item} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
