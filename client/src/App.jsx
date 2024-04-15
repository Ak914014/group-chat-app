import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { groupIcon, heartIcon, emojiIcon } from "./assets";
import io from "socket.io-client";

const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"];
const socket = io("http://localhost:5000");
const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentions, setMentions] = useState([]);

  const now = new Date();
  const timeOptions = { hour: "2-digit", minute: "2-digit" };
  const currTime = now.toLocaleTimeString([], timeOptions);
  const emojiPickerRef = useRef(null);

  // Function to send a message to the server
  const sendMessageToServer = () => {
    if (inputText.trim() === "") return;
    const randomUser = user_list[Math.floor(Math.random() * user_list.length)];
    const message = {
      user: randomUser,
      text: inputText,
      likes: 0,
      mentions: [...mentions],
    };
    socket.emit("message", message);
   
  };

  // Function for sending message 
  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const randomUser = user_list[Math.floor(Math.random() * user_list.length)];
    const newMessage = {
      user: randomUser,
      text: inputText,
      likes: 0,
      mentions: [...mentions],
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setMentions([]);
  };

  
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
      sendMessageToServer();
    }
  };

  const handleLike = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].likes++;
    setMessages(updatedMessages);
  };

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setInputText(inputText + emoji);
  };

  const handleMentionClick = (username) => {
    setInputText((prevText) => {
      const textWithoutMention = prevText.replace(setMentions, "");
      return `${textWithoutMention}@${username} `;
    });
    setMentions([]);
  };

  const handleInputChange = (event) => {
    const text = event.target.value;
    setInputText(text);

    if (text.startsWith("@")) {
      setSuggestions(user_list);
    } else {
      setSuggestions([]);
    }
    const inputWords = text.split("");
    const lastWord = inputWords[inputWords.length - 1];
    const matchingUsers = user_list.filter((user) =>
      user.toLowerCase().startsWith(lastWord.toLowerCase())
    );
    setSuggestions(matchingUsers);
  };

  const handleSuggestionClick = (username) => {
    setInputText((prevText) => prevText.replace(/@\w+$/, `@${username}`));
    setSuggestions([]);
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.tagName !== "BUTTON"
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full relative h-screen z-0 bg-white px-5 py-3 sm:px-10 sm:py-6 md:px-20 md:py-10 ">
      <div className="flex-grow w-full bg-[#EDF1F5] rounded-lg p-4 sm:p-6">
        {/* Navbar */}
        <div className="w-full border-b-2 border-gray-400 pb-3 flex justify-between">
          <div>
            <h1 className="font-bold text-xl ">Introductions</h1>
            <h3 className="text-gray-500">
              This Channel is For Company Wide Chatter
            </h3>
          </div>
          <div className="flex text-gray-500 gap-5 mt-2">
            <span className=" inline-block"> 3 | 100</span>
            <div className=" inline-block w-7">{groupIcon}</div>
          </div>
        </div>

        {/* All chats */}
        <div className="flex-grow h-[65vh]  mt-4 p-4 sm:p-6 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className="flex  justify-between items-center mb-2"
            >
              <div className="flex">
                <div className=" w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                  {message.user.charAt(0)}
                </div>
                <h1 className="">
                  {message.user} <span className="text-sm">{currTime}</span>
                  <h3 className="bg-white p-2 rounded-r-lg rounded-b-lg">
                    {message.text.split(" ").map((word, i) => {
                      if (message.mentions.includes(word)) {
                        return (
                          <span
                            key={i}
                            className="text-blue-500 underline cursor-pointer"
                            onClick={() =>
                              handleMentionClick(word.substring(1))
                            }
                          >
                            {word}&nbsp;
                          </span>
                        );
                      }
                      return <span key={i}>{word}&nbsp;</span>;
                    })}
                  </h3>
                </h1>
              </div>
              {/* Likes */}
              <div>
                <button className="flex " onClick={() => handleLike(index)}>
                  <span className="w-6">{heartIcon}</span>
                  <span className=" text-gray-500 text-sm ml-2 ">
                    {message.likes}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ChatBox */}
        <div className="flex items-center border-2 border-gray-500 rounded-3xl p-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-grow bg-[#EDF1F5] outline-none px-2 py-1 mr-2"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          {suggestions.length > 0 && (
            <ul className=" w-full flex gap-2">
              {suggestions.map((username) => (
                <li
                  key={username}
                  onClick={() => handleSuggestionClick(username)}
                >
                  {username}
                </li>
              ))}
            </ul>
          )}

          <button
            className="ml-2 w-8 "
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {emojiIcon}
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute z-10 sm:top-56  lg:top-28 right-40"
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
