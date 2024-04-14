"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { io } from "socket.io-client";

export default function Home() {
  const socket = useRef<any>(null);
  // const [socket, setSocket] = useState<any>(null);
  const [connect, setConnect] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    console.log(socket);
    console.log(socket.current?.connected, connect);
    if (socket?.current?.connected && connect) {
      console.log("CONNECTING AUDIO");
      // console.log(socket);
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          console.log("streaming");
          // Handle the stream here
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(1024, 1, 1);

          source.connect(processor);
          processor.connect(audioContext.destination);

          processor.onaudioprocess = function (e) {
            // console.log("SENDING AUDIO");
            // Convert audio to a suitable format here, e.g., PCM
            const input = e.inputBuffer.getChannelData(0);
            // You could potentially compress or convert this data before sending
            // console.log("EMITTING AUDIO");
            if (socket?.current?.connected) {
              console.log("Audio buffer size:", input.length);
              socket?.current?.emit("send_audio", input.buffer);
            } else {
              console.log("socket not connected");
            }
          };
        })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
        });
    }
  }, [socket, connect]);

  useEffect(() => {
    return () => {
      socket?.current?.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   // const socket = io("https://sellme.onrender.com");
  //   socket.current = io("http://localhost:3001");

  //   socket?.current?.on("connect", () => {
  //     console.log("Connected:", socket.current.connected); // true
  //     console.log(socket.current.id);
  //   });

  //   socket?.current?.emit("register", userId);

  //   socket?.current?.on("receive_audio", function (data: any) {
  //     console.log("playing audio");
  //     playAudio(data);
  //   });

  //   // setSocket(socket);

  //   return () => {
  //     socket?.current?.disconnect();
  //   };
  // }, []);

  function playAudio(audioData: any) {
    const audioContext = new AudioContext();
    const buffer = new Float32Array(audioData); // Assuming audioData is a Float32Array buffer
    const audioBuffer = audioContext.createBuffer(
      1,
      buffer.length,
      audioContext.sampleRate
    );

    audioBuffer.copyToChannel(buffer, 0);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  function handlePress() {
    socket.current = io("https://sellme.onrender.com");

    socket?.current?.on("connect", () => {
      console.log("Connected:", socket.current.connected); // true
      console.log(socket.current.id);
    });

    socket?.current?.emit("register", userId);

    socket?.current?.on("receive_audio", function (data: any) {
      console.log("playing audio");
      playAudio(data);
    });
    setTimeout(() => setConnect(true), 3000);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input
        onChange={(e) => setUserId(e.target.value)}
        value={userId}
        className="bg-sky-400"
      />
      <button onClick={handlePress}>Connect</button>
      {/* {color && (
        <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
        </div>
      )} */}
    </main>
  );
}
