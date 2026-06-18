import React, { useEffect, useState } from "react";
import { GrClipboard } from "react-icons/gr";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import { useNavigate } from "react-router";
import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import Toast from "../../components/ToastMessage/Toast";
import axiosInstance from "../../utils/axiosInstance";
import AddEditNotes from "./AddEditNotes";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [userInfo, setUserInfo] = useState("null");
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const toastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  // Get user Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again later");
    }
  };

  // Delete Note
  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        toastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  // Search Notes
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update isPinned Status
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(
        "/update-note-pinned/" + noteId,
        {
          isPinned: !noteData.isPinned,
        }
      );

      if (response.data && response.data.note) {
        toastMessage("Note Pinned Successfully");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto">
        {allNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-24">
            {isSearch ? (
              <>
                <HiOutlineMagnifyingGlass className="text-9xl" />
                <p className="text-2xl font-medium">
                  {" "}
                  Nothing matches your seaarch
                </p>
              </>
            ) : (
              <>
                <GrClipboard className="text-9xl" />
                <p className="text-2xl font-medium">
                  {" "}
                  You haven't created any notes yet. Click on the plus (+) sign
                  below to create one
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item) => (
              <NoteCard
                key={item?._id}
                title={item?.title}
                date={item?.createdOn}
                content={item?.content}
                tags={item?.tags}
                isPinned={item?.isPinned}
                onEdit={() => {
                  handleEdit(item);
                }}
                onDelete={() => {
                  deleteNote(item);
                }}
                onPinNote={() => {
                  updateIsPinned(item);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-3xl text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentlabel=""
        className="w-2/5 max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          toastMessage={toastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
