import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineCallEnd } from "react-icons/md";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setcallAccepted] = useState(false);
  const [token, setToken] = useState(null);
  const [zgVar, setZgVar] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [publishStream, setPublishStream] = useState(null);

  useEffect(() => {
    if (data.type === "out-going")
      socket.current.on("accept-call", () => setcallAccepted(true));
    else setTimeout(() => setcallAccepted(true), 1000);
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: resToken },
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);

        setToken(resToken);
      } catch (error) {
        console.log(error);
      }
    };
    if (callAccepted && userInfo.id) getToken();
  }, [callAccepted, userInfo.id]);

  useEffect(() => {
    const startCall = async () => {
      const zg = new ZegoExpressEngine(
        parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID),
        process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
      );
      setZgVar(zg);

      await zg.loginRoom(
        data.roomId.toString(),
        token,
        { userID: userInfo.id.toString(), userName: userInfo.name },
        { userUpdate: true }
      );

      zg.on(
        "roomStreamUpdate",
        async (roomID, updateType, streamList, extendedData) => {
          console.log(updateType);
          if (updateType === "ADD") {
            const removeVideo = document.querySelector("#remote-video");
            const video = document.createElement(
              data.callType === "video" ? "video" : "audio"
            );
            video.id = streamList[0].streamID;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = false;

            zg.startPlayingStream(streamList[0].streamID, {
              audio: true,
              video: true,
            }).then((stream) => {
              video.srcObject = stream;
            });

            if (removeVideo) {
              removeVideo.appendChild(video);
            }
          } else if (
            updateType === "DELETE" &&
            zg &&
            localStream &&
            streamList[0].streamID
          ) {
            zg.destroyStream(localStream);
            zg.stopPlayingStream(streamList[0].streamID);
            zg.logoutRoom(data.roomId.toString());
            // Assuming dispatch is defined to manage state
            dispatch({ type: reducerCases.END_CALL });
          }
        }
      );

      const localStream = await zg.createStream({
        camera: {
          audio: true,
          video: data.callType == "video" ? true : false,
        },
      });

      const localVideo = document.querySelector("#local-audio");
      const videoElement = document.createElement(
        data.callType === "video" ? "video" : "audio"
      );
      videoElement.id = "video-local-zego";
      videoElement.classList = "h-28 w-32";
      videoElement.autoplay = true;
      videoElement.muted = false;
      videoElement.playsInline = true;

      localVideo.appendChild(videoElement);
      const td = document.getElementById("video-local-zego");
      if ("srcObject" in td) {
        td.srcObject = localStream;
        console.log(td);
      } else {
        td.src = URL.createObjectURL(localStream);
      }
      const streamID = "123" + Date.now();
      setPublishStream(streamID);
      setLocalStream(localStream);
      zg.startPublishingStream(streamID, localStream);
    };
    if (token) {
      startCall();
    }
  }, [token]);

  const endCall = () => {
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }
    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", {
        from: data.id,
      });
    } else {
      socket.current.emit("reject-video-call", {
        from: data.id,
      });
    }
    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video"
            ? "On going call"
            : "Calling"}
        </span>
      </div>
      {(!callAccepted || data.callType === "audio") && (
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="Avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      )}
      <div className="my-5 relative" id="remote-video">
        <div className="absolute border-5 right-5" id="local-audio"></div>
      </div>
      <div
        onClick={endCall}
        className="cursor-pointer h-16 w-16 bg-red-600 flex items-center justify-center rounded-full"
      >
        <MdOutlineCallEnd className="text-3xl " />
      </div>
    </div>
  );
}

export default Container;
