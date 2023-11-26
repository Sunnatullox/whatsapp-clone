import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Image from "next/image";
import React from "react";
import { MdOutlineCall, MdOutlineCallEnd } from "react-icons/md";

function IncomingVideoCall() {
  const [{ incomingVideoCall, socket }, dispatch] = useStateProvider();

  const acceptCall = () => {
    const call = incomingVideoCall;
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: { ...incomingVideoCall, type: "in-coming" },
    });
    socket.current.emit("accept-incoming-call", {id:incomingVideoCall.id})
    dispatch({
      type: reducerCases.SET_INCOMING_VIDEO_CALL,
      incomingVideoCall: null,
    });
  };
  const rejectedCall = () => {
    dispatch({type:reducerCases.END_CALL})
    socket.current.emit("reject-video-call", {from:incomingVideoCall.id})
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14 ">
      <div>
        <Image
          src={incomingVideoCall.profilePicture}
          alt="Avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{incomingVideoCall.name}</div>
        <div className="text-xs">Incoming Video Call</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 p-1 px-3 text-sm rounded-full"
            onClick={rejectedCall}
          >
            <MdOutlineCallEnd className="text-3xl " />
          </button>
          <button
            className="bg-green-500 p-1 px-3 text-sm rounded-full"
            onClick={acceptCall}
          >
            <MdOutlineCall className="text-3xl " />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingVideoCall;
